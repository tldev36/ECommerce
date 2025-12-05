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

        if (!message) return NextResponse.json({ reply: "Xin chào, tôi có thể giúp gì?" });

        // 🟢 BƯỚC 0: Lấy danh sách danh mục hiện có để "dạy" cho AI
        // (Lưu ý: Nếu danh mục ít < 100, fetch mỗi request không vấn đề. Nếu nhiều thì nên cache)
        const categoriesDB = await prisma.categories.findMany({
            select: { id: true, name: true }
        });
        const categoryNames = categoriesDB.map(c => c.name).join(", ");

        // 🟢 BƯỚC 1: AI Phân tích & Mapping Category
        const filterPrompt = `
        Bạn là bộ lọc thông minh.
        Danh sách danh mục hợp lệ trong hệ thống: [${categoryNames}]

        Câu hỏi: "${message}"

        Nhiệm vụ:
        1. Xác định xem người dùng có đang hỏi về một Danh mục cụ thể không?
        2. Nếu có, hãy map câu hỏi về tên danh mục chính xác nhất trong danh sách trên.
        3. Nếu không khớp danh mục nào, để null.
        
        Output JSON format:
        {
            "category_name": "Tên danh mục chính xác" | null, 
            "keywords": ["từ khóa tìm sp"], // VD: khách hỏi "táo trong trái cây" -> keyword: "táo", category: "Trái cây"
            "intent": "count_category" | "find_product" | "other"
        }
        Chỉ trả về JSON.
        `;

        const filterResponse = await ai.models.generateContent({
            model: "gemini-2.0-flash", // Dùng 1.5 cho nhanh
            contents: filterPrompt,
            config: { responseMimeType: "application/json" }
        });

        const filters = JSON.parse(filterResponse.text || "{}");
        console.log("🧠 AI Logic:", filters);

        // 🟢 BƯỚC 2: Xây dựng Query Prisma Dynamic
        let products: any[] = [];
        let totalCount = 0;
        let categoryFoundName = "";

        // TRƯỜNG HỢP A: Khách hỏi về Danh mục (VD: "Có bao nhiêu loại rau củ?")
        if (filters.category_name) {
            // Tìm ID của danh mục AI đã map
            const targetCategory = categoriesDB.find(c => c.name === filters.category_name);

            if (targetCategory) {
                categoryFoundName = targetCategory.name;

                // Query 1: Đếm tổng sản phẩm trong danh mục
                totalCount = await prisma.products.count({
                    where: { 
                        is_active: true, 
                        category_id: targetCategory.id 
                    }
                });

                // Query 2: Lấy 3 sản phẩm mẫu (Top selling hoặc mới nhất)
                products = await prisma.products.findMany({
                    where: { 
                        is_active: true, 
                        category_id: targetCategory.id 
                    },
                    select: { name: true, price: true, unit: true, stock_quantity: true },
                    orderBy: { created_at: 'desc' }, // Hoặc sold_count: 'desc'
                    take: 3 // Gợi ý 3 cái thôi
                });
            }
        } 
        
        // TRƯỜNG HỢP B: Tìm kiếm từ khóa thông thường (Fallback)
        if (products.length === 0 && (!filters.category_name)) {
            const whereInput: any = { is_active: true };
            if (filters.keywords && filters.keywords.length > 0) {
                 whereInput.AND = filters.keywords.map((w: string) => ({
                    OR: [
                        { name: { contains: w, mode: "insensitive" } },
                        { description: { contains: w, mode: "insensitive" } }
                    ]
                }));
            }
            products = await prisma.products.findMany({
                where: whereInput,
                select: { name: true, price: true, unit: true, stock_quantity: true },
                take: 5
            });
        }

        // 🟢 BƯỚC 3: Tạo Prompt trả lời cuối cùng
        let finalPrompt = "";
        
        // Logic tạo prompt dựa trên ngữ cảnh Category
        if (categoryFoundName) {
            const productListStr = products.map(p => `- ${p.name} (${Number(p.price).toLocaleString()}đ)`).join("\n");
            finalPrompt = `
            Người dùng hỏi về danh mục: "${categoryFoundName}".
            Dữ liệu hệ thống:
            - Tổng số lượng sản phẩm: ${totalCount}
            - Một vài sản phẩm tiêu biểu đang có:
            ${productListStr}
            
            Hãy trả lời: "Dạ, bên em hiện có ${totalCount} sản phẩm thuộc nhóm ${categoryFoundName} ạ. Một số loại nổi bật như... Anh/Chị muốn xem chi tiết loại nào không?"
            (Văn phong tự nhiên, thân thiện).
            `;
        } else if (products.length > 0) {
            // Logic trả lời tìm kiếm sản phẩm thường
            const productInfo = products.map(p => `- ${p.name}: ${Number(p.price).toLocaleString()}đ`).join("\n");
            finalPrompt = `Trả lời câu hỏi: "${message}". Dựa trên sản phẩm: \n${productInfo}. Văn phong bán hàng khéo léo.`;
        } else {
            finalPrompt = `Khách hỏi: "${message}". Không tìm thấy sản phẩm hay danh mục nào phù hợp. Xin lỗi và gợi ý các danh mục đang có: ${categoryNames}.`;
        }

        const replyRes = await ai.models.generateContent({
            model: "gemini-2.0-flash", // Dùng model xịn để viết văn hay
            contents: finalPrompt
        });

        const replyText = replyRes.text || "Xin lỗi, hệ thống đang bận.";
        const cleanReply = replyText.replace(/\*\*/g, ""); // Xóa markdown

        return NextResponse.json({ reply: cleanReply });

    } catch (error: any) {
        console.error("🔥 Error:", error);
        return NextResponse.json({ reply: "Hệ thống đang bảo trì một chút, bạn chờ xíu nhé!" }, { status: 500 });
    }
}