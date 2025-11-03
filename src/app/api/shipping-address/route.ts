import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const SECRET = process.env.JWT_SECRET || "supersecret";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Giải mã token
    const decoded = jwt.verify(token, SECRET) as { id: number };
    // 🔹 Lấy dữ liệu từ body
    const {
      recipient_name,
      phone,
      detail_address,
      ward_name,
      district_name,
      province_name,
      default: isDefault,
    } = await req.json();

    // 🔹 Kiểm tra dữ liệu bắt buộc
    if (!recipient_name || !phone || !detail_address || !ward_name) {
      return NextResponse.json({ error: "Thiếu dữ liệu bắt buộc" }, { status: 400 });
    }

    // 🔹 Nếu có đặt mặc định, bỏ mặc định cũ
    if (isDefault) {
      await prisma.shipping_addresses.updateMany({
        where: { user_id: decoded.id, default: true },
        data: { default: false },
      });
    }

    // 🔹 Thêm mới vào DB
    const address = await prisma.shipping_addresses.create({
      data: {
        user_id: decoded.id,
        recipient_name,
        phone,
        detail_address,
        ward_name,
        district_name,
        province_name,
        default: !!isDefault,
        create_at: new Date(),
        update_at: new Date(),
      },
    });

    return NextResponse.json({ address });
  } catch (err) {
    console.error("Error creating address:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}


export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, SECRET) as { id: number };

    const addressesFromDB = await prisma.shipping_addresses.findMany({
      where: { user_id: decoded.id },
      orderBy: { default: "desc" }, // địa chỉ mặc định lên đầu
    });

    // Chuyển default BIT(1) sang boolean
    const addresses = addressesFromDB.map(a => ({
      ...a,
      default: Boolean(a.default), // 0 -> false, 1 -> true
    }));

    return NextResponse.json({ addresses });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
