import { prisma } from "@/lib/prisma";

export async function GET() {
  const products = await prisma.products.findMany({
    where: { featured: true },
    include: {
      categories: true,
    },
    orderBy: { id: "asc" },
  });

  return Response.json(products);
}

