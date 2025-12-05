import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { prisma } from "@/lib/prisma";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) throw new Error("Chưa cấu hình GEMINI_API_KEY");

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const message = body.message || body.question;
        console.log("💬 Received message:", message);

        if (!message) {
            console.warn("⚠️ Thiếu câu hỏi trong body");
            return NextResponse.json({ reply: "Thiếu câu hỏi." }, { status: 400 });
        }

        const keyword = message.toLowerCase().trim();

        // 1️⃣ Tìm exact match trên tên sản phẩm trước
        let products = await prisma.products.findMany({
            where: {
                is_active: true,
                OR: [
                    { name: { equals: keyword, mode: "insensitive" } },
                    { description: { contains: keyword, mode: "insensitive" } },
                ],
            },
            select: { id: true, name: true, description: true },
            take: 5,
        });

        // 2️⃣ Nếu không có exact match, thử contains từng từ
        if (products.length === 0) {
            const words = keyword.split(" ");
            products = await prisma.products.findMany({
                where: {
                    is_active: true,
                    OR: words.map((w: any)=> ({
                        OR: [
                            { name: { contains: w, mode: "insensitive" } },
                            { description: { contains: w, mode: "insensitive" } },
                        ],
                    })),
                },
                select: { id: true, name: true, description: true },
                take: 5,
            });
        }

        console.log("📦 Products found:", products);

        // lấy thông tin chi tiết sản phẩm
        const productDetails = await Promise.all(
            products.map(async (p) => {
                return await prisma.products.findUnique({
                    where: { id: p.id },
                    select: {
                        name: true,
                        description: true,
                        price: true,
                        unit: true,
                        
                        stock_quantity: true,
                    },
                });
            })
        );

        let prompt: string;

        if (products.length > 0) {
            const productText = productDetails
                .map(p =>
                    `- Tên: ${p?.name}
  Mô tả: ${p?.description ?? "Không có mô tả"}
  Giá: ${p?.price ?? "Chưa có giá"} 
  Trọng lượng: ${p?.unit ?? "Chưa có"} 
   
  Tồn kho: ${p?.stock_quantity ?? "Chưa có"}`
                )
                .join("\n\n");

            prompt = `
Bạn là trợ lý bán hàng cho cửa hàng nông sản. Trả lời câu hỏi dựa trên dữ liệu sản phẩm dưới đây. 
Hãy mô tả chi tiết thông tin sản phẩm, nhưng không thêm thông tin ngoài dữ liệu này.

Câu hỏi: ${message}

Dữ liệu sản phẩm:
${productText}

Trả lời ngắn gọn, dễ hiểu, đầy đủ thông tin.
  `;
        }
        else {
            prompt = `
Bạn là trợ lý bán hàng cho cửa hàng nông sản. Trả lời câu hỏi dựa trên dữ liệu sản phẩm có sẵn.
Câu hỏi: ${message}

Không có sản phẩm nào khớp với câu hỏi. Hãy trả lời ngắn gọn: "Xin lỗi, không tìm thấy sản phẩm phù hợp."
      `;
        }

        console.log("📝 Generated prompt:\n", prompt);

        // 3️⃣ Gọi Gemini AI
        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.2,
                systemInstruction: "Bạn là trợ lý bán sản phẩm nông sản.",
                maxOutputTokens: 256,
            },
        });

        const reply = (response as any)?.text || "Xin lỗi, không có phản hồi.";
        console.log("🤖 Gemini response:", reply);

        // 4️⃣ Lưu chat log (tùy chọn)
        await prisma.chatlog.create({
            data: { question: message, answer: reply, createdAt: new Date() },
        });

        return NextResponse.json({ reply });
    } catch (err: any) {
        console.error("❌ API /chat error:", err);
        return NextResponse.json({ reply: "Lỗi server: " + err.message }, { status: 500 });
    }
}
