import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";
import { ORDER_STATUS } from "@/config/order-status.config"; // Nên import config để chuẩn

type Query = {
  month?: string; // 1-12
  year?: string; // 2025
  search?: string; // customer name or order_code
};

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q: Query = {
      month: url.searchParams.get("month") || undefined,
      year: url.searchParams.get("year") || undefined,
      search: url.searchParams.get("search") || undefined,
    };

    const selectedMonth = q.month ? Number(q.month) : undefined;
    const selectedYear = q.year ? Number(q.year) : undefined;
    const search = q.search ? q.search.trim().toLowerCase() : undefined;

    // --- 1. XÂY DỰNG BỘ LỌC (WHERE) ---
    const orderWhere: any = {
      // 🔒 CHỈ LẤY ĐƠN ĐÃ HOÀN TẤT (COMPLETED)
      // Nếu file config của bạn dùng chữ hoa thì để COMPLETED, nếu thường thì completed
      status: ORDER_STATUS.COMPLETED.code, 
    };

    // Lọc theo thời gian
    if (selectedYear) {
      if (selectedMonth) {
        // Lọc trong 1 tháng cụ thể
        const start = dayjs().year(selectedYear).month(selectedMonth - 1).startOf("month").toDate();
        const end = dayjs(start).endOf("month").toDate();
        orderWhere.created_at = { gte: start, lte: end };
      } else {
        // Lọc cả năm
        const start = dayjs().year(selectedYear).startOf("year").toDate();
        const end = dayjs().year(selectedYear).endOf("year").toDate();
        orderWhere.created_at = { gte: start, lte: end };
      }
    }

    // Lọc theo từ khóa tìm kiếm
    if (search) {
      orderWhere.OR = [
        { order_code: { contains: search, mode: "insensitive" } },
        { shipping_address: { contains: search, mode: "insensitive" } },
      ];
    }

    // --- 2. TRUY VẤN DATABASE ---
    
    // Lấy danh sách đơn hàng thỏa mãn điều kiện
    const orders = await prisma.orders.findMany({
      where: orderWhere,
      include: {
        order_items: true, // Để tính top product sau này nếu cần
      },
      orderBy: { created_at: "desc" },
    });

    // --- 3. TÍNH TOÁN THỐNG KÊ (AGGREGATION) ---

    const totalOrders = orders.length;
    // Tính tổng doanh thu từ danh sách đã lọc (chỉ Completed)
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.amount ?? 0), 0);
    
    // Tỷ lệ hoàn thành: Vì mình đã lọc chỉ lấy Completed nên tỷ lệ này luôn là 100% trong tập này.
    // Tuy nhiên, nếu muốn so sánh với TỔNG SỐ ĐƠN (cả chưa hoàn thành), ta cần query riêng.
    // Dưới đây là cách tính tỷ lệ trong ngữ cảnh "Doanh thu thực tế":
    const completedRate = 100; 

    // --- 4. BIỂU ĐỒ DOANH THU (CHART DATA) ---
    // Hiển thị 6 tháng gần nhất tính đến tháng được chọn
    const endChartDate = selectedYear && selectedMonth 
        ? dayjs().year(selectedYear).month(selectedMonth - 1) 
        : dayjs(); // Mặc định lấy thời điểm hiện tại
    
    const months = Array.from({ length: 6 }).map((_, i) => endChartDate.subtract(5 - i, "month"));

    // Khởi tạo map doanh thu bằng 0
    const revenueByMonth: Record<string, number> = {};
    months.forEach(m => {
        revenueByMonth[m.format("MMM YYYY")] = 0;
    });

    // Để vẽ biểu đồ chính xác, ta cần query lại Database cho khoảng thời gian 6 tháng này
    // Vì `orders` ở trên chỉ chứa dữ liệu của tháng/năm được chọn.
    const chartStart = months[0].startOf('month').toDate();
    const chartEnd = months[5].endOf('month').toDate();

    const chartOrders = await prisma.orders.findMany({
        where: {
            status: ORDER_STATUS.COMPLETED.code, // Chỉ lấy đơn hoàn tất
            created_at: { gte: chartStart, lte: chartEnd }
        },
        select: { created_at: true, amount: true }
    });

    // Cộng dồn doanh thu vào Map
    for (const o of chartOrders) {
        if (!o.created_at) continue;
        const key = dayjs(o.created_at).format("MMM YYYY");
        if (key in revenueByMonth) {
            revenueByMonth[key] += Number(o.amount ?? 0);
        }
    }

    // Format dữ liệu trả về cho Frontend
    const chartData = months.map((m) => ({
      month: m.format("MMM"),
      label: m.format("MMM YYYY"),
      revenue: revenueByMonth[m.format("MMM YYYY")] || 0,
    }));

    // --- 5. TOP SẢN PHẨM BÁN CHẠY (TOP PRODUCTS) ---
    // Thống kê dựa trên các đơn hàng ĐÃ HOÀN TẤT (đã lọc ở trên)
    
    // Group By product_id và tính tổng quantity
    const productGroups = await prisma.order_items.groupBy({
      by: ["product_id"],
      where: {
        product_id: { not: null },
        orders: orderWhere, // Sử dụng lại bộ lọc (chỉ đơn Completed trong tháng/năm chọn)
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5, // Top 5
    });

    // Lấy tên sản phẩm
    const productIds = productGroups.map((g) => g.product_id!).filter(Boolean);
    let productsMap: Record<number, string> = {};
    
    if (productIds.length > 0) {
      const productsInfo = await prisma.products.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true },
      });
      productsInfo.forEach(p => productsMap[p.id] = p.name);
    }

    const topProducts = productGroups.map((g) => ({
      product_id: g.product_id,
      name: productsMap[g.product_id!] || `Sản phẩm #${g.product_id}`,
      quantity: g._sum.quantity ?? 0,
    }));

    return NextResponse.json({
      success: true,
      totalRevenue,
      totalOrders,
      completedRate,
      chartData,
      topProducts,
    });

  } catch (err: any) {
    console.error("Error statistics/revenue:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}