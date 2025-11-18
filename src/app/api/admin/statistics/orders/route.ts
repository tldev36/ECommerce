import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const statusCounts = await prisma.orders.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    const result = statusCounts.map((item) => ({
      status: item.status,
      value: item._count.status,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Lỗi thống kê đơn hàng:", error);
    return NextResponse.json({ error: "Không thể lấy dữ liệu đơn hàng" }, { status: 500 });
  }
}
