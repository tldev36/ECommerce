import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";

export async function GET() {
  try {
    // 🔹 1. Lấy tất cả đơn hoàn thành trong 6 tháng gần nhất
    const startDate = dayjs().subtract(5, "month").startOf("month").toDate();
    const orders = await prisma.orders.findMany({
      where: {
        status: "completed",
        created_at: { gte: startDate },
      },
      include: { order_items: true },
    });

    // 🔹 2. Tạo mốc 6 tháng gần nhất (dù có hay không có đơn)
    const months = Array.from({ length: 6 }).map((_, i) =>
      dayjs().subtract(5 - i, "month")
    );

    // 🔹 3. Gom doanh thu theo tháng + tính tổng sản phẩm
    const revenueByMonth: Record<string, number> = {};
    const productRevenue: Record<string, number> = {};

    for (const order of orders) {
      const monthKey = dayjs(order.created_at).format("MMM");
      const total = Number(order.amount);
      revenueByMonth[monthKey] = (revenueByMonth[monthKey] || 0) + total;

      for (const item of order.order_items) {
        const pid = item.product_id?.toString() || "";
        productRevenue[pid] = (productRevenue[pid] || 0) + Number(item.total_price || 0);
      }
    }

    // 🔹 4. Lấy tên sản phẩm để xác định best seller
    const products = await prisma.products.findMany({
      select: { id: true, name: true },
    });
    const productMap = Object.fromEntries(products.map((p) => [p.id, p.name]));

    const bestProductId = Object.entries(productRevenue).sort((a, b) => b[1] - a[1])[0]?.[0];
    const bestProductName = bestProductId ? productMap[Number(bestProductId)] : "Không có";

    // 🔹 5. Dựng mảng kết quả đủ 6 tháng (kể cả tháng không có doanh thu)
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
    console.error("Lỗi thống kê doanh thu:", error);
    return NextResponse.json({ error: "Không thể lấy dữ liệu doanh thu" }, { status: 500 });
  }
}
