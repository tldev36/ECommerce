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
    const { recipient_name, phone, detail_address, province_district_ward } = await req.json();

    // Kiểm tra dữ liệu gửi lên
    if (!recipient_name || !phone || !detail_address || !province_district_ward) {
      return NextResponse.json({ error: "Thiếu dữ liệu" }, { status: 400 });
    }

    // Thêm mới vào DB
    const address = await prisma.shipping_addresses.create({
      data: {
        user_id: decoded.id,
        recipient_name,
        phone,
        detail_address,
        province_district_ward,
        create_at: new Date(),   // nếu bạn muốn lưu thời gian
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
