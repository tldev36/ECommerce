import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Gom nhóm theo trạng thái và đếm số lượng
    const ordersGrouped = await prisma.orders.groupBy({
      by: ['status'],
      _count: {
        id: true, // Đếm id
      },
    });

    // Map dữ liệu để Recharts dễ đọc (cần key 'status' và 'value')
    // Ví dụ output: [{ status: 'completed', value: 10 }, { status: 'pending', value: 5 }]
    const formattedData = ordersGrouped.map((item) => ({
      status: item.status, 
      value: item._count.id,
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Lỗi Orders API:", error);
    return NextResponse.json([], { status: 500 });
  }
}