import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/utils/slugify"; // file util nhỏ để tạo slug

// 🔹 Lấy tất cả categories
export async function GET() {
  try {
    const data = await prisma.categories.findMany({
      
      orderBy: { id: "desc" },
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET categories error:", error);
    return NextResponse.json({ error: "Lỗi khi lấy dữ liệu" }, { status: 500 });
  }
}

// 🔹 Tạo mới
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, image, status } = body;
    const slug = slugify(name);

    // ====== 1. VALIDATION ĐƠN GIẢN ======
    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Tên danh mục không hợp lệ" },
        { status: 400 }
      );
    }

    // ====== 2. KIỂM TRA TRÙNG TÊN ======
    const existingCategory = await prisma.categories.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive", // Không phân biệt hoa thường
        },
      },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: "Tên danh mục đã tồn tại" },
        { status: 409 } // Conflict
      );
    }

    // ====== 3. TẠO CATEGORY ======
    const newCategory = await prisma.categories.create({
      data: {
        name,
        image: image || null,
        slug: slug,
        status: status ?? true, // default nếu bạn muốn
      },
    });

    return NextResponse.json(
      { message: "Tạo danh mục thành công", data: newCategory },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/categories error:", error);

    return NextResponse.json(
      { error: "Lỗi server khi tạo danh mục" },
      { status: 500 }
    );
  }
}
