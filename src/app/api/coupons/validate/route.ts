import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    if (!code)
      return NextResponse.json({ error: "Thiếu mã giảm giá" }, { status: 400 });

    const coupon = await prisma.coupons.findUnique({
      where: { code },
    });

    if (!coupon)
      return NextResponse.json({ error: "Mã không tồn tại" }, { status: 404 });

    // Kiểm tra trạng thái và thời hạn
    const now = new Date();
    if (
      coupon.status === "0" ||
      (coupon.valid_from && now < coupon.valid_from) ||
      (coupon.valid_until && now > coupon.valid_until)
    ) {
      return NextResponse.json(
        { error: "Mã không còn hiệu lực hoặc đã hết hạn" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "Mã hợp lệ",
      discount_percent: Number(coupon.discount_percent) || 0,
      discount_amount: coupon.discount_amount
        ? Number(coupon.discount_amount)
        : null,
    });
  } catch (err) {
    console.error("❌ POST /api/coupons/validate error:", err);
    return NextResponse.json(
      { error: "Lỗi khi kiểm tra mã giảm giá", details: String(err) },
      { status: 500 }
    );
  }
}
