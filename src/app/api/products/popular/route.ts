import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // ⚙️ Lấy 8 sản phẩm phổ biến nhất (tuỳ bạn chọn logic)
    const products = await prisma.products.findMany({
      where: { is_active: true },
      take: 10,
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        price: true,
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error loading popular products:", error);
    return NextResponse.json(
      { error: "Failed to load popular products" },
      { status: 500 }
    );
  }
}
