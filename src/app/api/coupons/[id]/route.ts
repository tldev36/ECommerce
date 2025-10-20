import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ✅ PUT - Cập nhật coupon
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
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
          : null,
      usage_limit:
        data.usage_limit !== null && data.usage_limit !== undefined
          ? Number(data.usage_limit)
          : null,
      valid_from: data.valid_from ? new Date(data.valid_from) : null,
      valid_until: data.valid_until ? new Date(data.valid_until) : null,
      status: data.status ? "1" : "0",
    };

    const updated = await prisma.coupons.update({
      where: { id },
      data: payload,
    });

    const formatted = {
      ...updated,
      status: ["1", "true", 1, true].includes(updated.status as any),
      discount_percent: updated.discount_percent
        ? Number(updated.discount_percent)
        : null,
      discount_amount: updated.discount_amount
        ? Number(updated.discount_amount)
        : null,
      usage_limit: updated.usage_limit ?? null,
      valid_from: updated.valid_from
        ? updated.valid_from.toISOString()
        : null,
      valid_until: updated.valid_until
        ? updated.valid_until.toISOString()
        : null,
    };

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("❌ PUT /api/coupons/[id] error:", err);
    return NextResponse.json(
      { error: "Không thể cập nhật mã giảm giá", details: String(err) },
      { status: 500 }
    );
  }
}
