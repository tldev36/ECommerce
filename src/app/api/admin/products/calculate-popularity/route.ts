// app/api/admin/products/calculate-popularity/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    console.log("🔄 Bắt đầu tính toán Popularity...");

    // 1. Tính tổng điểm tương tác cho từng sản phẩm
    // Chúng ta sẽ cộng dồn 'interaction_weight' (Ví dụ: xem=1 điểm, mua=5 điểm)
    // Nếu bảng interactions của bạn có cột 'interaction_weight', dùng _sum.
    // Nếu không, dùng _count để đếm số lượt.
    const interactions = await prisma.user_product_interactions.groupBy({
      by: ['product_id'],
      _sum: {
        interaction_weight: true, // Cộng tổng trọng số (chính xác hơn đếm lượt)
      },
      // _count: { _all: true } // Dùng dòng này nếu muốn đếm số lượt đơn thuần
    });

    console.log(`📊 Tìm thấy dữ liệu tương tác của ${interactions.length} sản phẩm.`);

    // 2. Cập nhật vào Database (Dùng transaction cho an toàn)
    await prisma.$transaction(async (tx) => {
      
      // Bước A: Reset toàn bộ popularity về 0 (để xóa các sản phẩm không còn hot)
      await tx.products.updateMany({
        data: { popularity: 0 } 
      });

      // Bước B: Cập nhật điểm mới
      for (const item of interactions) {
        // Lấy tổng điểm (nếu null thì coi là 0)
        // Nếu bạn dùng _count thì sửa thành: const score = item._count._all;
        const score = Number(item._sum.interaction_weight) || 0; 

        // Update vào cột popularity
        await tx.products.update({
          where: { id: item.product_id },
          data: { popularity: score }, 
        });
      }
    });

    return NextResponse.json({ 
      message: "Đã cập nhật Popularity thành công!", 
      updated_count: interactions.length 
    });

  } catch (error) {
    console.error("Lỗi tính toán popularity:", error);
    return NextResponse.json({ message: "Lỗi server khi tính toán" }, { status: 500 });
  }
}