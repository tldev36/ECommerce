import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const GHN_BASE_URL = process.env.GHN_BASE_URL!;
const GHN_TOKEN = process.env.GHN_TOKEN!;
const GHN_SHOP_ID = Number(process.env.GHN_SHOP_ID!);

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const order = await prisma.orders.findUnique({ where: { id } });

    if (!order?.order_code) {
      return NextResponse.json({ success: false, message: "Đơn hàng chưa có mã GHN." }, { status: 400 });
    }

    // 🔹 Gọi API GHN để lấy trạng thái
    const res = await fetch(`${GHN_BASE_URL}/shiip/public-api/v2/shipping-order/detail`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Token: GHN_TOKEN,
        ShopId: GHN_SHOP_ID.toString(),
      },
      body: JSON.stringify({ order_code: order.order_code }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ success: false, message: "Không lấy được trạng thái GHN.", data }, { status: 500 });
    }

    // 🔹 Cập nhật trạng thái giao hàng trong DB
    await prisma.orders.update({
      where: { id },
      data: { status: data.data.status },
    });

    return NextResponse.json({
      success: true,
      message: "Đã đồng bộ trạng thái GHN.",
      ghn_status: data.data.status,
    });
  } catch (error: any) {
    console.error("GHN tracking error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
