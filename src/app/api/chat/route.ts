export const maxDuration = 60;
export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { prisma } from "@/lib/prisma";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) throw new Error("Chưa cấu hình GEMINI_API_KEY");
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const message = body.message || body.question;
        console.log("💬 User message:", message);

        if (!message) return NextResponse.json({ reply: "Xin chào, tôi có thể giúp gì?" });

        // 🟢 BƯỚC 0: Lấy danh sách Category để map
        const categoriesDB = await prisma.categories.findMany({ select: { id: true, name: true } });
        const categoryNames = categoriesDB.map(c => c.name).join(", ");

        // 🟢 BƯỚC 1: AI Phân loại Intent (QUAN TRỌNG NHẤT)
        // Ta dạy AI phân biệt rõ: Đang hỏi về "Cả nhóm" hay "Một món cụ thể"
        const analyzePrompt = `
        Bạn là bộ phân tích ý định khách hàng (Intent Classifier).
        Danh sách danh mục: [${categoryNames}]
        Câu hỏi: "${message}"

        Hãy xác định ý định (intent) và trích xuất dữ liệu:
        1. "category_overview": Hỏi tổng quát về danh mục (VD: "Có rau gì?", "Bán trái cây không?", "Thịt có bao nhiêu loại?").
        2. "product_detail": Hỏi chi tiết về sản phẩm cụ thể (VD: "Giá táo?", "Xà lách còn không?", "Nho Mỹ ngon không?").
        3. "other": Chào hỏi hoặc không rõ.

        Output JSON:
        {
            "intent": "category_overview" | "product_detail" | "other",
            "category_detected": "Tên danh mục chính xác nếu có" | null,
            "product_keywords": ["từ khóa tìm sp"] // Chỉ điền nếu là product_detail
        }
        `;

        console.log("🤖 Analyzing intent...");
        const analyzeRes = await ai.models.generateContent({
            model: "gemini-2.5-flash", // Dùng bản này cho nhanh  gemini-1.5-flash
            contents: analyzePrompt,
            config: { responseMimeType: "application/json" }
        });

        const analysis = JSON.parse(analyzeRes.text || "{}");
        console.log("🧠 Analysis:", analysis);

        // 🟢 BƯỚC 2: Xử lý Logic riêng biệt cho từng Intent
        let finalPrompt = "";
        let contextData = "";

        // ---------------------------------------------------------
        // TRƯỜNG HỢP 1: HỎI VỀ DANH MỤC (CATEGORY OVERVIEW)
        // ---------------------------------------------------------
        if (analysis.intent === "category_overview" && analysis.category_detected) {
            const cat = categoriesDB.find(c => c.name === analysis.category_detected);
            if (cat) {
                // Đếm số lượng
                const count = await prisma.products.count({
                    where: { category_id: cat.id, is_active: true }
                });
                // Lấy 5 sản phẩm tiêu biểu để khoe
                const topProducts = await prisma.products.findMany({
                    where: { category_id: cat.id, is_active: true },
                    select: { name: true, price: true, discount: true },
                    take: 5,
                    orderBy: { created_at: 'desc' } // Hoặc order theo bán chạy
                });

                // const listStr = topProducts.map(p => `- ${p.name}`).join("\n");
                const listStr = topProducts.map(p => {
                    const originalPrice = Number(p.price);
                    const discount = p.discount ? Number(p.discount) : 0;

                    if (discount > 0) {
                        const finalPrice = originalPrice * (1 - discount / 100);
                        return `- ${p.name}: ${finalPrice.toLocaleString()}đ (Giảm ${discount}% từ ${originalPrice.toLocaleString()}đ)`;
                    } else {
                        return `- ${p.name}: ${originalPrice.toLocaleString()}đ`;
                    }
                }).join("\n");

                // Prompt chuyên biệt cho danh mục
                finalPrompt = `
                Vai trò: Quản lý kho hàng thông thái.
                Khách hỏi về danh mục: "${cat.name}".
                
                Dữ liệu thực tế:
                - Tổng số sản phẩm đang có: ${count} loại.
                - Một số sản phẩm tiêu biểu:
                ${listStr}

                Yêu cầu trả lời:
                1. Thông báo rõ số lượng sản phẩm trong danh mục này.
                2. Liệt kê các sản phẩm tiêu biểu ở trên.
                3. Hỏi khách muốn xem chi tiết món nào trong số đó không.
                4. Văn phong: Tự tin, bao quát, chuyên nghiệp.
                5. Liệt kê tên sản phẩm sử dụng dấu "," để ngăn cách.
                `;
            } else {
                finalPrompt = `Khách hỏi về danh mục "${analysis.category_detected}" nhưng hệ thống không tìm thấy ID khớp. Hãy xin lỗi và liệt kê các danh mục đang có: ${categoryNames}.`;
            }
        }

        // ---------------------------------------------------------
        // TRƯỜNG HỢP 2: HỎI VỀ SẢN PHẨM CỤ THỂ (PRODUCT DETAIL)
        // ---------------------------------------------------------
        else if (analysis.intent === "product_detail" || (analysis.intent === "category_overview" && !analysis.category_detected)) {
            // Logic tìm kiếm sản phẩm như cũ
            const keywords = analysis.product_keywords || [];
            if (keywords.length === 0) keywords.push(message); // Fallback nếu AI không tách được key

            const products = await prisma.products.findMany({
                where: {
                    is_active: true,
                    AND: keywords.map((w: string) => ({
                        OR: [
                            { name: { contains: w, mode: "insensitive" } },
                            { description: { contains: w, mode: "insensitive" } }
                        ]
                    }))
                },
                select: { name: true, price: true, discount: true, unit: true, stock_quantity: true, description: true },
                take: 3
            });

            if (products.length > 0) {
                const productInfo = products.map(p => {
                    const originalPrice = Number(p.price);
                    const discount = p.discount ? Number(p.discount) : 0;

                    let priceString = "";

                    // 👇 Logic tính giá mới
                    if (discount > 0) {
                        const finalPrice = originalPrice * (1 - discount / 100);
                        priceString = `Giá SALE: ${finalPrice.toLocaleString()}đ (Gốc: ${originalPrice.toLocaleString()}đ - Đang giảm ${discount}%)`;
                    } else {
                        priceString = `Giá: ${originalPrice.toLocaleString()}đ`;
                    }

                    return `📦 ${p.name}
              - ${priceString}
              - Tồn kho: ${p.stock_quantity}
              - Mô tả: ${p.description}`;
                }).join("\n\n");

                // Prompt chuyên biệt cho bán hàng chi tiết
                finalPrompt = `
                Vai trò: Nhân viên Sales nhiệt tình, chốt đơn.
                Khách hỏi: "${message}"
                
                Dữ liệu sản phẩm tìm thấy:
                ${productInfo}

                Yêu cầu trả lời:
                1. Cung cấp thông tin chi tiết (Giá, mô tả) của sản phẩm.
                2. Nếu tồn kho ít (<10), hãy giục khách mua nhanh kẻo hết.
                3. Gợi ý công dụng hoặc món ăn ngon từ sản phẩm (dựa vào mô tả).
                4. Văn phong: Thân thiện, mời gọi, dùng emoji nông sản.
                5. Kết thúc bằng câu hỏi mở để dẫn dắt khách mua hàng.
                `;
            } else {
                finalPrompt = `Khách hỏi: "${message}". Không tìm thấy sản phẩm nào. Hãy khéo léo xin lỗi và gợi ý khách xem các danh mục: ${categoryNames}.`;
            }
        }

        // ---------------------------------------------------------
        // TRƯỜNG HỢP 3: KHÁC (Chào hỏi, chém gió)
        // ---------------------------------------------------------
        else {
            finalPrompt = `Khách nói: "${message}". Bạn là trợ lý bán nông sản ảo. Hãy trả lời thân thiện, ngắn gọn và lái câu chuyện về việc mua rau củ quả.`;
        }

        // 🟢 BƯỚC 3: Sinh câu trả lời cuối cùng
        const replyRes = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: finalPrompt
        });

        const replyText = replyRes.text || "Hệ thống đang bận xíu.";
        const cleanReply = replyText.replace(/\*/g, ""); // Xóa markdown theo yêu cầu

        return NextResponse.json({ reply: cleanReply });

    } catch (error: any) {
        console.error("🔥 Error:", error);
        return NextResponse.json({ reply: "Hệ thống đang bảo trì, bạn thử lại sau nhé!" }, { status: 500 });
    }
}