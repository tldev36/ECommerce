import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const SECRET = process.env.JWT_SECRET || "supersecret";

export async function GET() {
  try {
    // Lấy cookie token
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    // Xác thực token
    let decoded: any;
    try {
      decoded = jwt.verify(token, SECRET);
    } catch (err) {
      return NextResponse.json({ error: "Token không hợp lệ" }, { status: 401 });
    }

    // Tìm user trong DB
    const user = await prisma.users.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        phone: true,
        gender: true,
        birthday: true,
        avatar: true,
        created_at: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Không tìm thấy user" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Profile error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
