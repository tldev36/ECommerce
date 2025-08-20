import { prisma } from "@/lib/prisma";

// GET all products
export async function GET() {
  const products = await prisma.products.findMany({
    include: {
      categories: true, // lấy cả thông tin category
    },
    orderBy: { id: "asc" },
  });
  return Response.json(products);
}

