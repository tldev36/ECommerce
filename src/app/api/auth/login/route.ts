import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

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

    // Tạo JWT 10 phút
    const token = jwt.sign(
      { id: user.id, email: user.email },
      SECRET,
      { expiresIn: "10m" } // ⬅ 10 phút
    );

    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 10, // ⬅ 10 phút (tính bằng giây)
      path: "/",
    });

    // 4️⃣ Lấy giỏ hàng từ cookie (nếu có)
    const cartCookie = cookieStore.get("cart");
    let localCart: any[] = [];
    if (cartCookie) {
      try {
        localCart = JSON.parse(cartCookie.value);
      } catch {
        localCart = [];
      }
    }

    // 5️⃣ Lấy giỏ hàng trong DB
    const dbCart = await prisma.cart_items.findMany({
      where: { user_id: user.id },
    });

    // 6️⃣ Merge (cộng quantity nếu trùng product_id)
    const merged: Record<number, number> = {};
    dbCart.forEach((item) => {
      const qty = item.quantity ?? 0;
      merged[item.product_id] = (merged[item.product_id] || 0) + qty;
    });
    localCart.forEach((item) => {
      const qty = item.quantity ?? 0;
      merged[item.product_id] = (merged[item.product_id] || 0) + qty;
    });

    // 7️⃣ Ghi lại giỏ hàng mới vào DB
    await prisma.cart_items.deleteMany({ where: { user_id: user.id } });
    const newCart = await Promise.all(
      Object.entries(merged).map(([productId, quantity]) =>
        prisma.cart_items.create({
          data: {
            user_id: user.id,
            product_id: Number(productId),
            quantity: quantity as number,
          },
        })
      )
    );

    // 8️⃣ Xóa cookie cart
    cookieStore.delete("cart");

    // 9️⃣ Response
    return NextResponse.json({
      message: "Đăng nhập thành công",
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      cart: newCart,
    });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
