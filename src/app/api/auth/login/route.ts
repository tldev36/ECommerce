import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"; // nên dùng bcryptjs vì dễ build trên Next.js
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const SECRET = process.env.JWT_SECRET || "supersecret"; // nên để trong .env

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Tìm user theo email
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Email không tồn tại" }, { status: 401 });
    }

    // So sánh password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return NextResponse.json({ error: "Sai mật khẩu" }, { status: 401 });
    }

    // Tạo JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, SECRET, {
      expiresIn: "1h",
    });

    // Tạo response và set cookie HttpOnly
    const res = NextResponse.json({
      message: "Đăng nhập thành công",
      user: { id: user.id, name: user.name, email: user.email },
    });

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600,
      path: "/",
    });

    return res;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
