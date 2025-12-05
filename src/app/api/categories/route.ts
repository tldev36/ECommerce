import { prisma } from "@/lib/prisma";

export async function GET() {
  const data = await prisma.categories.findMany({
      where: {
        status: true,
      },
      orderBy: {
        id: "desc",
      },
    });
  
  return Response.json(data);
}
