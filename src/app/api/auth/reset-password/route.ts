import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Uncomment dòng này để dùng Prisma
import bcrypt from "bcrypt";

export async function PUT(req: Request) {
  try {
    const { token, email, newPassword } = await req.json();

    if (!token || !email || !newPassword) {
      return NextResponse.json({ error: "Thiếu thông tin cần thiết" }, { status: 400 });
    }

    // --- BẮT ĐẦU LOGIC DB ---
    
    // 1. Tìm user và kiểm tra Token trong DB
    const user = await prisma.users.findUnique({ where: { email } });
    
    // Giả lập logic kiểm tra (Trong thực tế bạn phải so sánh token trong bảng User hoặc bảng ResetToken)
    if (!user || user.verifyToken !== token ) {
       return NextResponse.json({ error: "Link hết hạn hoặc không hợp lệ" }, { status: 400 });
    }

    // 2. Mã hóa mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 3. Cập nhật mật khẩu vào DB và xóa Token cũ đi để không dùng lại được
    await prisma.users.update({
      where: { email },
      data: {
        password_hash: hashedPassword,
        verifyToken: null,       // Xóa token sau khi dùng xong
        
      }
    });

    // --- KẾT THÚC LOGIC DB ---

    console.log(`✅ Đã đổi mật khẩu thành công cho: ${email}`); // Log kiểm tra

    return NextResponse.json({ message: "Đổi mật khẩu thành công" });

  } catch (error) {
    console.error("Reset Password Error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}