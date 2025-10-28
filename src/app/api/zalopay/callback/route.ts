import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { ZALO_CONFIG } from "@/config";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { data: dataString, mac, type } = body;
    if (!dataString || !mac) {
      return NextResponse.json({ error: "Thiếu dữ liệu callback" }, { status: 400 });
    }

    // 🔹 Xác thực MAC
    const expectedMac = crypto
      .createHmac("sha256", ZALO_CONFIG.KEY2)
      .update(dataString)
      .digest("hex");

    if (mac !== expectedMac) {
      console.error("❌ Callback MAC không hợp lệ");
      return NextResponse.json({ error: "MAC không hợp lệ" }, { status: 400 });
    }

    // 🔹 Parse data
    const data = JSON.parse(dataString);
    const {
      app_id,
      app_trans_id,
      app_user,
      amount,
      embed_data,
      item,
      zp_trans_id,
      server_time,
      channel,
      merchant_user_id,
      user_fee_amount,
      discount_amount,
    } = data;

    console.log("📥 Callback data parsed:", data);

    // 🔹 Tìm đơn hàng theo app_trans_id
    const order = await prisma.orders.findFirst({
      where: { order_code: { contains: app_trans_id } },
    });

    if (!order) {
      return NextResponse.json({ error: "Không tìm thấy đơn hàng" }, { status: 404 });
    }

    // 🔹 Cập nhật trạng thái đơn
    let status = "failed";
    if (type === 1 && amount === order.total_amount) {
      // thanh toán thành công
      status = "paid";
    }

    await prisma.orders.update({
      where: { id: order.id },
      data: { status },
    });

    console.log(`✅ Đơn hàng ${order.order_code} đã cập nhật trạng thái: ${status}`);

    // 🔹 Trả response cho ZaloPay
    return NextResponse.json({ return_code: 1, return_message: "Callback processed" });

  } catch (err) {
    console.error("❌ Lỗi callback ZaloPay:", err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
