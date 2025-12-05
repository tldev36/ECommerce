// import { prisma } from "@/lib/prisma";
// import { createQueryEmbedding, findSimilarProducts, buildPrompt, getAnswerFromGemini } from "@/lib/chatHelpers";

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     const { question } = body;
//     console.log("💬 Received question:", question);
//     if (!question) return new Response(JSON.stringify({ error: "Missing question" }), { status: 400 });

//     const queryVector = await createQueryEmbedding(question);
//     const products = await findSimilarProducts(queryVector);
//     const prompt = buildPrompt(question, products);
//     const answer = await getAnswerFromGemini(prompt);

//     await prisma.chatlog.create({
//       data: { question, answer, createdAt: new Date() },
//     });

//     return new Response(JSON.stringify({ answer, products }), { status: 200 });
//   } catch (error) {
//     console.error("❌ API /chat error:", error);
//     return new Response(JSON.stringify({ error: (error as any).message || "Internal Server Error" }), { status: 500 });
//   }
// }

// src/app/api/chat/route.js
const { prisma } = require("@/lib/prisma");
const {
  createQueryEmbedding,
  findSimilarProducts,
  buildPrompt,
  getAnswerFromGemini,
} = require("@/lib/chatHelpers"); // import file JS mới

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { question } = body;
    console.log("💬 Received question:", question);
    if (!question)
      return new Response(JSON.stringify({ error: "Missing question" }), {
        status: 400,
      });

    // Tạo embedding
    const queryVector = await createQueryEmbedding(question);

    // Lấy sản phẩm gần nhất
    const products = await findSimilarProducts(queryVector);

    // Tạo prompt
    const prompt = buildPrompt(question, products);

    // Gọi Gemini AI
    const answer = await getAnswerFromGemini(prompt);

    // Lưu chat log
    await prisma.chatlog.create({
      data: { question, answer, createdAt: new Date() },
    });

    return new Response(
      JSON.stringify({ answer, products }),
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ API /chat error:", error);
    return new Response(
      JSON.stringify({ error: error || "Internal Server Error" }),
      { status: 500 }
    );
  }
}
