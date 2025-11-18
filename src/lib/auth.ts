import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const SECRET = process.env.JWT_SECRET || "supersecret";

/**
 * Lấy thông tin user từ JWT trong cookie (server-only)
 */
export async function getUserFromToken(): Promise<{ id: number; email: string; role: string } | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, SECRET) as {
      id: number;
      email: string;
      role: string;
    };

    return decoded; // ✅ Trả về toàn bộ thông tin user
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
}
