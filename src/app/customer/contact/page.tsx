"use client";

import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Cảm ơn bạn! Chúng tôi đã nhận được thông tin liên hệ.");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-12 mt-20">
      <h1 className="text-4xl font-bold text-center mb-6">Liên Hệ</h1>
      <p className="text-center text-gray-600 mb-10">
        Nếu bạn có bất kỳ thắc mắc hay góp ý nào, hãy gửi cho chúng tôi!
      </p>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Thông tin liên hệ */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Thông Tin</h2>
          <p className="text-gray-700 mb-2">
            📍 Địa chỉ: 123 Đường Thương Mại, Thủ Dầu Một, Bình Dương
          </p>
          <p className="text-gray-700 mb-2">
            📞 Hotline: 0123 456 789
          </p>
          <p className="text-gray-700 mb-2">
            ✉️ Email: <a href="mailto:contact@nongsan.vn" className="text-green-600 underline">contact@nongsan.vn</a>
          </p>
          <p className="text-gray-700">
            🕒 Thời gian làm việc: 8:00 - 17:00 (T2 - T7)
          </p>
        </div>

        {/* Form liên hệ */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-lg space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Họ và Tên</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Nhập họ tên của bạn"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Nội dung</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              required
              rows={4}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Hãy để lại lời nhắn..."
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white font-semibold py-2 rounded-lg hover:bg-green-700 transition-all"
          >
            Gửi Thông Tin
          </button>
        </form>
      </div>
    </main>
  );
}
