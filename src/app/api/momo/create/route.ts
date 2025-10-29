import { NextResponse } from "next/server";
import crypto from "crypto";
import axios from "axios";
import { MOMO_CONFIG } from "@/config";

export async function POST(req: Request) {
  try {
    const {
      amount,
      orderId,
      orderInfo,
      items = [],
      userInfo = {},
      deliveryInfo = {},
    } = await req.json();

    if (!amount || !orderId || !orderInfo) {
      return NextResponse.json(
        { error: "Thiếu dữ liệu: amount, orderId, orderInfo" },
        { status: 400 }
      );
    }

    const {
      PARTNER_CODE,
      ACCESS_KEY,
      SECRET_KEY,
      ENDPOINT,
      CREATE_PATH,
      BASE_URL,
    } = MOMO_CONFIG;

    const requestId = `REQ-${Date.now()}`;
    const requestType = "captureWallet";
    const redirectUrl = `${BASE_URL}/customer/payment-success`;
    const ipnUrl = `${BASE_URL}/api/momo/ipn`;

    // extraData có thể chứa thông tin user / order, base64 encode
    const extraData = Buffer.from(
      JSON.stringify({
        userId: userInfo?.id || "guest",
        email: userInfo?.email,
      })
    ).toString("base64");

    // 🔐 Chuỗi ký signature
    const rawSignature = `accessKey=${ACCESS_KEY}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${PARTNER_CODE}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

    // ✅ Sinh chữ ký HMAC SHA256
    const signature = crypto
      .createHmac("sha256", SECRET_KEY)
      .update(rawSignature)
      .digest("hex");

    const payload = {
      partnerCode: PARTNER_CODE,
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      requestType,
      extraData,
      signature,
      lang: "vi",
    };

    console.log("📦 Payload gửi MoMo:", payload);

    // 🚀 Gửi yêu cầu tạo thanh toán MoMo
    const response = await axios.post(`${ENDPOINT}${CREATE_PATH}`, payload, {
      headers: { "Content-Type": "application/json" },
    });

    console.log("✅ Phản hồi MoMo:", response.data);
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("❌ Lỗi tạo thanh toán MoMo:", error.response?.data || error.message);
    return NextResponse.json(
      {
        message: "Tạo thanh toán MoMo thất bại",
        error: error.response?.data || error.message,
      },
      { status: 500 }
    );
  }
}
