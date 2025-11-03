// /app/api/cart/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";

// ✅ Lấy giỏ hàng của user (dựa trên token trong cookie)
export async function GET() {
  try {
    // Lấy user từ token
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ error: "Chưa đăng nhập", cart: [] }, { status: 401 });
    }

    // Lấy giỏ hàng từ DB theo user.id
    const items = await prisma.cart_items.findMany({
      where: { user_id: user.id },
      include: { products: true },
    });

    // Chuẩn hóa dữ liệu trả về
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

    // Trả về response
    return NextResponse.json(
      {
        user: { id: user.id, email: user.email, role: user.role },
        cart,
      },
      { status: 200 }
    );

  } catch (err) {
    console.error("❌ Lỗi lấy giỏ hàng:", err);
    return NextResponse.json({ error: "Lỗi server", cart: [] }, { status: 500 });
  }
}
