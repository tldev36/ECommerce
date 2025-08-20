import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params; // ✅ phải await

  const product = await prisma.products.findUnique({
    where: { slug },
    include: { categories: true },
  });

  if (!product) {
    return NextResponse.json({ message: "Không tìm thấy sản phẩm" }, { status: 404 });
  }

  return NextResponse.json(product);
}
