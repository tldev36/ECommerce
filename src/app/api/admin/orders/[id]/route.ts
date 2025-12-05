import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { status } = await req.json();

    const order = await prisma.orders.update({
      where: { id: Number(params.id) },
      data: { status },
    });

    return NextResponse.json({ success: true, order });
  } catch (err: any) {
    console.error("❌ Lỗi cập nhật trạng thái:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// export async function PUT(req: Request, { params }: { params: { id: string } }) {
//   try {
//     const data = await req.json(); // nhận toàn bộ dữ liệu cần cập nhật

//     const order = await prisma.orders.update({
//       where: { id: Number(params.id) },
//       data,
//     });

//     return NextResponse.json({ success: true, order });
//   } catch (err: any) {
//     console.error("❌ Lỗi PUT cập nhật đơn hàng:", err);
//     return NextResponse.json({ success: false, error: err.message }, { status: 500 });
//   }
// }