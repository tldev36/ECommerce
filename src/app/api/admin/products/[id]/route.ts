import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteImageFile } from "@/utils/deleteImageFile";


export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const data = await req.json();

    const updated = await prisma.products.update({
      where: { id },
      data,
      include: { categories: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT product error:", error);
    return NextResponse.json({ error: "Lỗi khi cập nhật" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {

    const id = parseInt(params.id);
    const productid = Number(id);

    // Kiểm tra sản phẩm có tồn tại không
    const product = await prisma.products.findUnique({ where: { id: productid } });
    if (!product) {
      return NextResponse.json({ error: "Sản phẩm không tồn tại" }, { status: 404 });
    }

    // 🧩 4️⃣ Xóa ảnh vật lý (nếu có)
    if (product.image) {
      deleteImageFile("products", product.image);
    }

    // Xóa sản phẩm
    await prisma.products.delete({ where: { id: productid } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE product error:", error);
    return NextResponse.json({ error: "Lỗi khi xóa sản phẩm" }, { status: 500 });
  }
}
