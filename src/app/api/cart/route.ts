// /app/api/cart/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const SECRET = process.env.JWT_SECRET || "supersecret";

function getUserIdFromCookie(): number | null {
  const cookieStore: any = cookies(); // ✅ không cần await
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, SECRET) as { id: number };
    return decoded.id;
  } catch {
    return null;
  }
}

// ✅ Lấy giỏ hàng của user
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json([], { status: 200 });

    const decoded = jwt.verify(token, SECRET) as { id: number };

    const items = await prisma.cart_items.findMany({
      where: { user_id: decoded.id },
      include: { products: true },
    });

    // ✅ map dữ liệu đúng với CartItem interface
    const cart = items.map((item) => ({
      id: item.id,
      product_id: item.product_id,
      name: item.products.name,
      slug: item.products.slug,
      price: item.products.price,
      unit: item.products.unit,
      image: item.products.image,
      quantity: item.quantity,
    }));

    return NextResponse.json(cart, { status: 200 });
  } catch (err) {
    console.error("❌ Lỗi lấy giỏ hàng:", err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

// ✅ Xóa hết giỏ hàng
export async function DELETE() {
  try {
    const userId = getUserIdFromCookie();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await prisma.cart_items.deleteMany({
      where: { user_id: userId },
    });

    return NextResponse.json([], { status: 200 }); // trả về giỏ rỗng
  } catch (err) {
    console.error("DELETE /api/cart error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
