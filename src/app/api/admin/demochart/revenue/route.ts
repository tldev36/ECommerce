// /app/api/admin/statistics/revenue/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";

type Query = {
  month?: string; // 1-12
  year?: string; // 2025
  status?: string; // 'all' or specific
  search?: string; // customer name or order_code
};

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q: Query = {
      month: url.searchParams.get("month") || undefined,
      year: url.searchParams.get("year") || undefined,
      status: url.searchParams.get("status") || undefined,
      search: url.searchParams.get("search") || undefined,
    };

    const selectedMonth = q.month ? Number(q.month) : undefined;
    const selectedYear = q.year ? Number(q.year) : undefined;
    const statusFilter = q.status && q.status !== "all" ? q.status : undefined;
    const search = q.search ? q.search.trim().toLowerCase() : undefined;

    // Build order where filter
    const orderWhere: any = {};
    if (statusFilter) orderWhere.status = statusFilter;
    if (selectedYear && selectedMonth) {
      const start = dayjs().year(selectedYear).month(selectedMonth - 1).startOf("month").toDate();
      const end = dayjs(start).endOf("month").toDate();
      orderWhere.created_at = { gte: start, lte: end };
    } else if (selectedYear && !selectedMonth) {
      const start = dayjs().year(selectedYear).startOf("year").toDate();
      const end = dayjs().year(selectedYear).endOf("year").toDate();
      orderWhere.created_at = { gte: start, lte: end };
    }

    // If search is provided, we attempt basic match on order_code or shipping_address (or you can join users)
    if (search) {
      orderWhere.OR = [
        { order_code: { contains: search, mode: "insensitive" } },
        { shipping_address: { contains: search, mode: "insensitive" } },
      ];
    }

    // 1) Fetch orders matching filters (only fields needed)
    const orders = await prisma.orders.findMany({
      where: orderWhere,
      include: {
        order_items: true,
      },
      orderBy: { created_at: "desc" },
    });

    // 2) Compute totals
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((s, o) => s + Number(o.amount ?? 0), 0);
    const completedCount = orders.filter((o) => o.status === "completed").length;
    const completedRate = totalOrders === 0 ? 0 : Math.round((completedCount / totalOrders) * 100 * 100) / 100; // two decimals

    // 3) Build chartData: 6 months ending with selected month (or current month)
    const endMonth = selectedYear && selectedMonth ? dayjs().year(selectedYear).month(selectedMonth - 1) : dayjs();
    const months = Array.from({ length: 6 }).map((_, i) => endMonth.subtract(5 - i, "month"));

    // Map month key -> revenue
    const revenueByMonth: Record<string, number> = {};
    for (const m of months) revenueByMonth[m.format("MMM YYYY")] = 0;

    for (const o of orders) {
      if (!o.created_at) continue;
      const key = dayjs(o.created_at).format("MMM YYYY");
      if (key in revenueByMonth) {
        revenueByMonth[key] += Number(o.amount ?? 0);
      }
    }

    const chartData = months.map((m) => ({
      month: m.format("MMM"),
      label: m.format("MMM YYYY"),
      revenue: revenueByMonth[m.format("MMM YYYY")] || 0,
    }));

    // 4) Top products by quantity within the same order filter
    // We'll aggregate order_items grouped by product_id but filtering by orders matching orderWhere.
    // To filter order_items by their orders' created_at/status, we can use relational where
    const productGroups = await prisma.order_items.groupBy({
      by: ["product_id"],
      where: {
        product_id: { not: null },
        orders: orderWhere,
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 10,
    });

    // fetch product names for top ones
    const productIds = productGroups.map((g) => g.product_id!).filter(Boolean) as number[];
    let productsMap: Record<number, { id: number; name: string }> = {};
    if (productIds.length > 0) {
      const products = await prisma.products.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true },
      });
      productsMap = Object.fromEntries(products.map((p) => [p.id, { id: p.id, name: p.name }]));
    }

    const topProducts = productGroups.map((g) => ({
      product_id: g.product_id,
      name: productsMap[g.product_id!]?.name ?? `#${g.product_id}`,
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
    console.error("Error /api/admin/statistics/revenue:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
