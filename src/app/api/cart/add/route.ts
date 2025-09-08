import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "supersecret";

// POST /api/cart/add
export async function POST(req: Request) {
  try {
    const { productId, quantity } = await req.json();

    // ✅ Lấy user từ JWT cookie
    const cookieDB = await cookies();
    const token = cookieDB.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, SECRET) as { id: number };

    // ✅ Dùng upsert để thêm hoặc cập nhật giỏ hàng
    await prisma.cart_items.upsert({
      where: {
        user_id_product_id: {
          user_id: decoded.id,
          product_id: productId,
        },
      },
      update: {
        quantity: {
          increment: quantity || 1,
        },
        updated_at: new Date(),
      },
      create: {
        user_id: decoded.id,
        product_id: productId,
        quantity: quantity || 1,
      },
    });

    return NextResponse.json({ message: "Đã thêm vào giỏ hàng" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
