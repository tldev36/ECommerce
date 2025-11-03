import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Order_Item } from "@/types/order_item";

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
    const orderCode = `ORD${Date.now()}${Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase()}`;

    // lấy thông tin của shipping_address_id

    const address_detail = `${address.recipient_name}-${address.phone}-${address.detail_address},${address.ward_name},${address.district_name},${address.province_name}`;


    // 🚀 Tạo đơn hàng
    const order = await prisma.orders.create({
      data: {
        order_code: orderCode,
        user_id: Number(user_id),
        coupon_amount: coupon_amount,
        ship_amount: ship_amount,
        amount: Number(total_amount),
        payment_method,
        status: payment_method === "cod" ? "pending" : "waiting_payment",
        shipping_address: String(address_detail),
        ward_address: address.ward_name || null,
        district_address: address.district_name || null,
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
        total_price
      };
    });

    // 💾 Thêm danh sách sản phẩm vào order_items
    await prisma.order_items.createMany({
      data: orderItemsData,
    });

    // 📦 Lấy lại thông tin đơn hàng kèm chi tiết
    const fullOrder = await prisma.orders.findUnique({
      where: { id: order.id },
      include: {
        order_items: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Tạo đơn hàng thành công!",
      order: fullOrder,
    });
  } catch (error: any) {
    console.error("❌ Lỗi tạo đơn hàng:", error);
    return NextResponse.json(
      { error: error.message || "Lỗi server khi tạo đơn hàng." },
      { status: 500 }
    );
  }
}
