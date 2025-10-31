import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * 🧩 API: /api/zalopay/callback
 * Nhận dữ liệu từ client sau khi người dùng được redirect về
 */
export async function POST(req: Request) {
  try {
    const { app_trans_id, status } = await req.json();

    if (!app_trans_id) {
      return NextResponse.json({ success: false, message: "Thiếu app_trans_id" }, { status: 400 });
    }

    console.log("📦 ZaloPay Callback:", { app_trans_id, status });

    // ✅ Nếu thanh toán thành công (status === "1")
    if (status === "1") {
      const updated = await prisma.orders.updateMany({
        where: { order_code: app_trans_id },
        data: {
          status: "paid",
          // payment_date: new Date(),
        },
      });

      if (updated.count === 0) {
        console.warn(`⚠️ Không tìm thấy đơn hàng ${app_trans_id}`);
        return NextResponse.json({
          success: false,
          message: "Không tìm thấy đơn hàng để cập nhật",
        });
      }

      console.log(`✅ Đơn hàng ${app_trans_id} → ĐÃ THANH TOÁN`);
      return NextResponse.json({
        success: true,
        message: "Cập nhật đơn hàng thành công",
      });
    }

    // ❌ Nếu thất bại
    await prisma.orders.updateMany({
      where: { order_code: app_trans_id },
      data: { status: "cancelled" },
    });

    return NextResponse.json({
      success: false,
      message: "Thanh toán thất bại hoặc bị hủy",
    });
  } catch (error: any) {
    console.error("❌ Lỗi callback:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi xử lý callback", details: error.message },
      { status: 500 }
    );
  }
}
