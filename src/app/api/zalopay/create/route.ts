// /app/api/zalopay/create/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { ZALO_CONFIG } from "@/config";

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
    } = await req.json();

    if (!items?.length || !user_id || !payment_method) {
      return NextResponse.json({ error: "Thiếu dữ liệu đơn hàng" }, { status: 400 });
    }

    // 🌏 Lấy thời gian theo GMT+7
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

    // 🔹 embed_data và item phải là JSON string
    const embed_data = JSON.stringify({
      redirecturl: "http://localhost:3000/payment-callback",
      preferred_payment_method: ["zalopay_wallet"], // hiển thị QR Zalopay
    });
    const item_str = JSON.stringify(items);

    // 🔹 MAC = HMAC_SHA256(app_id|app_trans_id|app_user|amount|app_time|embed_data|item)
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
      sub_app_id: "", // nếu có
      item: item_str,
      embed_data,
      mac,
      bank_code: "", // để trống để dùng mặc định QR Zalopay
    };

    console.log("📤 Payload gửi ZaloPay:", orderPayload);

    const zaloRes = await fetch(ZALO_CONFIG.CREATE_ORDER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload),
    });

    const result = await zaloRes.json();
    console.log("🔍 ZaloPay response:", result);

    if (result.return_code === 1) {
      return NextResponse.json({
        success: true,
        return_code: result.return_code,
        return_message: result.return_message,
        order_url: result.order_url,
        app_trans_id,
        orderPayload, // để frontend có thể debug hoặc hiển thị
      });
    }

    return NextResponse.json(
      { error: result.sub_return_message || "Không thể tạo đơn ZaloPay" },
      { status: 400 }
    );
  } catch (err) {
    console.error("❌ ZaloPay Error:", err);
    return NextResponse.json(
      { error: "Tạo đơn hàng ZaloPay thất bại", details: err },
      { status: 500 }
    );
  }
}
