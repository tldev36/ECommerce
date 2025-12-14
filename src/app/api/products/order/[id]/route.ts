// app/api/products/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Sửa đường dẫn tới prisma của bạn

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;

    const product = await prisma.products.findUnique({
      where: { id: parseInt(productId) }, // Hoặc id: productId nếu id là string
      select: {
        id: true,
        name: true,
        price: true,
        discount: true, // Giả sử cột giảm giá tên là discount
        
      }
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}