import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 🟡 Cập nhật coupon
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const data = await req.json();

    const updated = await prisma.coupons.update({
      where: { id },
      data: {
        code: data.code,
        description: data.description,
        discount_percent: data.discount_percent,
        valid_from: data.valid_from ? new Date(data.valid_from) : null,
        valid_until: data.valid_until ? new Date(data.valid_until) : null,
        usage_limit: data.usage_limit ?? null,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Lỗi khi cập nhật coupon:", err);
    return NextResponse.json({ error: "Không thể cập nhật coupon" }, { status: 500 });
  }
}

// 🔴 Xóa coupon
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    await prisma.coupons.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Lỗi khi xóa coupon:", err);
    return NextResponse.json({ error: "Không thể xóa coupon" }, { status: 500 });
  }
}
