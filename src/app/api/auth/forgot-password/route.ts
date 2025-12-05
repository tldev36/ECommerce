import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import crypto from "crypto"; // Dùng để tạo token ngẫu nhiên
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    // 1. Validate Input
    if (!email) {
      return NextResponse.json(
        { error: "Vui lòng cung cấp địa chỉ email." },
        { status: 400 }
      );
    }

    console.log("📨 Yêu cầu reset password cho:", email);

    // 2. GIẢ LẬP: Kiểm tra user có tồn tại trong Database không?
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      // LƯU Ý BẢO MẬT: Để tránh hacker dò email (User Enumeration Attack),
      // dù email không tồn tại, ta vẫn trả về success giả hoặc thông báo chung chung.
      return NextResponse.json({ message: "Nếu email tồn tại, link reset đã được gửi." });
    }

    // 3. Tạo Reset Token (Mã bảo mật dùng 1 lần)
    // Token này cần được lưu vào DB kèm thời gian hết hạn (ví dụ 15 phút)
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}&email=${email}`;
    
    // TODO: Lưu resetToken vào DB cho user này (ví dụ: await prisma.passwordReset.create(...))
    await prisma.users.update({
      where: { email },
      data: {
        verifyToken: resetToken,
        // verifyTokenExpiry: new Date(Date.now() + 15 * 60 * 1000), // 15 phút từ bây giờ
      }
    });

    // 4. Cấu hình Transporter (Người vận chuyển)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false, // true cho port 465, false cho các port khác (587)
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // 5. Nội dung Email (HTML Template chuyên nghiệp)
    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
      to: email,
      subject: "🔒 Yêu cầu đặt lại mật khẩu",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #4F46E5; text-align: center;">Yêu cầu Đặt lại Mật khẩu</h2>
          <p>Xin chào,</p>
          <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản liên kết với email <strong>${email}</strong>.</p>
          <p>Vui lòng nhấn vào nút bên dưới để tiến hành đặt lại mật khẩu (Link có hiệu lực trong 15 phút):</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Đặt lại mật khẩu
            </a>
          </div>

          <p style="color: #666; font-size: 14px;">Nếu bạn không yêu cầu thay đổi này, vui lòng bỏ qua email này. Mật khẩu của bạn vẫn được an toàn.</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">© 2024 Your App Name. All rights reserved.</p>
        </div>
      `,
    };

    // 6. Gửi Email
    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully to:", email);

    return NextResponse.json({
      message: "Nếu email hợp lệ, hướng dẫn đặt lại mật khẩu đã được gửi.",
    });

  } catch (error: any) {
    console.error("❌ Lỗi gửi email:", error);
    return NextResponse.json(
      { error: "Không thể gửi email. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
