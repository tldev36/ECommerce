import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "supersecret";

export async function GET(req: Request) {
  try {
    // Lấy cookie
    const cookieHeader = req.headers.get("cookie") || "";
    const token = cookieHeader
      .split("; ")
      .find((c) => c.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Giải mã token
    const decoded = jwt.verify(token, SECRET) as { id: number; email: string };

    // Trả về user
    return NextResponse.json({ user: decoded }, { status: 200 });
  } catch (error) {
    // Nếu token lỗi hoặc hết hạn
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
