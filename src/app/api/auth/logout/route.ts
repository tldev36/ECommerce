// src/app/api/auth/logout/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ message: "Đăng xuất thành công" });

  // ✅ Xóa cookie token (đúng cách)
  res.cookies.delete("token");

  return res;
}
