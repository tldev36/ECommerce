import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const updated = await prisma.coupons.update({
      where: { id: Number(params.id) },
      data,
    });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("PUT coupon error:", err);
    return NextResponse.json({ error: "Failed to update coupon" }, { status: 500 });
  }
}
