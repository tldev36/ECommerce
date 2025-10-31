// /app/api/zalopay/create/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { ZALO_CONFIG } from "@/config";
import { prisma } from "@/lib/prisma";

// 🔐 Hàm tạo chữ ký MAC chuẩn ZaloPay
function generateMac(key: string, data: string) {
  return crypto.createHmac("sha256", key).update(data).digest("hex");
}


export async function POST(req: Request) {
  try {
    const {
      user_id,
      items,
      total_amount,
      payment_method,
      shipping_address_id,
      coupon_id,
    } = await req.json();

    if (!items?.length || !user_id || !payment_method) {
      return NextResponse.json(
        { error: "Thiếu dữ liệu đơn hàng" },
        { status: 400 }
      );
    }

    // ⚙️ 1️⃣ Tạo mã order_code ngắn gọn (~10 ký tự) và dùng làm app_trans_id
    const orderCode = `ORD${Math.random().toString(36).substring(2, 8).toUpperCase()}${Date.now()
      .toString()
      .slice(-2)}`; // ví dụ: ORDAB12CD34


    // ✅ app_trans_id đúng format: yymmdd_OrderCode
    // 🌏 Thời gian theo GMT+7
    const now = new Date();
    const yyMMdd = now
      .toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })
      .split("/")
      .reverse()
      .join("")
      .slice(2);
    const app_trans_id = `${yyMMdd}_${orderCode}`;

    const app_time = Date.now();
    const app_user = user_id.toString();

    // 🔹 embed_data và item phải là JSON string
    const embed_data = JSON.stringify({
      redirecturl: "http://localhost:3000/payment-callback/zalopay",
      preferred_payment_method: ["zalopay_wallet"], // chỉ hiển thị QR ZaloPay
    });
    const item_str = JSON.stringify(items);

    const amountzalo = Number(total_amount);
    
    // 🔹 MAC = HMAC_SHA256(app_id|app_trans_id|app_user|amount|app_time|embed_data|item)
    const mac_input = `${ZALO_CONFIG.APP_ID}|${app_trans_id}|${app_user}|${amountzalo}|${app_time}|${embed_data}|${item_str}`;
    const mac = generateMac(ZALO_CONFIG.KEY1, mac_input);

    // 🔹 Payload gửi ZaloPay
    const orderPayload = {
      app_id: ZALO_CONFIG.APP_ID,
      app_user,
      app_trans_id, // chính là orderCode
      app_time,
      amount: total_amount,
      description: `Thanh toán đơn hàng #${orderCode}`,
      embed_data,
      item: item_str,
      mac,
      callback_url: ZALO_CONFIG.CALLBACK_URL,
      bank_code: "",
      expire_duration_seconds: 3600, // 1 giờ
    };

    console.log("📤 Payload gửi ZaloPay:", orderPayload);

    // 🔹 Gửi yêu cầu đến ZaloPay
    const zaloRes = await fetch(ZALO_CONFIG.CREATE_ORDER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload),
    });

    const result = await zaloRes.json();
    console.log("🔍 ZaloPay response:", result);

    // ⚙️ 2️⃣ Lưu đơn hàng vào DB
    const order = await prisma.orders.create({
      data: {
        order_code: app_trans_id,
        user_id,
        shipping_address_id,
        total_amount,
        payment_method,
        status: "pending", // chưa thanh toán
        coupon_id: coupon_id || null,
        order_items: {
          create: items.map((i: any) => ({
            product_id: i.product_id,
            quantity: i.quantity,
            price: i.price,
            discount_percent: i.discount_percent || 0,
            final_price: i.price * (1 - (i.discount_percent || 0) / 100),
            subtotal:
              i.quantity *
              i.price *
              (1 - (i.discount_percent || 0) / 100),
          })),
        },
      },
      include: { order_items: true },
    });

    console.log("✅ Đơn hàng đã lưu DB:", order.id, "→ order_code:", orderCode);

    // ⚙️ 3️⃣ Nếu ZaloPay tạo đơn thành công → trả về cho frontend
    if (result.return_code === 1) {
      return NextResponse.json({
        return_code: result.return_code,
        success: true,
        message: result.return_message,
        order_url: result.order_url, // URL để người dùng thanh toán
        order_id: order.id, // để frontend biết order nào
        order_code: order.order_code,
      });
    }

    // ⚙️ 4️⃣ Nếu ZaloPay thất bại
    return NextResponse.json(
      { error: result.sub_return_message || "Không thể tạo đơn ZaloPay" },
      { status: 400 }
    );
  } catch (err) {
    console.error("❌ Lỗi tạo đơn hàng ZaloPay:", err);
    return NextResponse.json(
      { error: "Tạo đơn hàng ZaloPay thất bại", details: err },
      { status: 500 }
    );
  }
}
