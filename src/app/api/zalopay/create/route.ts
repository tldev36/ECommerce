// /app/api/zalopay/create/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { ZALO_CONFIG } from "@/config";
import { prisma } from "@/lib/prisma";
import { Order_Item } from "@/types/order_item";

const GHN_BASE_URL = process.env.GHN_BASE_URL!;
const GHN_TOKEN = process.env.GHN_TOKEN!;
const GHN_SHOP_ID = Number(process.env.GHN_SHOP_ID!);

// 🔐 Tạo MAC chuẩn ZaloPay
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
      coupon_amount,
      ship_amount,
    } = await req.json();

    if (!items?.length || !user_id || !payment_method || !shipping_address_id) {
      return NextResponse.json(
        { error: "Thiếu dữ liệu đầu vào (user_id, items, địa chỉ hoặc phương thức thanh toán)" },
        { status: 400 }
      );
    }

    // 🏠 Lấy địa chỉ giao hàng từ DB
    const address = await prisma.shipping_addresses.findUnique({
      where: { id: Number(shipping_address_id) },
    });
    if (!address) {
      return NextResponse.json({ error: "Không tìm thấy địa chỉ giao hàng" }, { status: 404 });
    }

    // 🧮 Tạo mã order
    const orderCode = `ORD${Math.random().toString(36).substring(2, 8).toUpperCase()}${Date.now()
      .toString()
      .slice(-2)}`;
    const address_detail = `${address.recipient_name}-${address.phone}-${address.detail_address},${address.ward_name},${address.district_name},${address.province_name}`;



    const now = new Date();
    const yyMMdd = `${String(now.getFullYear()).slice(2)}${String(
      now.getMonth() + 1
    ).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    const app_trans_id = `${yyMMdd}_${orderCode}`;
    const app_time = Date.now();
    const app_user = user_id.toString();

    const embed_data = JSON.stringify({
      redirecturl: "http://localhost:3000/payment-callback/zalopay",
      preferred_payment_method: ["zalopay_wallet"],
    });
    const item_str = JSON.stringify(items);

    const amountNumber = Number(total_amount);

    const mac_input = `${ZALO_CONFIG.APP_ID}|${app_trans_id}|${app_user}|${amountNumber}|${app_time}|${embed_data}|${item_str}`;
    const mac = generateMac(ZALO_CONFIG.KEY1, mac_input);

    // 🚀 Tạo đơn hàng trong DB
    const order = await prisma.orders.create({
      data: {
        order_code: orderCode,
        user_id: Number(user_id),
        coupon_amount,
        ship_amount,
        amount: amountNumber,
        payment_method,
        status: payment_method === "zalopay" ? "pending" : "waiting_payment",
        shipping_address: address_detail,
        ward_address: address.ward_name,
        district_address: address.district_name,
      },
    });

    // 🧾 Tạo order_items
    const orderItemsData = items.map((item: Order_Item) => ({
      order_id: order.id,
      product_id: Number(item.product_id),
      quantity: Number(item.quantity),
      price: Number(item.price),
      total_price: Number(item.price) * Number(item.quantity),
    }));
    await prisma.order_items.createMany({ data: orderItemsData });

    console.log("✅ Đơn hàng đã tạo trong DB:", order.order_code);


    // 🔁 Lấy lại đơn hàng kèm sản phẩm
    const fullOrder = await prisma.orders.findUnique({
      where: { id: order.id },
      include: { order_items: { include: { product: true } } },
    });
    if (!fullOrder) throw new Error("Không thể lấy lại dữ liệu đơn hàng.");

    // 🧭 Parse địa chỉ để gửi GHN
    const [recipient_name, recipient_phone, ...addressParts] =
      address_detail.split("-");
    const toAddress = addressParts.join("-").trim();

    // 📦 Payload GHN
    const ghnPayload = {
      shop_id: GHN_SHOP_ID,
      payment_type_id: 1,
      note: `Giao đơn hàng #${order.order_code}`,
      required_note: "KHONGCHOXEMHANG",
      return_phone: "0967123456",
      return_address: "123 QL13, Phường Hiệp An, Thủ Dầu Một, Bình Dương",
      return_district_id: 1482,
      to_name: recipient_name || "Khách hàng",
      to_phone: recipient_phone || "0000000000",
      to_address: toAddress,
      to_ward_code: "90737",
      to_district_id: 1482,
      cod_amount: 0,
      weight: 500,
      length: 30,
      width: 20,
      height: 10,
      service_type_id: 2,
      items: fullOrder.order_items.map((item) => ({
        name: item.product?.name || "Sản phẩm",
        quantity: item.quantity,
        price: Math.round(Number(item.price)),
        weight: 200,
      })),
    };

    // 🚀 Gửi yêu cầu GHN
    const ghnRes = await fetch(`${GHN_BASE_URL}/v2/shipping-order/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Token: GHN_TOKEN,
        ShopId: GHN_SHOP_ID.toString(),
      },
      body: JSON.stringify(ghnPayload),
    });

    const ghnData = await ghnRes.json();
    console.log("📨 GHN response:", ghnData);

    // 🧾 Lưu thông tin GHN vào DB nếu thành công
    if (ghnData?.data) {
      await prisma.orders.update({
        where: { id: order.id },
        data: {
          order_code: ghnData.data.order_code,
          // ghn_expected_date: new Date(ghnData.data.expected_delivery_time),
          ship_amount: ghnData.data.total_fee || 0,
        },
      });
    }

    // 🔹 Tạo đơn thanh toán trên ZaloPay
    const orderPayload = {
      app_id: ZALO_CONFIG.APP_ID,
      app_user,
      app_trans_id,
      app_time,
      amount: amountNumber,
      description: `Thanh toán đơn hàng #${orderCode}`,
      embed_data,
      item: item_str,
      mac,
      callback_url: ZALO_CONFIG.CALLBACK_URL,
      bank_code: "",
      expire_duration_seconds: 3600,
    };

    const zaloRes = await fetch(ZALO_CONFIG.CREATE_ORDER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload),
    });
    const zaloData = await zaloRes.json();
    console.log("💰 ZaloPay response:", zaloData);

    // ⚙️ Kết quả trả về frontend
    if (zaloData.return_code === 1) {
      return NextResponse.json({
        success: true,
        message: "Tạo đơn hàng ZaloPay + GHN thành công!",
        order_id: order.id,
        order_code: order.order_code,
        order_url: zaloData.order_url, // QR thanh toán
        ghn_response: ghnData,
        return_code: zaloData.return_code
      });
    } else {
      return NextResponse.json(
        { error: zaloData.sub_return_message || "Không thể tạo đơn ZaloPay" },
        { status: 400 }
      );
    }
  } catch (err) {
    console.error("❌ Lỗi khi tạo đơn hàng:", err);
    return NextResponse.json(
      { error: "Tạo đơn hàng thất bại", details: err },
      { status: 500 }
    );
  }
}
