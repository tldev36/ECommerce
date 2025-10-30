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
    const { name, image, status } = await req.json();
    const slug = slugify(name);

    const newCategory = await prisma.categories.create({
      data: { name, slug, image, status },
    });

    return NextResponse.json(newCategory);
  } catch (error) {
    console.error("POST categories error:", error);
    return NextResponse.json({ error: "Lỗi khi thêm mới" }, { status: 500 });
  }
}
