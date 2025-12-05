import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) throw new Error("Chưa cấu hình GEMINI_API_KEY");

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    if (!message) return NextResponse.json({ reply: "Thiếu câu hỏi." }, { status: 400 });

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    // Gọi Gemini AI
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message,
      config: {
        temperature: 0.3, // Tùy chỉnh sáng tạo
        systemInstruction: "Bạn là trợ lý bán sản phẩm nông sản."
      }
    });

    // TypeScript chưa có type sẵn cho SDK, nên ép kiểu tạm
    const reply = (response as any)?.text || "Xin lỗi, không có phản hồi.";

    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ reply: "Lỗi server: " + err.message }, { status: 500 });
  }
}
