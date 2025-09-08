import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "supersecret";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Lấy token từ cookie
    const cookie = req.headers.get("cookie") || "";
    const match = cookie.match(/token=([^;]+)/);
    if (!match) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const token = match[1];

    // 2. Giải mã token
    const decoded = jwt.verify(token, SECRET) as { id: number };
    const userId = decoded.id;

    // 3. Xóa theo user_id + product_id
    const productId = parseInt(params.id);
    await prisma.cart_items.deleteMany({
      where: {
        user_id: userId,
        product_id: productId,
      },
    });

    // 4. Lấy giỏ hàng mới
    const cart = await prisma.cart_items.findMany({
      where: { user_id: userId },
    });

    return NextResponse.json({ cart });
  } catch (err) {
    console.error("Lỗi khi xoá cart item:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
