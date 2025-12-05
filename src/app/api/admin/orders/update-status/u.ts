import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ORDER_STATUS } from "@/config/order-status.config"; // Import config để validate

// ✅ Export hàm PUT để khớp với axios.put ở frontend
export async function PUT(req: Request) {
  try {
    // 1. Lấy dữ liệu từ Frontend gửi lên
    const body = await req.json();
    const { orderId, newStatus } = body;

    // Validate cơ bản
    if (!orderId || !newStatus) {
      return NextResponse.json(
        { success: false, error: "Thiếu orderId hoặc newStatus" },
        { status: 400 }
      );
    }

    // Validate trạng thái có hợp lệ trong hệ thống không
    const isValidStatus = Object.values(ORDER_STATUS).some(s => s.code === newStatus);
    if (!isValidStatus) {
      return NextResponse.json(
        { success: false, error: `Trạng thái '${newStatus}' không hợp lệ` },
        { status: 400 }
      );
    }

    // 2. Bắt đầu Transaction (Quan trọng để Hoàn kho an toàn)
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // A. Lấy thông tin đơn hàng hiện tại
      const currentOrder = await tx.orders.findUnique({
        where: { id: Number(orderId) },
        include: { order_items: true },
      });

      if (!currentOrder) {
        throw new Error("Không tìm thấy đơn hàng.");
      }

      // B. LOGIC HỦY ĐƠN (Hoàn kho)
      // Nếu trạng thái mới là CANCELLED và đơn cũ chưa hủy -> Cộng lại kho
      if (newStatus === "CANCELLED" && currentOrder.status !== "CANCELLED") {
        for (const item of currentOrder.order_items) {
          await tx.products.update({
            where: { id: item.product_id || 0 },
            data: {
              stock_quantity: { increment: item.quantity }, // Trả lại hàng vào kho
              // sold: { decrement: item.quantity } // Giảm số lượng đã bán (nếu có trường này)
            },
          });
        }
      }

      // C. LOGIC HOÀN TẤT (Thanh toán)
      // Nếu trạng thái mới là COMPLETED -> Set đã thanh toán
      let updateData: any = { 
        status: newStatus,
        updated_at: new Date()
      };

      if (newStatus === "COMPLETED") {
        updateData.payment_status = "PAID";
        updateData.completed_at = new Date();
      }

      // D. Cập nhật đơn hàng
      const order = await tx.orders.update({
        where: { id: Number(orderId) },
        data: updateData,
      });

      return order;
    });

    // 3. Trả về kết quả thành công
    return NextResponse.json({
      success: true,
      message: "Cập nhật thành công",
      order: updatedOrder,
    });

  } catch (error: any) {
    console.error("❌ Lỗi API update-status:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi server" },
      { status: 500 }
    );
  }
}