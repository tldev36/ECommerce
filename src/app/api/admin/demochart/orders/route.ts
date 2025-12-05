import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = {
      month: url.searchParams.get("month"),
      year: url.searchParams.get("year"),
      status: url.searchParams.get("status") || "COMPLETED",
      search: url.searchParams.get("search"),
      page: Number(url.searchParams.get("page") || "1"),
      perPage: Number(url.searchParams.get("perPage") || "10"),
    };

    // ----------------------------
    // BUILD WHERE FILTER
    // ----------------------------
    const where: any = {};

    // Normalize status (ALL = không lọc)
    if (q.status && q.status.toUpperCase() !== "ALL") {
      where.status = q.status.toUpperCase(); // DB lưu COMPLETED, PENDING, CANCELED...
    }

    // Filter by time
    if (q.month && q.year) {
      const start = dayjs()
        .year(Number(q.year))
        .month(Number(q.month) - 1)
        .startOf("month")
        .toDate();

      const end = dayjs(start).endOf("month").toDate();

      where.created_at = { gte: start, lte: end };   // SỬA TẠI ĐÂY
    } else if (q.year) {
      const start = dayjs().year(Number(q.year)).startOf("year").toDate();
      const end = dayjs().year(Number(q.year)).endOf("year").toDate();

      where.created_at = { gte: start, lte: end };   // SỬA TẠI ĐÂY
    }

    // Search filter
    if (q.search) {
      const s = q.search.trim();
      where.OR = [
        { order_code: { contains: s, mode: "insensitive" } },
        { shipping_address: { contains: s, mode: "insensitive" } },
      ];
    }

    // ----------------------------
    // QUERY DATABASE
    // ----------------------------
    const total = await prisma.orders.count({ where });

    const orders = await prisma.orders.findMany({
      where,
      include: {
        order_items: {
          include: {
            product: {
              select: { name: true, image: true, unit: true },
            },
          },
        },
      },
      orderBy: { created_at: "desc" },
      skip: (q.page - 1) * q.perPage,
      take: q.perPage,
    });

    // ----------------------------
    // MAP DATA
    // ----------------------------
    const items = orders.map((o) => {
      let customerName = "Khách lẻ";
      if (o.shipping_address) {
        const parts = o.shipping_address.split("-");
        if (parts.length > 0) customerName = parts[0].trim();
      }

      return {
        id: o.id,
        order_code: o.order_code,
        customer: customerName,
        shipping_address: o.shipping_address,
        created_at: o.created_at,
        amount: Number(o.amount ?? 0),
        status: o.status,
        payment_method: o.payment_method,
        ship_amount: Number(o.ship_amount ?? 0),
        coupon_amount: Number(o.coupon_amount ?? 0),

        items: o.order_items.map((it) => ({
          id: it.id,
          product_id: it.product_id,
          product_name: it.product?.name || "Sản phẩm đã xóa",
          product_image: it.product?.image || "",
          unit: it.product?.unit,
          quantity: it.quantity,
          price: Number(it.price ?? 0),
          total_price: Number(it.total_price ?? 0),
        })),
      };
    });

    return NextResponse.json({
      success: true,
      total,
      page: q.page,
      perPage: q.perPage,
      orders: items,
    });
  } catch (err: any) {
    console.error("Error statistics/orders:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
