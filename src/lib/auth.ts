import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const SECRET = process.env.JWT_SECRET || "supersecret";

/**
 * Lấy thông tin user từ token lưu trong cookie
 * Chỉ dùng trong môi trường SERVER (App Router)
 */
export async function getUserFromToken() {
  try {
    // Lấy cookie token
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;

    // Giải mã JWT
    const decoded = jwt.verify(token, SECRET) as {
      id: number;
      email: string;
      role: string;
    };

    return decoded; // → { id, email, role }
  } catch (error) {
    return null;
  }
}
