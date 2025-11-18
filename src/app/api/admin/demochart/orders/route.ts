// /app/api/admin/statistics/orders/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = {
      month: url.searchParams.get("month"),
      year: url.searchParams.get("year"),
      status: url.searchParams.get("status"),
      search: url.searchParams.get("search"),
      page: Number(url.searchParams.get("page") || "1"),
      perPage: Number(url.searchParams.get("perPage") || "20"),
    };

    const where: any = {};
    if (q.status && q.status !== "all") where.status = q.status;

    if (q.month && q.year) {
      const start = dayjs().year(Number(q.year)).month(Number(q.month) - 1).startOf("month").toDate();
      const end = dayjs(start).endOf("month").toDate();
      where.created_at = { gte: start, lte: end };
    } else if (q.year) {
      const start = dayjs().year(Number(q.year)).startOf("year").toDate();
      const end = dayjs().year(Number(q.year)).endOf("year").toDate();
      where.created_at = { gte: start, lte: end };
    }

    if (q.search) {
      const s = q.search.trim();
      where.OR = [
        { order_code: { contains: s, mode: "insensitive" } },
        { shipping_address: { contains: s, mode: "insensitive" } },
      ];
    }

    const total = await prisma.orders.count({ where });
    const orders = await prisma.orders.findMany({
      where,
      include: { order_items: true },
      orderBy: { created_at: "desc" },
      skip: (q.page - 1) * q.perPage,
      take: q.perPage,
    });

    // Map to lightweight DTO
    const items = await Promise.all(
      orders.map(async (o) => {
        // Optional: fetch user name if users table exists
        let customer = o.user_id ? `User #${o.user_id}` : "Khách lẻ";
        // total amount already in o.amount
        return {
          id: o.id,
          order_code: o.order_code,
          customer,
          created_at: o.created_at,
          amount: Number(o.amount ?? 0),
          status: o.status,
          payment_method: o.payment_method,
          items: o.order_items.map((it) => ({
            id: it.id,
            product_id: it.product_id,
            quantity: it.quantity,
            price: Number(it.price ?? 0),
            total_price: Number(it.total_price ?? 0),
          })),
        };
      })
    );

    return NextResponse.json({ success: true, total, page: q.page, perPage: q.perPage, orders: items });
  } catch (err: any) {
    console.error("Error /api/admin/statistics/orders:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
