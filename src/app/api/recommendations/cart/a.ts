// /app/api/recommendations/cart/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { cartProductIds } = await req.json(); // mảng ID sản phẩm trong giỏ hàng
    if (!cartProductIds || cartProductIds.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // 1️⃣ Lấy thông tin chi tiết các sản phẩm trong giỏ
    const cartProducts = await prisma.products.findMany({
      where: { id: { in: cartProductIds }, is_active: true },
    });

    // 2️⃣ Tổng hợp tags + region từ các sản phẩm trong giỏ
    const tags = new Set<string>();
    const regions = new Set<string>();

    cartProducts.forEach((p) => {
      p.tags?.forEach((t) => tags.add(t));
      p.region?.forEach((r) => regions.add(r));
    });

    // 3️⃣ Tìm sản phẩm có tags hoặc region tương đồng
    const suggested = await prisma.products.findMany({
      where: {
        is_active: true,
        id: { notIn: cartProductIds },
        OR: [
          { tags: { hasSome: Array.from(tags) } },
          { region: { hasSome: Array.from(regions) } },
        ],
      },
      orderBy: { popularity: "desc" },
      take: 10,
    });

    // 4️⃣ Nếu không có kết quả, fallback theo sản phẩm phổ biến
    if (suggested.length === 0) {
      const fallback = await prisma.products.findMany({
        where: { is_active: true },
        orderBy: { popularity: "desc" },
        take: 10,
      });
      return NextResponse.json(fallback);
    }

    return NextResponse.json(suggested);
  } catch (error) {
    console.error("Cart recommendations error:", error);
    return NextResponse.json({ error: "Failed to get cart recommendations" }, { status: 500 });
  }
}