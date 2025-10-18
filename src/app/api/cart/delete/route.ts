// /app/api/cart/delete/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const SECRET = process.env.JWT_SECRET || "supersecret";

function getUserIdFromCookie(): number | null {
  const cookieStore: any = cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, SECRET) as { id: number };
    return decoded.id;
  } catch {
    return null;
  }
}

export async function DELETE() {
  try {
    const userId = getUserIdFromCookie();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await prisma.cart_items.deleteMany({
      where: { user_id: userId },
    });

    return NextResponse.json({ message: "Đã xoá toàn bộ giỏ hàng" }, { status: 200 });
  } catch (err) {
    console.error("❌ DELETE /api/cart/delete error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
