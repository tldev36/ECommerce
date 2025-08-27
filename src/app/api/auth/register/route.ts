import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import type { User } from "@/types/user";

export async function POST(req: Request) {
  try {
    const { username, name, email, password, phone, gender, birthday } =
      await req.json();

    // kiểm tra email đã tồn tại chưa
    const exist = await prisma.users.findUnique({
      where: { email },
    });
    if (exist) {
      return NextResponse.json(
        { error: "Email đã được sử dụng" },
        { status: 400 }
      );
    }

    // mã hoá mật khẩu
    const password_hash = await bcrypt.hash(password, 10);

    // tạo user mới
    const user = await prisma.users.create({
      data: {
        username,
        name,
        email,
        password_hash,
        phone,
        gender,
        birthday: birthday ? new Date(birthday) : null,
      },
    });

    // map sang type User (ẩn password_hash)
    const responseUser: User = {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      phone: user.phone,
      gender: user.gender,
      birthday: user.birthday,
      avatar: user.avatar ?? "default.jpg",
      is_active: user.is_active ?? true,
      role: user.role ?? "customer",
      created_at: user.created_at ?? undefined,
      updated_at: user.updated_at ?? undefined,
    };

    return NextResponse.json(
      { message: "Đăng ký thành công", user: responseUser },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
