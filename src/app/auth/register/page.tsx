"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faUser, faPhone } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

export default function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }
    alert(`Đăng ký thành công!\nTên: ${form.name}\nEmail: ${form.email}`);
    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md border border-gray-200">
        <h2 className="text-3xl font-bold text-center text-green-700 mb-6">Đăng ký</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Họ và tên */}
          <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-2">
              <FontAwesomeIcon icon={faUser} className="text-green-600 w-4 h-4" />
              Họ và tên
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Nhập họ và tên"
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-2">
              <FontAwesomeIcon icon={faEnvelope} className="text-green-600 w-4 h-4" />
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="Nhập email"
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
            />
          </div>

          {/* Số điện thoại */}
          <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-2">
              <FontAwesomeIcon icon={faPhone} className="text-green-600 w-4 h-4" />
              Số điện thoại
            </label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              placeholder="Nhập số điện thoại"
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
            />
          </div>

          {/* Mật khẩu */}
          <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-2">
              <FontAwesomeIcon icon={faLock} className="text-green-600 w-4 h-4" />
              Mật khẩu
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="Nhập mật khẩu"
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
            />
          </div>

          {/* Xác nhận mật khẩu */}
          <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-2">
              <FontAwesomeIcon icon={faLock} className="text-green-600 " />
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Nhập lại mật khẩu"
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
            />
          </div>

          {/* Đồng ý điều khoản */}
          <div className="flex items-center gap-2 text-sm">
            <input type="checkbox" required className="form-checkbox text-green-600" />
            <span>
              Tôi đồng ý với{" "}
              <a href="/terms" className="text-green-600 hover:underline">
                điều khoản và chính sách
              </a>
            </span>
          </div>

          {/* Nút đăng ký */}
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium shadow-md transition"
          >
            Đăng ký
          </button>

          {/* Link đăng nhập */}
          <p className="text-center text-sm text-gray-600 mt-4">
            Đã có tài khoản?{" "}
            <Link href="/Auth/Login" className="text-green-600 hover:underline font-medium">
              Đăng nhập ngay
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
