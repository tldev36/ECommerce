import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import * as cookie from "cookie";

const SECRET = process.env.JWT_SECRET || "supersecret";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // 1️⃣ Tìm user theo email
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "Email không tồn tại" }, { status: 401 });

    // 2️⃣ So sánh password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return NextResponse.json({ error: "Sai mật khẩu" }, { status: 401 });

    // 3️⃣ Tạo JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: "1h" });

    // 4️⃣ Lấy giỏ hàng tạm thời từ cookie
    const cookieHeader = req.headers.get("cookie") || "";
    const parsedCookies = cookie.parse(cookieHeader);
    const cartTemp = parsedCookies["cart_temp"] ? JSON.parse(parsedCookies["cart_temp"]) : [];

    // 5️⃣ Merge cart tạm thời vào DB
    for (const item of cartTemp) {
      await prisma.cart_items.upsert({
        where: { user_id_product_id: { user_id: user.id, product_id: item.id } },
        update: { quantity: item.quantity },
        create: { user_id: user.id, product_id: item.id, quantity: item.quantity },
      });
    }

    // 6️⃣ Tạo response
    const res = NextResponse.json({
      message: "Đăng nhập thành công",
      user: { id: user.id, name: user.name, email: user.email },
    });

    // 7️⃣ Set JWT token HttpOnly
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
