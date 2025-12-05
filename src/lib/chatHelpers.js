const { prisma } = require("@/lib/prisma");
const { GoogleGenAI } = require("@google/genai");

// Khởi tạo Gemini AI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
});

/** Tạo embedding cho câu hỏi */
async function createQueryEmbedding(question) {
  // generate embedding qua models
  const result = await ai.models.generateEmbedding({
    model: "text-embedding-004",
    input: question,
  });
  return result.data[0].embedding; // number[]
}

/** Tìm sản phẩm gần nhất dựa trên embedding */
async function findSimilarProducts(queryVector, topK = 5) {
  return prisma.$queryRaw`
    SELECT id, name, description
    FROM "products"
    WHERE embedding IS NOT NULL
    ORDER BY embedding <-> ${queryVector}::vector
    LIMIT ${topK};
  `;
}

/** Xây dựng prompt cho Gemini */
function buildPrompt(question, products) {
  const contextText = products
    .map(p => `Tên: ${p.name}, Mô tả: ${p.description ?? ""}`)
    .join("\n");

  return `
Bạn là trợ lý bán hàng cho cửa hàng. Trả lời câu hỏi dựa trên dữ liệu sản phẩm dưới đây. Không thêm thông tin ngoài dữ liệu này.

Câu hỏi: ${question}

Dữ liệu sản phẩm:
${contextText}

Trả lời ngắn gọn, dễ hiểu, đúng thông tin sản phẩm.
`;
}

/** Gọi Gemini AI (model: gemini-2.5-flash) */
async function getAnswerFromGemini(prompt) {
  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: { temperature: 0.2, maxOutputTokens: 256 },
  });

  return result.text ?? String(result);
}

module.exports = {
  createQueryEmbedding,
  findSimilarProducts,
  buildPrompt,
  getAnswerFromGemini,
};
