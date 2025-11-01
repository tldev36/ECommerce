import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * API: Lấy danh sách đơn hàng của 1 user (và thông tin sản phẩm tương ứng)
 * Request body: { user_id: number }
 * Method: POST
 */
export async function POST(req: Request) {
  try {
    const { user_id } = await req.json();

    // 🔒 Kiểm tra dữ liệu đầu vào
    if (!user_id) {
      return NextResponse.json({ error: "Thiếu user_id" }, { status: 400 });
    }

    // 🔹 Lấy danh sách đơn hàng của user
    const orders = await prisma.orders.findMany({
      where: { user_id },
      include: {
        order_items: true, // chỉ lấy item, chưa có product
      },
      orderBy: { created_at: "desc" },
    });

    // 🔹 Bổ sung thông tin sản phẩm cho từng order_item
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
        );

        return { ...order, order_items: order_items_with_product };
      })
    );

    // 🟢 Trả về kết quả
    return NextResponse.json(ordersWithProducts);
  } catch (error) {
    console.error("Lỗi lấy đơn hàng:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
