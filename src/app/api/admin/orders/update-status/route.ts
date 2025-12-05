import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ORDER_STATUS } from "@/config/order-status.config";
import { sendOrderStatusUpdateEmail } from "@/lib/mail"; // Import hàm mới

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { orderId, newStatus } = body;

    // Validate cơ bản
    if (!orderId || !newStatus) {
      return NextResponse.json(
        { success: false, error: "Thiếu orderId hoặc newStatus" },
        { status: 400 }
      );
    }

    const isValidStatus = Object.values(ORDER_STATUS).some(s => s.code === newStatus);
    if (!isValidStatus) {
      return NextResponse.json(
        { success: false, error: `Trạng thái '${newStatus}' không hợp lệ` },
        { status: 400 }
      );
    }

    // 🛡️ BẮT ĐẦU TRANSACTION
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // A. Lấy đơn hàng hiện tại
      const currentOrder = await tx.orders.findUnique({
        where: { id: Number(orderId) },
        include: { order_items: true },
      });

      if (!currentOrder) {
        throw new Error("Không tìm thấy đơn hàng.");
      }

      // B. LOGIC HỦY ĐƠN (Hoàn kho)
      if (newStatus === "CANCELLED" && currentOrder.status !== "CANCELLED") {
        for (const item of currentOrder.order_items) {
          await tx.products.update({
            where: { id: item.product_id || 0 },
            data: {
              stock_quantity: { increment: item.quantity },
            },
          });
        }
      }

      // C. LOGIC HOÀN TẤT
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

    // ============================================================
    // 📧 GỬI EMAIL THÔNG BÁO (Thực hiện sau khi Transaction thành công)
    // ============================================================
    try {
        // 1. Lấy thông tin User để lấy Email
        const user = await prisma.users.findUnique({
            where: { id: updatedOrder.user_id ?? 0}, // Dùng user_id từ đơn hàng vừa update
            select: { email: true, name: true }
        });

        if (user && user.email) {
            await sendOrderStatusUpdateEmail({
                to: user.email,
                orderCode: updatedOrder.order_code || `#${updatedOrder.id}`,
                customerName: user.name || "Quý khách",
                newStatus: newStatus,
                note: "Vui lòng kiểm tra lại đơn hàng trong phần lịch sử mua hàng."
            });
            console.log(`📧 Đã gửi mail cập nhật trạng thái cho đơn ${updatedOrder.id}`);
        }
    } catch (mailError) {
        // Chỉ log lỗi, KHÔNG làm fail API response vì đơn hàng đã cập nhật thành công rồi
        console.error("❌ Lỗi gửi email trạng thái:", mailError);
    }

    // 3. Trả về kết quả
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