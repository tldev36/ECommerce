import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // đường dẫn đến prisma client của bạn

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Thiếu mã xác thực" },
        { status: 400 }
      );
    }

    // Tìm user theo token
    const user = await prisma.users.findFirst({
      where: { verifyToken: token },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Mã xác thực không hợp lệ hoặc đã hết hạn" },
        { status: 400 }
      );
    }

    // Cập nhật user -> kích hoạt tài khoản
    await prisma.users.update({
      where: { id: user.id },
      data: {
        is_active: true,
        verifyToken: null,
      },
    });

    return NextResponse.json({
      message: "✅ Tài khoản của bạn đã được kích hoạt thành công!",
    });
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json(
      { error: "Lỗi xác thực tài khoản" },
      { status: 500 }
    );
  }
}
