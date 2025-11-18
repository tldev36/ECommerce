import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // import đường dẫn đến prisma client
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // ✅ Kiểm tra email tồn tại
    const existingUser = await prisma.users.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email đã được sử dụng" },
        { status: 400 }
      );
    }

    // ✅ Hash mật khẩu
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // ✅ Tạo verifyToken ngẫu nhiên
    const verifyToken = uuidv4();

    // ✅ Lưu user vào database (chưa kích hoạt)
    const user = await prisma.users.create({
      data: {
        name: data.name,
        email: data.email,
        password_hash: hashedPassword,
        phone: data.phone,
        gender: data.gender,
        birthday: new Date(data.birthday),
        is_active: false,
        verifyToken,
      },
    });

    // ✅ Tạo transporter để gửi email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // ✅ Link xác nhận tài khoản
    const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify?token=${verifyToken}`;

    // ✅ Gửi email
    await transporter.sendMail({
      from: `"Nông Sản Xanh" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: "Xác nhận tài khoản của bạn",
      html: `
        <div style="font-family:sans-serif;line-height:1.6">
          <h2>Xin chào ${user.name},</h2>
          <p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng nhấn vào nút dưới đây để xác nhận email:</p>
          <p>
            <a href="${verifyUrl}" style="
              display:inline-block;
              background:#16a34a;
              color:#fff;
              padding:10px 20px;
              border-radius:6px;
              text-decoration:none;
            ">Xác nhận tài khoản</a>
          </p>
          <p>Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email.</p>
          <hr />
          <p>Trân trọng,<br/>Đội ngũ Nông Sản Xanh</p>
        </div>
      `,
    });

    return NextResponse.json({
      message: "🎉 Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.",
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Lỗi máy chủ, vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
