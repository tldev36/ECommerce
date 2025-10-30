import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.products.findMany({
      include: { categories: true },
      orderBy: { id: "desc" },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("GET products error:", error);
    return NextResponse.json({ error: "Lỗi lấy sản phẩm" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const product = await prisma.products.create({
      data: {
        name: data.name,
        category_id: data.category_id,
        slug: data.slug,
        price: data.price,
        cost_price: data.cost_price,
        unit: data.unit,
        image: data.image,
        short: data.short,
        featured: data.featured ?? false,
        discount: data.discount ?? 0,
        is_new: data.is_new ?? false,
        is_best_seller: data.is_best_seller ?? false,
        stock_quantity: data.stock_quantity ?? 0,
        min_stock_level: data.min_stock_level ?? 0,
        is_active: data.is_active ?? true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("POST product error:", error);
    return NextResponse.json({ error: "Lỗi khi thêm sản phẩm" }, { status: 500 });
  }
}
