import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Order_Item } from "@/types/order_item";

const GHN_BASE_URL = process.env.GHN_BASE_URL!;
const GHN_TOKEN = process.env.GHN_TOKEN!;
const GHN_SHOP_ID = Number(process.env.GHN_SHOP_ID!);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      user_id,
      shipping_address_id,
      items,
      total_amount,
      payment_method,
      coupon_amount,
      ship_amount,
    } = body;

    // 🧩 Kiểm tra dữ liệu đầu vào
    if (!user_id || !shipping_address_id || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Thiếu dữ liệu đầu vào (user_id, địa chỉ hoặc giỏ hàng)." },
        { status: 400 }
      );
    }

    // 🏠 Lấy địa chỉ giao hàng trong DB
    const address = await prisma.shipping_addresses.findUnique({
      where: { id: Number(shipping_address_id) },
    });

    if (!address) {
      return NextResponse.json(
        { error: "Không tìm thấy địa chỉ giao hàng." },
        { status: 404 }
      );
    }

    // 🧮 Tạo mã đơn hàng
    const now = Date.now().toString();
    const orderCode = `OD${now.slice(-6)}`;

    // 📦 Gộp địa chỉ để lưu
    const address_detail = `${address.recipient_name}-${address.phone}-${address.detail_address},${address.ward_name},${address.district_name},${address.province_name}`;

    // 🚀 Tạo đơn hàng trong DB
    const order = await prisma.orders.create({
      data: {
        order_code: orderCode,
        user_id: Number(user_id),
        coupon_amount,
        ship_amount,
        amount: Number(total_amount),
        payment_method,
        status: payment_method === "cod" ? "pending" : "waiting_payment",
        shipping_address: address_detail,
        ward_address: address.ward_name,
        district_address: address.district_name,
      },
    });

    // 🧾 Chuẩn bị dữ liệu cho order_items
    const orderItemsData = items.map((item: Order_Item) => {
      const price = Number(item.price);
      const quantity = Number(item.quantity);
      const total_price = price * quantity;
      return {
        order_id: order.id,
        product_id: Number(item.product_id),
        quantity,
        price,
        total_price,
      };
    });

    // 💾 Thêm danh sách sản phẩm vào order_items
    await prisma.order_items.createMany({
      data: orderItemsData,
    });

    // 📦 Lấy lại thông tin đơn hàng kèm chi tiết sản phẩm
    const fullOrder = await prisma.orders.findUnique({
      where: { id: order.id },
      include: {
        order_items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!fullOrder) throw new Error("Không thể lấy lại dữ liệu đơn hàng sau khi tạo.");

    // 🧭 Parse địa chỉ để gửi GHN (tách theo cú pháp bạn đã lưu)
    const [recipient_name, recipient_phone, ...addressParts] =
      address_detail.split("-");
    const toAddress = addressParts.join("-").trim();

    // 📦 Payload GHN
    const ghnPayload = {
      shop_id: GHN_SHOP_ID,
      payment_type_id: 2, // 2: người nhận trả phí ship
      note: `Giao đơn hàng #${order.order_code}`,
      required_note: "KHONGCHOXEMHANG",
      return_phone: "0967123456",
      return_address: "123 QL13, Phường Hiệp An, Thủ Dầu Một, Bình Dương",
      return_district_id: 1482, // Thành phố Thủ Dầu Một
      to_name: recipient_name || "Khách hàng",
      to_phone: recipient_phone || "0000000000",
      to_address: toAddress,
      to_ward_code: "90737", // Phường Hiệp An
      to_district_id: 1482,
      cod_amount: Math.round(Number(order.amount)),
      weight: 500,
      length: 30,
      width: 20,
      height: 10,
      service_type_id: 2, // Hàng nhẹ
      items: fullOrder.order_items.map((item) => ({
        name: item.product?.name || "Sản phẩm",
        quantity: item.quantity,
        price: Math.round(Number(item.price)),
        weight: 200, // gram/sp
      })),
    };

    console.log("📦 GHN request payload:", ghnPayload);

    // 🚀 Gửi yêu cầu tạo đơn GHN
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

    return NextResponse.json({
      success: true,
      message: "Tạo đơn hàng thành công!",
      order: fullOrder,
      ghn_response: ghnData,
    });
  } catch (error: any) {
    console.error("❌ Lỗi tạo đơn hàng:", error);
    return NextResponse.json(
      { error: error.message || "Lỗi server khi tạo đơn hàng." },
      { status: 500 }
    );
  }
}
