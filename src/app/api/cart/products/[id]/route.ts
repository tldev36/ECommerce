import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: number } }
) {
  try {
    const id = Number(params.id);
    if (!id) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const product = await prisma.products.findUnique({
      where: { id: id },
    });

    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(product); // Trả về object sản phẩm
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}