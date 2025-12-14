import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// 👇 1. Import config (hãy đảm bảo đường dẫn đúng với cấu trúc folder của bạn)
import { ORDER_STATUS, OrderStatusType } from "@/config/order-status.config"; 

export async function GET() {
  try {
    // Gom nhóm theo trạng thái và đếm số lượng
    const ordersGrouped = await prisma.orders.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    // 👇 2. Map dữ liệu sang tiếng Việt và thêm màu sắc
    const formattedData = ordersGrouped.map((item) => {
      // Ép kiểu status để TypeScript hiểu đây là key hợp lệ
      const statusKey = item.status as OrderStatusType;
      
      // Lấy thông tin config tương ứng, nếu không tìm thấy (null/undefined) thì fallback về object rỗng
      const statusInfo = ORDER_STATUS[statusKey];

      return {
        // Trả về tên hiển thị Tiếng Việt (VD: "Chờ xác nhận")
        // Nếu không tìm thấy trong config thì giữ nguyên code gốc
        name: statusInfo?.label || item.status, 
        
        value: item._count.id,
        
        // ✨ Gợi ý: Trả thêm mã màu để Recharts tự tô màu đúng theo quy định
        fill: statusInfo?.color || '#94a3b8', 
        
        // Giữ lại code gốc nếu frontend cần dùng logic khác
        originalStatus: item.status 
      };
    });

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Lỗi Orders API:", error);
    return NextResponse.json([], { status: 500 });
  }
}