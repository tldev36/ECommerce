import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ✅ Tạo review
export async function POST(req: Request) {
  try {
    const { user_id, product_id, rating, comment } = await req.json();

    if (!user_id || !product_id || !rating) {
      return NextResponse.json({ error: "Thiếu dữ liệu!" }, { status: 400 });
    }

    const review = await prisma.reviews.create({
      data: {
        user_id,
        product_id,
        rating,
        comment,
      },
    });

    return NextResponse.json(review);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

// ✅ Lấy danh sách review theo product
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const product_id = Number(searchParams.get("product_id"));

    const reviewList = await prisma.reviews.findMany({
      where: { product_id },
      orderBy: { created_at: "desc" },
      include: {
        users: true,
      },
    });

    return NextResponse.json(reviewList);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

// ✅ Chỉnh sửa review
export async function PUT(req: Request) {
  try {
    const { id, user_id, rating, comment } = await req.json();

    if (!id || !user_id || !rating) {
      return NextResponse.json({ error: "Thiếu dữ liệu!" }, { status: 400 });
    }

    // ✅ Lấy review xem có đúng chủ sở hữu không
    const existing = await prisma.reviews.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Không tìm thấy review!" }, { status: 404 });
    }

    // ✅ Chỉ đúng user mới được sửa
    if (existing.user_id !== user_id) {
      return NextResponse.json({ error: "Không có quyền chỉnh sửa!" }, { status: 403 });
    }

    const updated = await prisma.reviews.update({
      where: { id },
      data: { rating, comment },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

// ✅ Xóa review
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));
    const user_id = Number(searchParams.get("user_id")); // gửi user_id kèm URL

    if (!id || !user_id) {
      return NextResponse.json({ error: "Thiếu dữ liệu!" }, { status: 400 });
    }

    const existing = await prisma.reviews.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Không tìm thấy review!" }, { status: 404 });
    }

    // ✅ Chỉ đúng user mới được xóa
    if (existing.user_id !== user_id) {
      return NextResponse.json({ error: "Không có quyền xóa!" }, { status: 403 });
    }

    await prisma.reviews.delete({ where: { id } });

    return NextResponse.json({ message: "Đã xóa thành công!" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
