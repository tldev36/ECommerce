import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "supersecret";

export async function POST(req: Request) {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const decoded = jwt.verify(token, SECRET) as { id: number };
    const userId = decoded.id;

    const { items } = await req.json();
    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
    }

    // ✅ Lưu từng item vào DB
    for (const item of items) {
      await prisma.cart_items.upsert({
        where: {
          user_id_product_id: {
            user_id: userId,
            product_id: item.product_id,
          },
        },
        update: {
          quantity: { increment: item.quantity },
        },
        create: {
          user_id: userId,
          product_id: item.product_id,
          quantity: item.quantity,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Error saving cart:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
