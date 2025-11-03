import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderDTO, OrderItemDTO } from "@/types/dto";

export async function GET() {
  try {
    const orders = await prisma.orders.findMany({
      orderBy: { created_at: "desc" },
      include: {
        order_items: true, // chỉ lấy bảng order_items
      },
    });

    // map sang DTO
    const dto: OrderDTO[] = orders.map((o) => ({
      id: o.id,
      order_code: o.order_code,
      total_amount: Number(o.amount),
      payment_method: o.payment_method,
      status: o.status,
      created_at: o.created_at?.toISOString() ?? "",
      updated_at: o.updated_at?.toISOString() ?? "",
      shipping_address: o.shipping_address ?? "",
      ship_amount: o.ship_amount ? Number(o.ship_amount) : 0,
      coupon_amount: o.coupon_amount ? Number(o.coupon_amount) : 0,
      order_items: o.order_items.map((i) => ({
        id: i.id,
        product_id: i.product_id ?? 0,
        quantity: i.quantity,
        price: Number(i.price),
        total_price: i.total_price ? Number(i.total_price) : 0,
        product: {
          id: i.product_id ?? 0,
          name: "", // bạn không lấy tên product, để trống
          image: null,
        },
      })),
    }));

    return NextResponse.json({ success: true, orders: dto });
  } catch (err: any) {
    console.error("❌ Lỗi lấy đơn hàng:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
