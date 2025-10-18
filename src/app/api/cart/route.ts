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
    if (!token) return NextResponse.json({ cart: [] }, { status: 200 });

    const decoded = jwt.verify(token, SECRET) as { id: number };

    const items = await prisma.cart_items.findMany({
      where: { user_id: decoded.id },
      include: { products: true },
    });

    const cart = items.map((item) => ({
      id: item.id,
      product_id: item.product_id,
      name: item.products.name,
      slug: item.products.slug,
      price: item.products.price,
      unit: item.products.unit,
      image: item.products.image,
      quantity: item.quantity ?? 0,
    }));

    return NextResponse.json(
      {
        user: { id: decoded.id },
        cart,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ Lỗi lấy giỏ hàng:", err);
    return NextResponse.json({ cart: [] }, { status: 500 });
  }
}
