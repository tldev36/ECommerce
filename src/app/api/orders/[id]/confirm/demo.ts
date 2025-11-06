import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const GHN_BASE_URL = process.env.GHN_BASE_URL!;
const GHN_TOKEN = process.env.GHN_TOKEN!;
const GHN_SHOP_ID = Number(process.env.GHN_SHOP_ID!);

// ✅ PUT /api/orders/[id]/confirm
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const orderId = parseInt(id, 10);
    if (isNaN(orderId)) {
      return NextResponse.json(
        { success: false, message: "ID đơn hàng không hợp lệ." },
        { status: 400 }
      );
    }

    // 🔍 Lấy đơn hàng cùng sản phẩm (phải có quan hệ trong Prisma)
    const order = await prisma.orders.findUnique({
      where: { id: orderId },
      include: {
        order_items: {
          include: { product: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy đơn hàng." },
        { status: 404 }
      );
    }

    // ✅ Kiểm tra địa chỉ giao hàng
    if (!order.shipping_address || order.shipping_address.trim() === "") {
      return NextResponse.json(
        { success: false, message: "Đơn hàng chưa có địa chỉ giao hàng." },
        { status: 400 }
      );
    }

    // 📦 Parse địa chỉ: "Tên-SĐT-Địa chỉ,..."
    const [recipient_name, recipient_phone, ...addressParts] =
      order.shipping_address.split("-");
    const toAddress = addressParts.join("-").trim();

    // ⚙️ Payload gửi GHN (chuẩn cho môi trường dev)
    const ghnPayload = {
      shop_id: GHN_SHOP_ID,
      payment_type_id: 2, // 1: người nhận trả phí, 2: người bán trả phí
      note: `Giao đơn hàng #${order.order_code}`,
      required_note: "KHONGCHOXEMHANG",
      return_phone: "0967123456",
      return_address: "123 QL13, Phường Hiệp An, Thủ Dầu Một, Bình Dương",
      return_district_id: 1482, // ⚠️ ID thật trong GHN dev
      to_name: recipient_name || "Khách hàng",
      to_phone: recipient_phone || "0000000000",
      to_address: toAddress,
      to_ward_code: "90737", // ⚠️ Mã phường GHN dev (Phường Hiệp An)
      to_district_id: 1482, // ⚠️ Thành phố Thủ Dầu Một
      cod_amount: Math.round(Number(order.amount)),
      weight: 500,
      length: 30,
      width: 20,
      height: 10,
      service_type_id: 2, // Hàng nhẹ
      items: order.order_items.map((item) => ({
        name: item.product?.name || "Sản phẩm",
        quantity: item.quantity,
        price: Math.round(Number(item.price)),
        weight: 200, // gram/sp
      })),
    };

    console.log("📦 GHN request payload:", ghnPayload);

    // 🚀 Gửi yêu cầu tạo đơn GHN
    const ghnRes = await fetch(
      `${GHN_BASE_URL}/v2/shipping-order/create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Token: GHN_TOKEN,
          ShopId: GHN_SHOP_ID.toString(),
        },
        body: JSON.stringify(ghnPayload),
      }
    );

    const ghnData = await ghnRes.json();
    console.log("📨 GHN response:", ghnData);

    if (!ghnRes.ok || !ghnData?.data?.order_code) {
      return NextResponse.json(
        {
          success: false,
          message: ghnData.message || "GHN không tạo được đơn hàng.",
          detail: ghnData,
        },
        { status: 500 }
      );
    }

    const ghnOrderCode = ghnData.data.order_code;

    // ✅ Cập nhật đơn hàng
    const updatedOrder = await prisma.orders.update({
      where: { id: orderId },
      data: {
        order_code: ghnOrderCode,
        status: "seed",
      },
      include: {
        order_items: {
          include: { product: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Tạo đơn hàng GHN (sandbox) thành công.",
      ghn_order_code: ghnOrderCode,
      orderstatus: updatedOrder,
    });
  } catch (error: any) {
    console.error("❌ Lỗi khi gửi GHN:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khi xử lý đơn hàng.", error: error.message },
      { status: 500 }
    );
  }
}
