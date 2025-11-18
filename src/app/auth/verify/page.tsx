"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function VerifyPage() {
  const params = useSearchParams();
  const [message, setMessage] = useState("Đang xác minh tài khoản...");

  useEffect(() => {
    // Nếu params null thì thông báo lỗi
    if (!params) {
      setMessage("Thiếu mã xác thực");
      return;
    }

    const token = params.get("token");

    if (!token) {
      setMessage("Thiếu mã xác thực");
      return;
    }

    fetch(`/api/auth/verify?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setMessage(`❌ ${data.error}`);
        else setMessage("🎉 Xác thực thành công! Bạn có thể đăng nhập ngay.");
      })
      .catch(() => setMessage("Lỗi xác thực, vui lòng thử lại."));
  }, [params]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-semibold text-green-700 mb-2">Xác minh tài khoản</h1>
        <p className="text-gray-700">{message}</p>
        <a
          href="/auth/login"
          className="block mt-4 text-green-600 hover:underline font-medium"
        >
          Đăng nhập
        </a>
      </div>
    </div>
  );
}
