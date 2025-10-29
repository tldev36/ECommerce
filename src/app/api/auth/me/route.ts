import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const SECRET = process.env.JWT_SECRET || "supersecret";

export async function GET() {
  try {
    // ✅ Lấy token từ cookie Next.js
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // ✅ Giải mã JWT
    const decoded = jwt.verify(token, SECRET) as {
      id: number;
      email: string;
      role?: string;
    };

    // ✅ Tìm user trong database để đảm bảo thông tin hợp lệ
    const user = await prisma.users.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // ✅ Trả về user cho client (CartContext sẽ nhận { user: {...} })
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("❌ Lỗi xác thực token:", error);
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
