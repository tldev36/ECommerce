import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOrderSuccessEmail } from "@/lib/mailzalo";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const fullId = url.searchParams.get("apptransid") || "";
    const app_trans_id = fullId.split("_")[1];

    if (!app_trans_id) {
      return NextResponse.json(
        { success: false, error: "Thiếu apptransid" },
        { status: 400 }
      );
    }

    // =============== UPDATE ORDER ================= //
    const order = await prisma.orders.update({
      where: { order_code: app_trans_id },
      data: { payment_status: "PAID" },
      include: {
        order_items: true,
        users: true,
      },
    });

    // =============== PREPARE EMAIL DATA =============== //
    const emailItemsData = order.order_items.map((item: any) => ({
      name: item.name,
      quantity: item.quantity,
      price: Number(item.price),
    }));

    // Xử lý địa chỉ: tách từ field shipping_address
    const raw = order.shipping_address || "";
    const parts = raw.split("-");
    const address = parts.slice(2).join("-");

    const userEmail = order.users?.email;
    const customerName = order.users?.name || "Khách hàng";

    // =============== SEND EMAIL =============== //
    if (userEmail) {
      await sendOrderSuccessEmail({
        to: userEmail,
        orderCode: app_trans_id,
        customerName,
        items: emailItemsData,
        totalAmount: Number(order.amount || 0),
        address: address,
        shippingFee: Number(order.ship_amount || 0),
        couponAmount: Number(order.coupon_amount || 0),
      });
    }

    return NextResponse.json({
      success: true,
      message: "Cập nhật đơn hàng & gửi mail thành công",
      order_id: order.id,
      app_trans_id,
    });

  } catch (err: any) {
    console.error("❌ Lỗi callback ZaloPay:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
