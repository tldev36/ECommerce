import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // ✅ bạn cần file này (hướng dẫn bên dưới)

// 🟢 Lấy danh sách coupons
export async function GET() {
  try {
    const coupons = await prisma.coupons.findMany({
      orderBy: { created_at: "desc" },
    });

    // Convert Decimal -> number để tránh lỗi JSON
    const formatted = coupons.map((c) => ({
      ...c,
      discount_percent: c.discount_percent
        ? Number(c.discount_percent)
        : null,
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("Lỗi khi lấy danh sách coupons:", err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

// 🟢 Tạo coupon mới
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const newCoupon = await prisma.coupons.create({
      data: {
        code: data.code,
        description: data.description,
        discount_percent: data.discount_percent,
        valid_from: data.valid_from ? new Date(data.valid_from) : null,
        valid_until: data.valid_until ? new Date(data.valid_until) : null,
        usage_limit: data.usage_limit ?? null,
      },
    });

    return NextResponse.json(newCoupon, { status: 201 });
  } catch (err: any) {
    console.error("Lỗi khi tạo coupon:", err);
    return NextResponse.json(
      { error: err.message || "Không thể tạo coupon" },
      { status: 500 }
    );
  }
}
