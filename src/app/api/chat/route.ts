import { NextResponse } from "next/server";

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ reply: "Thiếu nội dung tin nhắn." }, { status: 400 });
    }

    const API_KEY = process.env.GOOGLE_API_KEY;
    if (!API_KEY) {
      return NextResponse.json({ reply: "Chưa cấu hình GOOGLE_API_KEY" }, { status: 500 });
    }

    // ✅ Dùng model đúng: gemini-2.0-flash (công khai & ổn định)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: message }],
          },
        ],
      }),
    });

    const data = await response.json();

    // Lấy text trả lời từ Gemini
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      data?.error?.message ||
      "Không có phản hồi từ Gemini.";

    return NextResponse.json({ reply });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Gemini API Error:", message);
    return NextResponse.json({ reply: "Lỗi: " + message }, { status: 500 });
  }
}
