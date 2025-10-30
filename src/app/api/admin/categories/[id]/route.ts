import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/utils/slugify";
import { deleteImageFile } from "@/utils/deleteImageFile";

// 🔹 Cập nhật Category
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const { name, image, status } = await req.json();
    const slug = slugify(name);

    // Lấy thông tin cũ để kiểm tra xem có ảnh cần xóa không
    const oldCategory = await prisma.categories.findUnique({
      where: { id },
      select: { image: true },
    });

    // Cập nhật DB
    const updated = await prisma.categories.update({
      where: { id },
      data: { name, slug, image, status, updated_at: new Date() },
    });

    // Nếu đổi ảnh mới -> xóa ảnh cũ
    if (oldCategory?.image && oldCategory.image !== image) {
      deleteImageFile("categories", oldCategory.image);
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT category error:", error);
    return NextResponse.json({ error: "Không thể cập nhật" }, { status: 500 });
  }
}

// 🔹 Xóa Category (và ảnh liên quan)
export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params; // ✅ await params ở đây
    const categoryId = Number(id);

    // 🧩 1️⃣ Kiểm tra xem có sản phẩm nào đang dùng category này không
    const productCount = await prisma.products.count({
      where: { category_id: categoryId },
    });

    if (productCount > 0) {
      return NextResponse.json(
        { error: `Không thể xóa! Đang có ${productCount} sản phẩm sử dụng danh mục này.` },
        { status: 400 }
      );
    }

    // 🧩 2️⃣ Lấy thông tin ảnh trước khi xóa
    const category = await prisma.categories.findUnique({
      where: { id: categoryId },
      select: { image: true },
    });

    if (!category) {
      return NextResponse.json({ error: "Danh mục không tồn tại!" }, { status: 404 });
    }

    // 🧩 3️⃣ Xóa dữ liệu trong DB
    await prisma.categories.delete({ where: { id: categoryId } });

    // 🧩 4️⃣ Xóa ảnh vật lý (nếu có)
    if (category.image) {
      deleteImageFile("categories", category.image);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE category error:", error);
    return NextResponse.json({ error: "Không thể xóa danh mục." }, { status: 500 });
  }
}


