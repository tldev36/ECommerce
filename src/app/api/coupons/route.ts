// src/app/api/coupons/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // ✅ chỉ import, KHÔNG khởi tạo lại

// ✅ GET - Lấy danh sách tất cả coupons
export async function GET() {
  try {
    const coupons = await prisma.coupons.findMany({
      orderBy: { id: "desc" },
    });

    const formatted = coupons.map((c: any) => ({
      ...c,
      status: ["1", "true", 1, true].includes(c.status as any), // Bit(1) → boolean
      discount_percent: c.discount_percent ? Number(c.discount_percent) : null,
      usage_limit: c.usage_limit ?? null,
      valid_from: c.valid_from ? c.valid_from.toISOString() : null,
      valid_until: c.valid_until ? c.valid_until.toISOString() : null,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("❌ GET /api/coupons error:", error);
    return NextResponse.json(
      { message: "Lỗi khi lấy danh sách coupons", error: String(error) },
      { status: 500 }
    );
  }
}

// ✅ POST - Tạo mới coupon
export async function POST(req: Request) {
  try {
    const data = await req.json();

    const payload = {
      code: data.code,
      description: data.description || "",
      discount_percent:
        data.discount_percent !== null && data.discount_percent !== undefined
          ? Number(data.discount_percent)
          : null,
      discount_amount:
        data.discount_amount !== null && data.discount_amount !== undefined
          ? Number(data.discount_amount)
          : null, // ✅ thêm trường giảm theo số tiền
      usage_limit:
        data.usage_limit !== null && data.usage_limit !== undefined
          ? Number(data.usage_limit)
          : null,
      valid_from: data.valid_from ? new Date(data.valid_from) : null,
      valid_until: data.valid_until ? new Date(data.valid_until) : null,
      status: data.status ? "1" : "0", // boolean → bit string
    };

    const newCoupon = await prisma.coupons.create({ data: payload });

    const formatted = {
      ...newCoupon,
      status: ["1", "true", 1, true].includes(newCoupon.status as any),
      discount_percent: newCoupon.discount_percent
        ? Number(newCoupon.discount_percent)
        : null,
      discount_amount: newCoupon.discount_amount
        ? Number(newCoupon.discount_amount)
        : null, // ✅ convert lại để frontend nhận được số
      usage_limit: newCoupon.usage_limit ?? null,
      valid_from: newCoupon.valid_from
        ? newCoupon.valid_from.toISOString()
        : null,
      valid_until: newCoupon.valid_until
        ? newCoupon.valid_until.toISOString()
        : null,
    };

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("❌ POST /api/coupons error:", err);
    return NextResponse.json(
      { error: "Không thể tạo mã giảm giá", details: String(err) },
      { status: 500 }
    );
  }
}
