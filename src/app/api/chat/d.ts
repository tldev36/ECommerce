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

        // BƯỚC 1: Dùng AI "thông dịch" câu hỏi thường thành điều kiện lọc Database
        // Kỹ thuật này gọi là "Text-to-SQL" dạng đơn giản hóa
        const filterPrompt = `
        Phân tích câu hỏi người dùng thành các tiêu chí lọc sản phẩm.
        Câu hỏi: "${message}"
        
        Output JSON format:
        {
            "keywords": ["từ khóa 1", "từ khóa 2"], // Bỏ các từ vô nghĩa như "là gì", "bao nhiêu", "shop ơi"
            "price_range": { "min": number | null, "max": number | null },
            "sort": "price_asc" | "price_desc" | "newest" | "relevance",
            "intent": "check_stock" | "check_price" | "consultation" | "greeting"
        }
        Chỉ trả về JSON.
        `;

        const filterResponse = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: filterPrompt,
            config: { responseMimeType: "application/json" } // Force JSON mode (Gemini 1.5/2.0 feature)
        });

        const rawFilterText = filterResponse.text || "{}";
        const filters = JSON.parse(rawFilterText);
        console.log("🧠 AI Analyzed Filters:", filters);

        // BƯỚC 2: Build Query Prisma thông minh
        const whereInput: any = { is_active: true };

        // Xử lý keyword thông minh hơn (AND logic)
        if (filters.keywords && filters.keywords.length > 0) {
            whereInput.AND = filters.keywords.map((w: string) => ({
                OR: [
                    { name: { contains: w, mode: "insensitive" } },
                    { description: { contains: w, mode: "insensitive" } }
                ]
            }));
        }

        // Xử lý giá
        if (filters.price_range?.min !== null || filters.price_range?.max !== null) {
            whereInput.price = {};
            if (filters.price_range.min) whereInput.price.gte = filters.price_range.min;
            if (filters.price_range.max) whereInput.price.lte = filters.price_range.max;
        }

        // Xử lý sort
        let orderBy = {};
        switch (filters.sort) {
            case "price_asc": orderBy = { price: 'asc' }; break;
            case "price_desc": orderBy = { price: 'desc' }; break;
            case "newest": orderBy = { created_at: 'desc' }; break;
            default: orderBy = { created_at: 'desc' }; // Mặc định
        }

        // BƯỚC 3: Query Database (Fetch 1 lần duy nhất - Optimize N+1)
        const products = await prisma.products.findMany({
            where: whereInput,
            select: { name: true, description: true, price: true, unit: true, stock_quantity: true },
            orderBy: orderBy,
            take: 5,
        });

        // BƯỚC 4: Tạo câu trả lời cuối cùng
        let finalPrompt = "";

        if (products.length === 0) {
            finalPrompt = `Khách hỏi: "${message}". Không tìm thấy sản phẩm nào khớp tiêu chí. Hãy xin lỗi và gợi ý khách tìm từ khóa khác ngắn gọn hơn.`;
        } else {
            const productInfo = products.map(p =>
                `- ${p.name}: ${Number(p.price).toLocaleString()}đ/${p.unit} (Kho: ${p.stock_quantity})`
            ).join("\n");

            finalPrompt = `
             Bạn là chuyên gia nông sản.
             Câu hỏi: "${message}"
             Sản phẩm tìm được:
             ${productInfo}
             
             Yêu cầu:
             - Trả lời đúng trọng tâm câu hỏi (nếu hỏi giá thì báo giá, hỏi tồn kho thì báo tồn kho).
             - Văn phong thân thiện, mời gọi mua hàng.
             `;
        }

        const replyRes = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: finalPrompt
        });

        const replyText = replyRes.text || "Xin lỗi, hệ thống không trả về nội dung.";
        const cleanReply = replyText.replace(/\*\*/g, "");
        console.log("💡 Final Reply:", cleanReply);
        return NextResponse.json({ reply: cleanReply });

    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ reply: "Hệ thống đang bận, vui lòng thử lại sau." }, { status: 500 });
    }
}