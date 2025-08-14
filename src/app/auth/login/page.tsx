"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // alert(`Đăng nhập thành công!\nEmail: ${form.email}`);
    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md border border-gray-200 min-h-[500px] flex flex-col justify-center">
        <h2 className="text-3xl font-bold text-center text-green-700 mb-8">
          Đăng nhập
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">
              <span className="flex items-center gap-2">
                <FontAwesomeIcon icon={faEnvelope} className="text-green-600 w-4 h-4" />
                Email
              </span>
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              // required
              placeholder="Nhập email"
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
            />
          </div>

          {/* Mật khẩu */}
          <div>
            <label className="block text-sm font-medium mb-1">
              <span className="flex items-center gap-2">
                <FontAwesomeIcon icon={faLock} className="text-green-600 " />
                Mật khẩu
              </span>
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              // required
              placeholder="Nhập mật khẩu"
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
            />
          </div>

          {/* Nút đăng nhập */}
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium shadow-md transition"
          >
            Đăng nhập
          </button>

          {/* Link đăng ký */}
          <p className="text-center text-sm text-gray-600 mt-4">
            Chưa có tài khoản?{" "}
            <Link
              href="/Auth/Register"
              className="text-green-600 hover:underline font-medium"
            >
              Đăng ký ngay
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
