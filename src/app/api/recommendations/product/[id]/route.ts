// /app/api/recommendations/product/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: { id: string };
}

export async function GET(req: Request, { params }: Params) {
  try {
    const productId = Number(params.id);
    if (!productId) throw new Error("Invalid product id");

    // ✅ Lấy thông tin sản phẩm hiện tại
    const product = await prisma.products.findUnique({
      where: { id: productId },
    });
    if (!product) throw new Error("Product not found");

    // ✅ Sản phẩm tương tự (cùng category, tags, region)
    const similarProducts = await prisma.products.findMany({
      where: {
        id: { not: productId },
        is_active: true,
        OR: [
          { category_id: product.category_id },
          {
            tags: {
              hasSome: product.tags ?? [],
            },
          },
          {
            region: {
              hasSome: product.region ?? [],
            },
          },
        ],
      },
      orderBy: { popularity: "desc" },
      take: 6,
    });

    // ✅ Người mua sản phẩm này cũng mua...
    // 1️⃣ Tìm user_id đã tương tác với product này
    const users = await prisma.user_product_interactions.findMany({
      where: { product_id: productId },
      select: { user_id: true },
      distinct: ["user_id"],
    });

    const userIds = users.map((u) => u.user_id);

    // 2️⃣ Lấy các sản phẩm khác họ từng tương tác
    const alsoBought = await prisma.user_product_interactions.findMany({
      where: {
        user_id: { in: userIds },
        product_id: { not: productId },
      },
      include: { products: true },
    });

    // 3️⃣ Gom nhóm & đếm tần suất
    const countMap: Record<number, number> = {};
    alsoBought.forEach((i) => {
      countMap[i.product_id] = (countMap[i.product_id] || 0) + 1;
    });

    const ranked = Object.entries(countMap)
      .sort((a, b) => Number(b[1]) - Number(a[1]))
      .slice(0, 6)
      .map(([pid]) => Number(pid));

    const alsoBoughtProducts = await prisma.products.findMany({
      where: { id: { in: ranked }, is_active: true },
    });

    return NextResponse.json({
      similarProducts,
      alsoBoughtProducts,
    });
  } catch (error) {
    console.error("Error in product recommendations:", error);
    return NextResponse.json(
      { error: "Failed to get product recommendations" },
      { status: 500 }
    );
  }
}
