// import { prisma } from "@/lib/prisma";
// import { GoogleGenAI } from "@google/genai";


// const ai = new GoogleGenAI({
//   apiKey: process.env.GEMINI_API_KEY,
// });


// export async function createQueryEmbedding(question: string): Promise<number[]> {
//   const response = await ai.embeddings.create({
//     model: "text-embedding-004",
//     input: question,
//   });

//   return response.data[0].embedding;
// }


// export async function findSimilarProducts(
//   queryVector: number[],
//   topK = 5
// ): Promise<{ id: number; name: string; description: string }[]> {
//   return prisma.$queryRaw<
//     { id: number; name: string; description: string }[]
//   >`
//     SELECT id, name, description
//     FROM "products"
//     WHERE embedding IS NOT NULL
//     ORDER BY embedding <-> ${queryVector}::vector
//     LIMIT ${topK};
//   `;
// }


// export function buildPrompt(question: string, products: Array<{ name: string; description?: string }>): string {
//   const contextText = products
//     .map(p => `Tên: ${p.name}, Mô tả: ${p.description ?? ""}`)
//     .join("\n");

//   return `
// Bạn là trợ lý bán hàng cho cửa hàng. Trả lời câu hỏi dựa trên dữ liệu sản phẩm dưới đây. Không thêm thông tin ngoài dữ liệu này.

// Câu hỏi: ${question}

// Dữ liệu sản phẩm:
// ${contextText}

// Trả lời ngắn gọn, dễ hiểu, đúng thông tin sản phẩm.
// `;
// }


// export async function getAnswerFromGemini(prompt: string): Promise<string> {
//   const result = await ai.models.generateContent({
//     model: "gemini-2.5-flash",
//     contents: prompt,
//     config: {
//       temperature: 0.2,
//       maxOutputTokens: 256,
//     },
//   });

//   return result.text ?? String(result);
// }
