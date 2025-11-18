"use client";

import React, { useEffect, useState } from "react";
import { Download, Loader2 } from "lucide-react";

interface Invoice {
  id: number;
  order_code: string;
  customer?: string;
  date: string;
  total: number;
  status: string;
  payment_method: string;
}

export default function StatisticsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filtered, setFiltered] = useState<Invoice[]>([]);
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [status, setStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // 🧠 Lấy dữ liệu thật từ API
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/statistics/list-order");
        const data = await res.json();
        if (data.success) {
          const orders = data.orders.map((o: any) => ({
            id: o.id,
            order_code: o.order_code,
            customer: o.user_id ? `User #${o.user_id}` : "Khách lẻ",
            date: o.created_at,
            total: o.amount,
            status: o.status,
            payment_method: o.payment_method,
          }));
          setInvoices(orders);
        }
      } catch (err) {
        console.error("Lỗi tải dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // 🔍 Lọc dữ liệu theo tháng, năm, trạng thái, tìm kiếm
  useEffect(() => {
    let filteredList = invoices;

    filteredList = filteredList.filter((inv) => {
      const d = new Date(inv.date);
      return d.getMonth() + 1 === month && d.getFullYear() === year;
    });

    if (status !== "all") filteredList = filteredList.filter((inv) => inv.status === status);

    if (search.trim() !== "") {
      filteredList = filteredList.filter(
        (inv) =>
          inv.order_code.toLowerCase().includes(search.toLowerCase()) ||
          inv.customer?.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFiltered(filteredList);
  }, [invoices, month, year, status, search]);

  const totalRevenue = filtered.reduce((sum, inv) => sum + inv.total, 0);
  const totalOrders = filtered.length;
  const completedOrders = filtered.filter((i) => i.status === "completed").length;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        📊 Thống kê chi tiết hóa đơn
      </h1>

      {/* Bộ lọc */}
      <div className="bg-white shadow rounded-2xl p-4 mb-6 flex flex-wrap items-center gap-4 justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="border p-2 rounded-lg">
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                Tháng {i + 1}
              </option>
            ))}
          </select>

          <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="border p-2 rounded-lg">
            {[2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>
                Năm {y}
              </option>
            ))}
          </select>

          <select value={status} onChange={(e) => setStatus(e.target.value)} className="border p-2 rounded-lg">
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="processing">Đang xử lý</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>

          <input
            type="text"
            placeholder="🔍 Tìm kiếm mã đơn hoặc tên khách hàng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 rounded-lg w-64"
          />

          <button
            onClick={() => setSearch("")}
            className="bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
          >
            Làm mới
          </button>
        </div>

        {/* Nút xuất Excel */}
        <button
          onClick={() => alert("Chức năng xuất Excel đang được phát triển!")}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
        >
          <Download size={18} />
          Xuất Excel
        </button>
      </div>

      {/* Tổng kết nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-100 p-4 rounded-xl text-center">
          <p className="text-gray-600">Tổng doanh thu</p>
          <p className="text-2xl font-bold text-green-700">
            {totalRevenue.toLocaleString()}₫
          </p>
        </div>
        <div className="bg-blue-100 p-4 rounded-xl text-center">
          <p className="text-gray-600">Tổng số đơn</p>
          <p className="text-2xl font-bold text-blue-700">{totalOrders}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-xl text-center">
          <p className="text-gray-600">Đơn hoàn thành</p>
          <p className="text-2xl font-bold text-yellow-700">{completedOrders}</p>
        </div>
      </div>

      {/* Bảng dữ liệu */}
      <div className="bg-white shadow rounded-2xl overflow-x-auto">
        {loading ? (
          <div className="p-10 text-center text-gray-500 flex items-center justify-center gap-2">
            <Loader2 className="animate-spin" /> Đang tải dữ liệu...
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-3 border-b">Mã đơn</th>
                <th className="text-left p-3 border-b">Khách hàng</th>
                <th className="text-left p-3 border-b">Ngày tạo</th>
                <th className="text-right p-3 border-b">Tổng tiền</th>
                <th className="text-center p-3 border-b">Trạng thái</th>
                <th className="text-center p-3 border-b">Thanh toán</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors border-b">
                    <td className="p-3 font-medium">{inv.order_code}</td>
                    <td className="p-3">{inv.customer}</td>
                    <td className="p-3">{new Date(inv.date).toLocaleDateString("vi-VN")}</td>
                    <td className="p-3 text-right">{inv.total.toLocaleString()}₫</td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-sm ${
                          inv.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : inv.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : inv.status === "processing"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-3 text-center capitalize">{inv.payment_method}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-500">
                    Không có dữ liệu phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
