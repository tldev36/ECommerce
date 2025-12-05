import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";

export async function GET() {
  try {
    // 1. Mốc thời gian: 6 tháng gần nhất (tính từ đầu tháng)
    const startDate = dayjs().subtract(5, "month").startOf("month").toDate();

    // 2. Lấy đơn hàng thành công
    const orders = await prisma.orders.findMany({
      where: {
        // Hãy chắc chắn DB của bạn lưu status là 'COMPLETED' hay 'completed'
        status: "COMPLETED", 
        created_at: { gte: startDate },
      },
      include: { order_items: true },
    });

    // 3. Tạo khung 6 tháng
    const months = Array.from({ length: 6 }).map((_, i) =>
      dayjs().subtract(5 - i, "month")
    );

    // 4. Tính toán
    const revenueByMonth: Record<string, number> = {};
    const productRevenue: Record<string, number> = {};

    for (const order of orders) {
      const monthKey = dayjs(order.created_at).format("MMM");
      const total = Number(order.amount) || 0;
      
      revenueByMonth[monthKey] = (revenueByMonth[monthKey] || 0) + total;

      // Tính best seller
      if (order.order_items) {
        for (const item of order.order_items) {
          const pid = item.product_id ? item.product_id.toString() : "unknown";
          const itemTotal = Number(item.total_price) || 0;
          productRevenue[pid] = (productRevenue[pid] || 0) + itemTotal;
        }
      }
    }

    // 5. Tìm Best Seller chung cuộc
    const sortedProducts = Object.entries(productRevenue).sort((a, b) => b[1] - a[1]);
    const bestProductId = sortedProducts.length > 0 ? sortedProducts[0][0] : null;
    let bestProductName = "Không có";

    if (bestProductId && bestProductId !== "unknown") {
      const bestProduct = await prisma.products.findUnique({
        where: { id: Number(bestProductId) },
        select: { name: true },
      });
      if (bestProduct) bestProductName = bestProduct.name;
    }

    // 6. Kết quả
    const result = months.map((m) => {
      const key = m.format("MMM");
      return {
        month: key,
        revenue: revenueByMonth[key] || 0,
        bestProduct: bestProductName,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Lỗi Revenue API:", error);
    return NextResponse.json({ error: "Lỗi Server" }, { status: 500 });
  }
}