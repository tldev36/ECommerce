import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout-admin/Sidebar";
import Header from "@/components/layout-admin/Header";

const SECRET = process.env.JWT_SECRET || "supersecret";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    // Token không tồn tại => redirect trước khi render layout
    redirect("/auth/login");
  }

  try {
    const decoded = jwt.verify(token, SECRET) as { role?: string };
    if (decoded.role !== "admin") {
      // Không phải admin => redirect luôn, không hiển thị layout
      redirect("/auth/login");
    }
  } catch {
    // Token hết hạn hoặc không hợp lệ => redirect
    redirect("/auth/login");
  }

  // Chỉ tới đây khi đúng admin, layout mới render
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
