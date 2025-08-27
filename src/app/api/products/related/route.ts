import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


// GET /api/products/related?slug=gao-st25
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json({ error: "Thiếu slug" }, { status: 400 });
    }

    // Tìm sản phẩm theo slug
    const product = await prisma.products.findUnique({
      where: { slug },
    });

    if (!product) {
      return NextResponse.json({ error: "Không tìm thấy sản phẩm" }, { status: 404 });
    }

    // Lấy sản phẩm liên quan theo category_id, loại trừ chính nó
    const related = await prisma.products.findMany({
      where: {
        category_id: product.category_id,
        slug: { not: slug },
      },
      take: 8, // giới hạn 4 sản phẩm
    });

    return NextResponse.json(related);
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm liên quan:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
