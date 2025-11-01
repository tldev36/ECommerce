import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import axios from "axios";
import { GHN_CONFIG } from "@/config";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("🧾 orderInfo:", body);

    const {
      user_id,
      shipping_address_id,
      items,
      total_amount,
      payment_method,
      coupon_id,
      shipping_address, // chứa thông tin người nhận + mã ward/district
    } = body;

    // 🧩 Kiểm tra dữ liệu đầu vào
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Giỏ hàng trống, không thể tạo đơn hàng." },
        { status: 400 }
      );
    }

    if (!shipping_address) {
      return NextResponse.json(
        { error: "Thiếu thông tin địa chỉ giao hàng!" },
        { status: 400 }
      );
    }

    // 🧮 Tạo mã đơn hàng
    const orderCode = `ORD${Date.now()}${Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase()}`;

    // 🧾 Tạo đơn hàng trong database
    const order = await prisma.orders.create({
      data: {
        order_code: orderCode,
        user_id: user_id || null,
        shipping_address_id: shipping_address_id || null,
        coupon_id: coupon_id || null,
        total_amount,
        payment_method,
        status: payment_method === "cod" ? "pending" : "waiting_payment",
        order_items: {
          create: items.map((item: any) => ({
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
            discount_percent: item.discount_percent || 0,
            final_price:
              item.price * (1 - (item.discount_percent || 0) / 100),
            subtotal:
              item.quantity *
              item.price *
              (1 - (item.discount_percent || 0) / 100),
          })),
        },
      },
      include: { order_items: true },
    });

    // 🚚 Tạo đơn GHN nếu có địa chỉ
    try {
      // 🏬 Thông tin cửa hàng
      const fromData = {
        from_name: "Cửa hàng Thanh Lan",
        from_phone: "0909123456",
        from_address: "Đường Lê Hồng Phong, Tổ 1 Khu 5",
        from_ward_code: "440108", // Mã phường Phú Hòa
        from_district_id: 1501,   // Mã quận/huyện: TP Thủ Dầu Một
      };

      // 🧍‍♂️ Thông tin người nhận
      const toData = {
        to_name: shipping_address.name,
        to_phone: shipping_address.phone,
        to_address: shipping_address.address,
        to_ward_code: shipping_address.ward_code,
        to_district_id: shipping_address.district_id,
      };

      // ✅ Tính tổng khối lượng, mặc định mỗi sản phẩm 200g nếu không có
      const totalWeight = items.reduce(
        (acc: number, i: any) => acc + (Number(i.weight) > 0 ? Number(i.weight) : 200) * Number(i.quantity || 1),
        0
      );

      // ⚙️ Cấu trúc dữ liệu gửi GHN
      const ghnData = {
        shop_id: Number(process.env.GHN_SHOP_ID),
        ...fromData,
        ...toData,
        client_order_code: orderCode,
        cod_amount: payment_method === "cod" ? Number(total_amount) : 0,
        content: "Đơn hàng từ website Thanh Lan",
        weight: totalWeight || 200, // ✅ GHN bắt buộc có, mặc định 200g nếu không có
        length: 20,
        width: 15,
        height: 5,
        service_type_id: 2, // Dịch vụ tiêu chuẩn
        payment_type_id: 1, // Người gửi trả phí ship
        required_note: "CHOTHUHANG",
        items: items.map((i: any) => ({
          name: i.name,
          quantity: Number(i.quantity) || 1,
          price: Number(i.price) || 0,
          weight: Number(i.weight) > 0 ? Number(i.weight) : 200, // ✅ mỗi sản phẩm phải có weight
        })),
      };

      const ghnRes = await axios.post(
        `${GHN_CONFIG.BASE_URL}/v2/shipping-order/create`,
        ghnData,
        {
          headers: {
            Token: GHN_CONFIG.TOKEN,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Đơn GHN:", ghnRes.data);

      // Nếu thành công, lưu mã vận đơn vào DB
      // if (ghnRes.data?.data?.order_code) {
      //   await prisma.orders.update({
      //     where: { id: order.id },
      //     data: { shipping_code: ghnRes.data.data.order_code },
      //   });
      // }
    } catch (err: any) {
      console.error("❌ Lỗi tạo đơn GHN:", err.response?.data || err.message);
    }

    return NextResponse.json({
      success: true,
      message: "Tạo đơn hàng thành công",
      order,
    });
  } catch (error) {
    console.error("❌ Lỗi khi tạo hóa đơn:", error);
    return NextResponse.json(
      { error: "Lỗi server, không thể tạo đơn hàng." },
      { status: 500 }
    );
  }
}
