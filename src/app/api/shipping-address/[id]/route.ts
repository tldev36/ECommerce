import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const SECRET = process.env.JWT_SECRET || "supersecret";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    // 🧩 Xác thực token
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, SECRET) as { id: number };

    // 🆔 Kiểm tra id hợp lệ
    const addressId = Number(params.id);
    if (Number.isNaN(addressId))
      return NextResponse.json({ error: "Id không hợp lệ" }, { status: 400 });

    // 🧾 Lấy dữ liệu từ body
    const {
      recipient_name,
      phone,
      detail_address,
      ward_name,
      district_name,
      province_name,
      default: isDefault,
    } = await req.json();

    // 🧰 Kiểm tra trường bắt buộc
    const missing: string[] = [];
    if (!recipient_name?.trim()) missing.push("Họ tên");
    if (!phone?.trim()) missing.push("Số điện thoại");
    if (!detail_address?.trim()) missing.push("Địa chỉ chi tiết");
    if (!ward_name?.trim()) missing.push("Xã/Phường");
    if (missing.length) {
      return NextResponse.json(
        { error: `Thiếu: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    // ✅ Kiểm tra quyền sở hữu
    const existing = await prisma.shipping_addresses.findFirst({
      where: { id: addressId, user_id: decoded.id },
    });
    if (!existing)
      return NextResponse.json(
        { error: "Không tìm thấy địa chỉ hoặc không có quyền" },
        { status: 404 }
      );

    // 🧩 Nếu user đặt địa chỉ này là mặc định → bỏ mặc định ở địa chỉ khác
    if (isDefault) {
      await prisma.shipping_addresses.updateMany({
        where: { user_id: decoded.id, default: true, NOT: { id: addressId } },
        data: { default: false },
      });
    }

    // 🚀 Cập nhật thông tin
    const updated = await prisma.shipping_addresses.update({
      where: { id: addressId },
      data: {
        recipient_name,
        phone,
        detail_address,
        ward_name,
        district_name,
        province_name,
        default: !!isDefault,
        update_at: new Date(),
      },
    });

    return NextResponse.json({ address: updated }, { status: 200 });
  } catch (err: any) {
    console.error("❌ PUT /shipping-address/[id] error:", err);

    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return NextResponse.json({ error: "Token không hợp lệ" }, { status: 401 });
    }

    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, SECRET) as { id: number };
    const addressId = parseInt(params.id);

    // Kiểm tra xem địa chỉ có thuộc về user không
    const address = await prisma.shipping_addresses.findUnique({
      where: { id: addressId },
    });
    if (!address || address.user_id !== decoded.id) {
      return NextResponse.json({ error: "Không tìm thấy hoặc không có quyền" }, { status: 403 });
    }

    // Xóa
    await prisma.shipping_addresses.delete({ where: { id: addressId } });

    return NextResponse.json({ message: "Xóa địa chỉ thành công" });
  } catch (err) {
    console.error("Lỗi xóa địa chỉ:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}