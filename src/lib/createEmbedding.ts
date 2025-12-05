import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

async function createQueryEmbedding(question: string) {
  const result = await model.embedContent(question);
  return result.embedding.values; // array number[]
}
