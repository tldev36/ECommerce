import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // import prisma instance

export async function POST(req: Request) {
  try {
    const { user_id, shipping_address_id, items, total_amount, payment_method, coupon_id } = await req.json();

    if (!items?.length) {
      return NextResponse.json({ error: "Giỏ hàng trống" }, { status: 400 });
    }

    // 🧮 Tạo mã đơn hàng (VD: ORD20251028XYZ)
    const orderCode = `ORD${Date.now()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // 🧾 Tạo đơn hàng
    const order = await prisma.orders.create({
      data: {
        order_code: orderCode,
        user_id: user_id || null,
        shipping_address_id: shipping_address_id || null,
        coupon_id: coupon_id || null,
        total_amount,
        payment_method,
        status: payment_method === "cod" ? "pending" : "waiting_payment", // COD thì pending
        order_items: {
          create: items.map((item: any) => ({
            product_id: item.id,
            quantity: item.quantity,
            price: item.price,
            discount_percent: item.discount_percent || 0,
            final_price: item.price * (1 - (item.discount_percent || 0) / 100),
            subtotal: item.quantity * item.price * (1 - (item.discount_percent || 0) / 100),
          })),
        },
      },
      include: {
        order_items: true,
      },
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("❌ Lỗi khi tạo đơn hàng:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
