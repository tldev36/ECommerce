import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Order } from "@/types/order";

export async function GET() {
  try {
    const orders = await prisma.orders.findMany({
      orderBy: { created_at: "desc" },
      include: {
        order_items: true, // chỉ lấy item, chưa có product
      }
    });

    // // 🧩 Map sang interface Order (bỏ order_items)
    const mapped: Order[] = orders.map((o) => ({
      id: o.id,
      order_code: o.order_code,
      user_id: o.user_id ?? 0, // ✅ fix lỗi null
      coupon_amount: Number(o.coupon_amount ?? 0),
      amount: Number(o.amount ?? 0),
      status: o.status ?? "pending",
      payment_method: o.payment_method ?? "cod",
      created_at: o.created_at?.toISOString() ?? "",
      updated_at: o.updated_at?.toISOString() ?? "",
      shipping_address: o.shipping_address ?? "",
      ward_address: o.ward_address ?? "",
      district_address: o.district_address ?? "",
      ship_amount: Number(o.ship_amount ?? 0),

      order_items: [], // ❌ bỏ chi tiết đơn hàng
    }));

    const ordersWithProducts = await Promise.all(
      orders.map(async (order) => {
        const order_items_with_product = await Promise.all(
          order.order_items.map(async (item) => {
            let product = null;
            if (item.product_id !== null && item.product_id !== undefined) {
              product = await prisma.products.findUnique({
                where: { id: item.product_id },
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  image: true,
                  price: true,
                },
              });
            }

            return { ...item, product }; // thêm thông tin sản phẩm
          })
        )
      })
    );

    return NextResponse.json({ success: true, orders: mapped });
  } catch (err: any) {
    console.error("❌ Lỗi lấy danh sách đơn hàng:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
