import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteImageFile } from "@/utils/deleteImageFile";

// 🟢 CẬP NHẬT SẢN PHẨM
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await req.json();

    // 1️⃣ Lấy thông tin sản phẩm cũ để kiểm tra ảnh
    const existingProduct = await prisma.products.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Không tìm thấy sản phẩm" }, { status: 404 });
    }

    // 2️⃣ Xử lý xóa ảnh cũ nếu người dùng up ảnh mới
    // Nếu có tên ảnh mới VÀ tên ảnh mới khác tên ảnh cũ
    if (body.image && existingProduct.image && body.image !== existingProduct.image) {
      console.log("🗑 Đang xóa ảnh cũ:", existingProduct.image);
      await deleteImageFile("products", existingProduct.image);
    }

    // 3️⃣ Chuẩn hóa dữ liệu (QUAN TRỌNG)
    // Prisma rất chặt chẽ, ta phải ép kiểu về đúng định dạng Database (Int, Boolean, String)
    // Loại bỏ các trường rác như: categories, created_at, v.v.
    const updateData = {
      name: body.name,
      slug: body.slug,
      unit: body.unit,
      image: body.image, // Tên file ảnh mới (hoặc cũ)
      
      // Ép kiểu số
      price: Number(body.price),
      cost_price: Number(body.cost_price || 0),
      stock_quantity: Number(body.stock_quantity || 0),
      min_stock_level: Number(body.min_stock_level || 0),
      category_id: Number(body.category_id), // Quan trọng: Phải là số để nối quan hệ

      // Ép kiểu Boolean
      is_new: Boolean(body.is_new),
      is_best_seller: Boolean(body.is_best_seller),
      featured: Boolean(body.featured),
      is_active: Boolean(body.is_active),
      
      // Cập nhật thời gian
      updated_at: new Date(),
    };

    // 4️⃣ Thực hiện Update
    const updatedProduct = await prisma.products.update({
      where: { id },
      data: updateData,
      include: { categories: true }, // Trả về kèm danh mục để frontend cập nhật ngay UI
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("PUT product error:", error);
    return NextResponse.json({ error: "Lỗi khi cập nhật sản phẩm" }, { status: 500 });
  }
}

// 🔴 XÓA SẢN PHẨM (Giữ nguyên logic của bạn, nó đã tốt rồi)
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    // Kiểm tra sản phẩm có tồn tại không
    const product = await prisma.products.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json({ error: "Sản phẩm không tồn tại" }, { status: 404 });
    }

    // Xóa ảnh vật lý (nếu có)
    if (product.image) {
      await deleteImageFile("products", product.image);
    }

    // Xóa sản phẩm trong DB
    await prisma.products.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE product error:", error);
    // Kiểm tra lỗi ràng buộc khóa ngoại (nếu sản phẩm đã có trong đơn hàng)
    if ((error as any).code === 'P2003') {
        return NextResponse.json({ error: "Không thể xóa: Sản phẩm này đã có trong đơn hàng!" }, { status: 400 });
    }
    return NextResponse.json({ error: "Lỗi khi xóa sản phẩm" }, { status: 500 });
  }
}