// /app/api/zalopay/create/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { ZALO_CONFIG } from "@/config";
import { prisma } from "@/lib/prisma";

// 🔐 Tạo chữ ký MAC chuẩn ZaloPay
function generateMac(key: string, data: string) {
  return crypto.createHmac("sha256", key).update(data).digest("hex");
}

export async function POST(req: Request) {
  try {
    const {
      user_id,
      shipping_address_id,
      items,
      total_amount,
      payment_method,
      coupon_id,
    } = await req.json();

    if (!items?.length || !user_id || !payment_method) {
      return NextResponse.json({ error: "Thiếu dữ liệu đơn hàng" }, { status: 400 });
    }

    // 🌏 Thời gian theo GMT+7
    const now = new Date();
    const yyMMdd = now
      .toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })
      .split("/")
      .reverse()
      .join("")
      .slice(2);
    const app_trans_id = `${yyMMdd}_${Math.floor(Math.random() * 1000000)}`;
    const app_time = Date.now();
    const app_user = user_id.toString();

    // 🔹 Embed data & items
    const embed_data = JSON.stringify({
      redirecturl: "http://localhost:3000/payment-callback",
      preferred_payment_method: ["zalopay_wallet"],
    });
    const item_str = JSON.stringify(items);

    // 🔹 MAC
    const mac_input = `${ZALO_CONFIG.APP_ID}|${app_trans_id}|${app_user}|${total_amount}|${app_time}|${embed_data}|${item_str}`;
    const mac = generateMac(ZALO_CONFIG.KEY1, mac_input);

    // 🔹 Payload gửi ZaloPay
    const orderPayload = {
      app_id: ZALO_CONFIG.APP_ID,
      app_user,
      app_trans_id,
      app_time,
      expire_duration_seconds: 3600, // 1 giờ
      amount: total_amount,
      description: `Thanh toán đơn hàng #${app_trans_id}`,
      callback_url: ZALO_CONFIG.CALLBACK_URL,
      sub_app_id: "",
      item: item_str,
      embed_data,
      mac,
      bank_code: "",
    };

    console.log("📤 Payload gửi ZaloPay:", orderPayload);

    // 🚀 Gửi request đến ZaloPay
    const zaloRes = await fetch(ZALO_CONFIG.CREATE_ORDER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload),
    });
    const result = await zaloRes.json();
    console.log("🔍 ZaloPay response:", result);

    if (result.return_code !== 1) {
      return NextResponse.json(
        { error: result.sub_return_message || "Không thể tạo đơn ZaloPay" },
        { status: 400 }
      );
    }

    // 🔹 Lưu đơn hàng vào DB
    const orderCode = `ORD${Date.now()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const order = await prisma.orders.create({
      data: {
        order_code: orderCode,
        user_id,
        shipping_address_id,
        total_amount,
        payment_method,
        status: "pending", // vì chưa thanh toán
        coupon_id: coupon_id || null,
        order_items: {
          create: items.map((i: any) => ({
            product_id: i.product_id,
            quantity: i.quantity,
            price: i.price,
            discount_percent: i.discount_percent || 0,
            final_price: i.price * (1 - (i.discount_percent || 0) / 100),
            subtotal: i.quantity * i.price * (1 - (i.discount_percent || 0) / 100),
          })),
        },
      },
      include: { order_items: true },
    });

    console.log("✅ Đơn hàng đã lưu DB:", order.id);

    // 🔹 Trả về frontend
    return NextResponse.json({
      success: true,
      order_url: result.order_url,
      app_trans_id,
      orderPayload,
      order: {
        id: order.id,
        order_code: order.order_code,
        total_amount: order.total_amount,
        payment_method: order.payment_method,
      },
    });
  } catch (err) {
    console.error("❌ ZaloPay Error:", err);
    return NextResponse.json(
      { error: "Tạo đơn hàng ZaloPay thất bại", details: err },
      { status: 500 }
    );
  }
}
