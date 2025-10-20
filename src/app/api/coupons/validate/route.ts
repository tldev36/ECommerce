import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    if (!code || code.trim() === "") {
      return NextResponse.json(
        { error: "Vui lòng nhập mã giảm giá" },
        { status: 400 }
      );
    }

    // 🔍 Tìm mã giảm giá trong DB
    const coupon = await prisma.coupons.findFirst({
      where: {
        code: code.trim().toUpperCase(),
        status: "1", // chỉ lấy mã đang hoạt động
      },
    });

    if (!coupon) {
      return NextResponse.json(
        { valid: false, message: "Mã giảm giá không tồn tại hoặc đã bị vô hiệu hóa" },
        { status: 404 }
      );
    }

    const now = new Date();

    // ⏰ Kiểm tra thời hạn
    if (
      (coupon.valid_from && now < coupon.valid_from) ||
      (coupon.valid_until && now > coupon.valid_until)
    ) {
      return NextResponse.json(
        { valid: false, message: "Mã giảm giá đã hết hạn hoặc chưa đến thời gian sử dụng" },
        { status: 400 }
      );
    }

    // 🔢 Kiểm tra lượt sử dụng (nếu có)
    if (coupon.usage_limit !== null && coupon.usage_limit <= 0) {
      return NextResponse.json(
        { valid: false, message: "Mã giảm giá đã hết lượt sử dụng" },
        { status: 400 }
      );
    }

    // ✅ Mã hợp lệ → trả về thông tin giảm giá
    return NextResponse.json({
      valid: true,
      message: "Áp dụng mã giảm giá thành công",
      discount_percent: coupon.discount_percent
        ? Number(coupon.discount_percent)
        : null,
      discount_amount: coupon.discount_amount
        ? Number(coupon.discount_amount)
        : null,
    });
  } catch (err) {
    console.error("❌ Lỗi khi kiểm tra mã giảm giá:", err);
    return NextResponse.json(
      { valid: false, error: "Đã xảy ra lỗi khi kiểm tra mã giảm giá" },
      { status: 500 }
    );
  }
}
