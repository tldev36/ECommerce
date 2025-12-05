import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  // 1. Sửa lại type ở đây: params.id nhận vào là string
  { params }: { params: { id: string } } 
) {
  try {
    // 2. Ép kiểu String -> Int
    // Nếu DB của bạn dùng UUID (String) thì không cần parseInt, nhưng nếu là Auto Increment (Int) thì BẮT BUỘC phải có.
    const orderId = parseInt(params.id); 

    // Kiểm tra nếu ID không phải là số hợp lệ
    if (isNaN(orderId)) {
      return NextResponse.json({ error: "ID đơn hàng không hợp lệ" }, { status: 400 });
    }

    const body = await req.json();
    const { userId } = body;

    // 3. Tìm đơn hàng
    const order = await prisma.orders.findUnique({
      where: { id: orderId }, // Bây giờ orderId đã là số, Prisma sẽ hiểu
    });

    if (!order) {
      return NextResponse.json({ error: "Không tìm thấy đơn hàng" }, { status: 404 });
    }

    // --- BẢO MẬT & CHECK LOGIC (Giữ nguyên code tốt của bạn) ---
    if (order.user_id && String(order.user_id) !== String(userId)) {
      return NextResponse.json(
        { error: "Bạn không có quyền hủy đơn hàng này" },
        { status: 403 }
      );
    }

    const currentStatus = order.status?.toUpperCase(); // Đảm bảo so sánh chính xác
    if (currentStatus !== "PENDING") {
      return NextResponse.json(
        { error: "Đơn hàng đã được xử lý, không thể hủy." },
        { status: 400 }
      );
    }

    // 4. Update Database
    const updatedOrder = await prisma.orders.update({
      where: { id: orderId },
      data: { 
        status: "CANCELLED",       
        payment_status: "UNPAID",
      },
    });

    return NextResponse.json({ 
      message: "Hủy đơn hàng thành công", 
      order: updatedOrder 
    });

  } catch (err) {
    console.error("Lỗi Server:", err);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}