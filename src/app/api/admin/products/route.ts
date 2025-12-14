import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.products.findMany({
      include: { categories: true },
      orderBy: { id: "desc" },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("GET products error:", error);
    return NextResponse.json({ error: "Lỗi lấy sản phẩm" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // 🛑 1. Kiểm tra dữ liệu bắt buộc
    if (!data.name || !data.price) {
      return NextResponse.json({ error: "Tên và giá là bắt buộc" }, { status: 400 });
    }

    // 🛠️ 2. Xử lý dữ liệu an toàn trước khi gọi Prisma
    // Chuyển đổi category_id sang số, hoặc null nếu không hợp lệ
    const categoryId = data.category_id && !isNaN(Number(data.category_id))
      ? Number(data.category_id)
      : null;

    // Kiểm tra slug (nếu không có thì tự tạo đơn giản để tránh lỗi DB)
    const slug = data.slug || data.name.toLowerCase().replace(/ /g, '-');

    console.log("Processing payload:", { ...data, category_id: categoryId });

    const product = await prisma.products.create({
      data: {
        name: data.name,
        slug: slug,
        // Ép kiểu số an toàn
        price: Number(data.price) || 0,
        cost_price: Number(data.cost_price) || 0,

        unit: data.unit || "",
        image: data.image || "",
        short: data.short || "",

        // Xử lý Boolean
        featured: Boolean(data.featured),
        is_new: Boolean(data.is_new),
        is_best_seller: Boolean(data.is_best_seller),
        is_active: data.is_active ?? true,
        description: data.description || "",
        // Xử lý số lượng
        discount: Number(data.discount) || 0,
        stock_quantity: Number(data.stock_quantity) || 0,
        min_stock_level: Number(data.min_stock_level) || 0,

        // Xử lý khóa ngoại Category (Quan trọng)
        // Nếu categoryId có giá trị thì nối, không thì thôi (nếu DB cho phép null)
        ...(categoryId ? { category_id: categoryId } : {}),

        created_at: new Date(),
        updated_at: new Date(),
      },
      include: { categories: true },
    });

    return NextResponse.json(product);

  } catch (error: any) {
    console.error("❌ POST product error CHI TIẾT:", error);

    // Bắt lỗi Unique (Trùng Slug)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Tên sản phẩm hoặc Slug đã tồn tại!" }, { status: 409 });
    }

    // Bắt lỗi Khóa ngoại (Category không tồn tại)
    if (error.code === 'P2003') {
      return NextResponse.json({ error: "Danh mục đã chọn không tồn tại!" }, { status: 400 });
    }

    return NextResponse.json({ error: error.message || "Lỗi server" }, { status: 500 });
  }
}
