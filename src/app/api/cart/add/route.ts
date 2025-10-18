// app/api/cart/add/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "supersecret";

export async function POST(req: Request) {
  try {
    // 1️⃣ Lấy JWT token từ cookie
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2️⃣ Decode token để lấy user id
    const decoded = jwt.verify(token, SECRET) as { id: number };
    const { productId, quantity } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: "Thiếu productId" }, { status: 400 });
    }

    // 3️⃣ Kiểm tra sản phẩm có tồn tại không
    const product = await prisma.products.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Sản phẩm không tồn tại" },
        { status: 404 }
      );
    }

    // 4️⃣ Kiểm tra trong giỏ hàng đã có sản phẩm chưa
    const existing = await prisma.cart_items.findFirst({
      where: { user_id: decoded.id, product_id: productId },
    });

    if (existing) {
      // Nếu có thì tăng số lượng
      await prisma.cart_items.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + (quantity || 1) },
      });
    } else {
      // Nếu chưa có thì thêm mới
      await prisma.cart_items.create({
        data: {
          user_id: decoded.id,
          product_id: productId,
          quantity: quantity || 1,
        },
      });
    }

    // 5️⃣ Trả về giỏ hàng mới nhất
    const updatedCart = await prisma.cart_items.findMany({
      where: { user_id: decoded.id },
      include: { products: true },
    });

    const cart = updatedCart.map((item) => ({
      id: item.id,
      product_id: item.product_id,
      name: item.products.name,
      slug: item.products.slug,
      price: item.products.price,
      unit: item.products.unit,
      image: item.products.image,
      quantity: item.quantity,
    }));

    return NextResponse.json({ cart });
  } catch (err) {
    console.error("❌ POST /api/cart/add error:", err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
