"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faCheckCircle, faExclamationCircle, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

// Component con để xử lý logic lấy params (cần bọc trong Suspense để tránh lỗi build Next.js)
function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const token = searchParams?.get("token");
  const email = searchParams?.get("email");

  const [passwords, setPasswords] = useState({ new: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  // Kiểm tra tính hợp lệ của Token ngay khi vào trang
  useEffect(() => {
    if (!token || !email) {
      setStatus("error");
      setMessage("Link không hợp lệ hoặc bị thiếu thông tin.");
    }
  }, [token, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwords.new !== passwords.confirm) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }
    if (passwords.new.length < 6) {
      alert("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    setStatus("loading");

    try {
      // Gọi API cập nhật mật khẩu (Code API ở Bước 3)
      const res = await fetch("/api/auth/reset-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, newPassword: passwords.new }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setTimeout(() => router.push("/auth/login"), 3000); // Chuyển về login sau 3s
      } else {
        setStatus("error");
        setMessage(data.error || "Có lỗi xảy ra. Token có thể đã hết hạn.");
      }
    } catch (err) {
      setStatus("error");
      setMessage("Lỗi kết nối hệ thống.");
    }
  };

  if (status === "success") {
    return (
      <div className="text-center py-8">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
          <FontAwesomeIcon icon={faCheckCircle} className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Đổi mật khẩu thành công!</h2>
        <p className="text-gray-600">Bạn sẽ được chuyển hướng về trang đăng nhập trong giây lát...</p>
        <button 
          onClick={() => router.push("/auth/login")}
          className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Đến trang đăng nhập ngay
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Đặt lại mật khẩu</h1>
            <p className="text-gray-500 mt-2 text-sm">Nhập mật khẩu mới cho {email}</p>
        </div>

        {status === "error" && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-700">
                <FontAwesomeIcon icon={faExclamationCircle} />
                <span>{message}</span>
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới</label>
                <div className="relative">
                    <input
                        type={showPass ? "text" : "password"}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                        placeholder="••••••••"
                        value={passwords.new}
                        onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                    />
                    <button 
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                    >
                        <FontAwesomeIcon icon={showPass ? faEyeSlash : faEye} />
                    </button>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu</label>
                <div className="relative">
                    <input
                        type={showPass ? "text" : "password"}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                        placeholder="••••••••"
                        value={passwords.confirm}
                        onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                    />
                     <FontAwesomeIcon icon={faLock} className="absolute right-4 top-3.5 text-gray-400 text-sm" />
                </div>
            </div>

            <button
                type="submit"
                disabled={status === "loading"}
                className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 hover:shadow-xl transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {status === "loading" ? "Đang xử lý..." : "Xác nhận thay đổi"}
            </button>
        </form>
    </div>
  );
}

// Layout chính bọc Suspense (Bắt buộc trong Next.js App Router khi dùng useSearchParams)
export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <Suspense fallback={<div className="text-center p-4">Đang tải...</div>}>
            <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}