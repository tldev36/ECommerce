import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, context: any) {
  try {
    const params = await context.params;
    const { status } = await req.json();

    const order = await prisma.orders.update({
      where: { id: Number(params.id) },
      data: { status },
    });

    return NextResponse.json({ success: true, order });
  } catch (err: any) {
    console.error("❌ PUT Lỗi cập nhật trạng thái:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, context: any) {
  try {
    const params = await context.params;
    const { status } = await req.json();

    const order = await prisma.orders.update({
      where: { id: Number(params.id) },
      data: { status },
    });

    return NextResponse.json({ success: true, order });
  } catch (err: any) {
    console.error("❌ PATCH Lỗi cập nhật trạng thái:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
