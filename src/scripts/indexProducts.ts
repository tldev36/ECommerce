import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

async function main() {
  const products = await prisma.products.findMany();

  for (const p of products) {
    const text = `${p.name}. ${p.description ?? ""}`;

    const result = await model.embedContent(text);
    const embedding = result.embedding.values; // number[]

    // Update vector field bằng raw SQL vì Prisma không support vector
    await prisma.$executeRaw`
      UPDATE "products"
      SET embedding = ${embedding}
      WHERE id = ${p.id};
    `;

    console.log("Indexed product ID", p.id);
  }

  console.log("✅ Done!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
