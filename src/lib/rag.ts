import { prisma } from "@/lib/prisma";
import { createEmbedding } from "./gemini";

// const prisma = new PrismaClient();

export async function getRelatedContext(query: string) {
  const qVector = await createEmbedding(query);

  const result = await prisma.$queryRawUnsafe<any[]>(`
    SELECT id, name, description
    FROM "Product"
    ORDER BY embedding <-> '[${qVector.join(",")}]'
    LIMIT 3;
  `);

  return result.map(r => `${r.name}: ${r.description}`).join("\n");
}
