import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ✅ PUT - Cập nhật coupon
export async function PUT(
  req: Request,
  // Fix cho Next.js 15: params là Promise
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await context.params;
    const id = Number(idParam);
    
    if (isNaN(id)) {
        return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 });
    }

    const data = await req.json();

    const payload = {
      code: data.code,
      description: data.description || "",
      // Logic: Nếu gửi null/undefined thì giữ nguyên hoặc set null tuỳ logic
      // Ở đây giả sử form gửi chuỗi rỗng "" thì convert thành null
      discount_percent: data.discount_percent ? Number(data.discount_percent) : null,
      discount_amount: data.discount_amount ? Number(data.discount_amount) : null,
      usage_limit: data.usage_limit ? Number(data.usage_limit) : null,
      valid_from: data.valid_from ? new Date(data.valid_from) : null,
      valid_until: data.valid_until ? new Date(data.valid_until) : null,
      status: data.status ? true : false, // Map boolean -> string "1"/"0"
    };

    const updated = await prisma.coupons.update({
      where: { id },
      data: payload,
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("❌ PUT /api/coupons/[id] error:", err);
    return NextResponse.json(
      { error: "Không thể cập nhật mã giảm giá", details: String(err) },
      { status: 500 }
    );
  }
}


// ✅ PATCH - Chỉ đổi trạng thái nhanh (Quick Toggle)
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> } // Fix cho Next.js 15
) {
  try {
    const { id: idParam } = await context.params;
    const id = Number(idParam);

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 });
    }

    const body = await req.json();
    const { status } = body;

    // Kiểm tra xem client có gửi status lên không
    if (typeof status === "undefined") {
      return NextResponse.json({ error: "Thiếu trường status" }, { status: 400 });
    }

    // Cập nhật chỉ mỗi trường status
    const updated = await prisma.coupons.update({
      where: { id },
      data: {
        status: Boolean(status), // Ép kiểu về boolean cho chắc chắn
      },
    });

    return NextResponse.json({ success: true, status: updated.status });
  } catch (error) {
    console.error("❌ PATCH Status Error:", error);
    return NextResponse.json(
      { error: "Lỗi cập nhật trạng thái" },
      { status: 500 }
    );
  }
}


// ✅ DELETE - Xóa mã giảm giá
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> } // Fix cho Next.js 15
) {
  try {
    const { id: idParam } = await context.params;
    const id = Number(idParam);

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 });
    }

    // 1️⃣ (Tùy chọn) Kiểm tra xem mã này có đang dính líu đến Đơn hàng nào không?
    // Nếu bạn có bảng Orders, hãy uncomment đoạn dưới đây để an toàn dữ liệu:
    /*
    const usageCount = await prisma.orders.count({
      where: { coupon_id: id } 
    });

    if (usageCount > 0) {
       return NextResponse.json(
         { error: "Không thể xóa! Mã này đã được sử dụng trong đơn hàng. Hãy ẩn nó đi thay vì xóa." },
         { status: 409 } // 409 Conflict
       );
    }
    */

    // 2️⃣ Thực hiện xóa
    await prisma.coupons.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Đã xóa mã giảm giá" });

  } catch (error: any) {
    console.error("❌ DELETE Coupon Error:", error);

    // Bắt lỗi Prisma: Record to delete does not exist (P2025)
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Mã giảm giá không tồn tại" }, { status: 404 });
    }

    // Bắt lỗi Prisma: Foreign Key Constraint (P2003) - Nếu bước 1 chưa check
    if (error.code === 'P2003') {
       return NextResponse.json(
         { error: "Không thể xóa do mã này đang được sử dụng ở dữ liệu khác (đơn hàng)." },
         { status: 409 }
       );
    }

    return NextResponse.json(
      { error: "Lỗi máy chủ nội bộ, không thể xóa" },
      { status: 500 }
    );
  }
}