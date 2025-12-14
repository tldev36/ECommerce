// /app/api/recommendations/cart/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { cartProductIds } = await req.json(); // mảng ID sản phẩm trong giỏ hàng
    
    // Nếu giỏ hàng rỗng, trả về mảng rỗng
    if (!cartProductIds || cartProductIds.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // 1️⃣ Lấy thông tin sản phẩm trong giỏ (Kèm theo category_id)
    // Lưu ý: Nếu tên khoá ngoại của bạn khác (ví dụ categoryId), hãy sửa lại ở đây
    const cartProducts = await prisma.products.findMany({
      where: { id: { in: cartProductIds }, is_active: true },
      select: {
        id: true,
        category_id: true, // Lấy ID danh mục để tìm sản phẩm tương tự
      },
    });

    // 2️⃣ Tổng hợp danh sách Category ID từ các sản phẩm trong giỏ
    const categoryIds = new Set<number>();
    cartProducts.forEach((p) => {
      if (p.category_id) {
        categoryIds.add(p.category_id);
      }
    });

    // Nếu không lấy được category nào, fallback về popular
    if (categoryIds.size === 0) {
       return await getPopularProducts();
    }

    // 3️⃣ Tìm sản phẩm CÙNG DANH MỤC (Thay thế cho tags/region)
    const suggested = await prisma.products.findMany({
      where: {
        is_active: true,
        id: { notIn: cartProductIds }, // Trừ những món đang có trong giỏ
        category_id: { in: Array.from(categoryIds) }, // Lọc theo danh mục
      },
      orderBy: { popularity: "desc" }, // Ưu tiên món phổ biến trong cùng danh mục
      take: 10,
    });

    // 4️⃣ Nếu không có kết quả (hoặc ít quá), fallback theo sản phẩm phổ biến toàn sàn
    if (suggested.length === 0) {
      return await getPopularProducts();
    }

    return NextResponse.json(suggested);

  } catch (error) {
    console.error("Cart recommendations error:", error);
    return NextResponse.json({ error: "Failed to get cart recommendations" }, { status: 500 });
  }
}

// Hàm phụ: Lấy sản phẩm phổ biến (để code gọn hơn)
async function getPopularProducts() {
    const fallback = await prisma.products.findMany({
        where: { is_active: true },
        orderBy: { popularity: "desc" },
        take: 10,
      });
      return NextResponse.json(fallback);
}