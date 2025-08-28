// /app/api/cart/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const SECRET = process.env.JWT_SECRET || "supersecret";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ cart: [] });

    const decoded = jwt.verify(token, SECRET) as { id: number };
    const userId = decoded.id;

    const cartItems = await prisma.cart_items.findMany({
      where: { user_id: userId },
      include: { products: true },
    });

    const formatted = cartItems.map((item) => ({
      id: item.products.id,
      name: item.products.name,
      price: item.products.price,
      unit: item.products.unit,
      image: item.products.image,
      quantity: item.quantity,
    }));

    return NextResponse.json({ cart: formatted });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ cart: [] }, { status: 500 });
  }
}
