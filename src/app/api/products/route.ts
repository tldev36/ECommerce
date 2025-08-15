import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.products.findMany({
      include: {
        categories: true, // Lấy luôn thông tin category
      },
      orderBy: {
        id: "asc",
      },
    });

    return Response.json(products);
  } catch (error) {
    console.error("Lỗi khi lấy products:", error);
    return Response.json({ error: "Không thể lấy danh sách sản phẩm" }, { status: 500 });
  }
}
