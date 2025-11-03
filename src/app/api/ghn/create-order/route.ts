import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      to_name,
      to_phone,
      to_address,
      to_ward_code,
      to_district_id,
      cod_amount,
      weight,
      length,
      width,
      height,
      items,
    } = body;

    // ⚙️ Cấu hình GHN
    const headers = {
      "Content-Type": "application/json",
      Token: process.env.GHN_TOKEN!,
      ShopId: process.env.GHN_SHOP_ID!,
    };

    // 🧾 Tạo đơn hàng GHN
    const response = await axios.post<{ data: any }>(
      `${process.env.GHN_BASE_URL}/v2/shipping-order/create`,
      {
        payment_type_id: 2, // 2 = Người nhận trả
        note: "Giao hàng sau khi thanh toán ZaloPay thành công",
        required_note: "KHONGCHOXEMHANG",
        to_name,
        to_phone,
        to_address,
        to_ward_code,
        to_district_id,
        cod_amount: cod_amount || 0,
        content: "Đơn hàng ZaloPay",
        weight: weight || 500,
        length: length || 20,
        width: width || 15,
        height: height || 10,
        service_type_id: 2, // Dịch vụ tiêu chuẩn
        items: items || [],
      },
      { headers }
    );

    return NextResponse.json({
      success: true,
      data: response.data.data,
    });
  } catch (error: any) {
    console.error("❌ Lỗi tạo đơn GHN:", error.response?.data || error.message);
    return NextResponse.json(
      {
        success: false,
        message: error.response?.data || error.message,
      },
      { status: 500 }
    );
  }
}
