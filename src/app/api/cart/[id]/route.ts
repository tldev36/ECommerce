// app/api/cart/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "supersecret";

// PUT: cập nhật số lượng sản phẩm
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, SECRET) as { id: number };
    const userId = decoded.id;
    const productId = parseInt(params.id);
    const { quantity } = await req.json();

    // Kiểm tra cart item của user hiện tại
    const existing = await prisma.cart_items.findFirst({
      where: { user_id: userId, product_id: productId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Sản phẩm không có trong giỏ hàng" },
        { status: 404 }
      );
    }

    if (quantity <= 0) {
      // Nếu số lượng <= 0 → xoá sản phẩm khỏi giỏ
      await prisma.cart_items.delete({
        where: { id: existing.id },
      });
    } else {
      // Cập nhật lại số lượng
      await prisma.cart_items.update({
        where: { id: existing.id },
        data: { quantity },
      });
    }

    // Lấy lại giỏ hàng mới của đúng user
    const updatedCart = await prisma.cart_items.findMany({
      where: { user_id: userId },
      include: { products: true },
      orderBy: { id: "asc" },
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
      discount: item.products.discount,
    }));

    return NextResponse.json({ cart });
  } catch (err) {
    console.error("❌ PUT /api/cart/[id] error:", err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
