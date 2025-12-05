// /app/api/zalopay/callback/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { ZALO_CONFIG } from "@/config";

// 🔐 Hàm tạo checksum từ ZaloPay
function generateZaloChecksum(key: string, data: string) {
  if (!key) throw new Error("Zalo KEY1 chưa được set");
  return crypto.createHmac("sha256", key).update(data).digest("hex");
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const params = url.searchParams;

    const app_trans_id = params.get("apptransid");
    const amount = params.get("amount");
    const app_id = params.get("appid");
    const status = params.get("status");
    const receivedChecksum = params.get("checksum");

    if (!app_trans_id || !amount || !app_id || !status || !receivedChecksum) {
      return NextResponse.json({ success: false, error: "Thiếu params ZaloPay" }, { status: 400 });
    }

    // 🔹 Tạo checksum để so sánh với ZaloPay gửi
    const dataToCheck = `${app_id}|${app_trans_id}|${amount}|${status}`;
    const calculatedChecksum = generateZaloChecksum(ZALO_CONFIG.KEY1, dataToCheck);

    if (calculatedChecksum !== receivedChecksum) {
      return NextResponse.json({ success: false, error: "Checksum không hợp lệ" }, { status: 400 });
    }

    // 🔹 Cập nhật trạng thái đơn hàng trong DB
    const order = await prisma.orders.update({
      where: { order_code: app_trans_id },
      data: { payment_status: status === "1" ? "PAID" : "UNPAID" },
    });

    return NextResponse.json({ success: true, order_id: order.id, status: order.status });
  } catch (err: any) {
    console.error("❌ Lỗi callback ZaloPay:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
