import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Order } from "@/types/order";

export async function GET() {
  try {
    // 🔹 Lấy danh sách đơn hàng và order_items (chưa join product)
    const orders = await prisma.orders.findMany({
      orderBy: { created_at: "desc" },
      include: { order_items: true },
    });

    // 🔹 Với mỗi order, lấy product cho từng order_item
    const ordersWithProducts: Order[] = await Promise.all(
      orders.map(async (o) => {
        const order_items_with_product = await Promise.all(
          o.order_items.map(async (item) => {
            const product =
              item.product_id != null
                ? await prisma.products.findUnique({
                    where: { id: item.product_id },
                    select: {
                      id: true,
                      name: true,
                      image: true,
                      price: true,
                    },
                  })
                : null;

            return {
              id: item.id,
              order_id: item.order_id,
              product_id: item.product_id,
              quantity: item.quantity,
              price: Number(item.price ?? 0),
              total_price: Number(item.total_price ?? 0),
              product: product
                ? {
                    id: product.id,
                    name: product.name,
                    image: product.image,
                    price: Number(product.price ?? 0),
                  }
                : undefined,
            };
          })
        );

        return {
          id: o.id,
          order_code: o.order_code,
          user_id: o.user_id ?? 0,
          coupon_amount: Number(o.coupon_amount ?? 0),
          amount: Number(o.amount ?? 0),
          status: o.status ?? "PENDING",
          payment_method: o.payment_method ?? "cod",
          payment_status: o.payment_status ?? "UNPAID",
          created_at: o.created_at?.toISOString() ?? "",
          updated_at: o.updated_at?.toISOString() ?? "",
          shipping_address: o.shipping_address ?? "",
          ward_address: o.ward_address ?? "",
          district_address: o.district_address ?? "",
          ship_amount: Number(o.ship_amount ?? 0),
          order_items: order_items_with_product,
        };
      })
    );

    return NextResponse.json({ success: true, orders: ordersWithProducts });
  } catch (err: any) {
    console.error("❌ Lỗi lấy danh sách đơn hàng:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
