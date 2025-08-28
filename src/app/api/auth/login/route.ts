import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import * as cookie from "cookie";

const SECRET = process.env.JWT_SECRET || "supersecret";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Tìm user theo email
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Email không tồn tại" }, { status: 401 });
    }
    console.log("user from db:", user);

    // So sánh password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    console.log("password match:", isMatch);
    if (!isMatch) {
      return NextResponse.json({ error: "Sai mật khẩu" }, { status: 401 });
    }

    // Tạo JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: "1h" });

    // Lấy cookie giỏ hàng tạm thời từ header
    const cookieHeader = req.headers.get("cookie") || "";
    const parsedCookies = cookie.parse(cookieHeader);
    const cartCookie = parsedCookies["cart"] || "[]";
    const cartItems = cartCookie ? JSON.parse(cartCookie) : [];

    // Lưu giỏ hàng vào DB
    for (const item of cartItems) {
      await prisma.cart_items.create({
        data: {
          user_id: user.id,
          product_id: item.id,
          quantity: item.quantity || 1,
        },
      });
    }

    // Tạo response
    const res = NextResponse.json({
      message: "Đăng nhập thành công",
      user: { id: user.id, name: user.name, email: user.email },
    });

    // Set JWT token
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
