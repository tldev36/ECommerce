// src/app/api/auth/logout/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  // Trả về response kèm xóa cookie
  const res = NextResponse.json({ message: "Đăng xuất thành công" });

  res.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0), // hoặc maxAge: 0
    path: "/",
  });

  return res;
}
