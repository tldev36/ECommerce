import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { order_id } = await req.json();

    if (!order_id) {
      return NextResponse.json(
        { message: "Missing order_id" },
        { status: 400 }
      );
    }

    // ✅ Cập nhật trạng thái đơn hàng
    const updated = await prisma.orders.update({
      where: { id: order_id },
      data: { status: "confirmed" },
    });

    return NextResponse.json({
      message: "✅ Order confirmed successfully",
      order: updated,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
