import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { order_id } = await req.json();

    const order = await prisma.orders.findUnique({
      where: { id: order_id },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Chỉ được hủy nếu chưa xử lý
    if (order.status !== "pending" && order.status !== "processing") {
      return NextResponse.json(
        { error: "Order cannot be cancelled" },
        { status: 400 }
      );
    }

    await prisma.orders.update({
      where: { id: order_id },
      data: { status: "cancelled" },
    });

    return NextResponse.json({ message: "Order cancelled successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
