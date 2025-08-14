"use client";

import { useState } from "react";
import OrderDetailModal from "@/components/OrderDetailModal";

interface Order {
  id: string;
  date: string;
  status: string;
  total: number;
  items: { name: string; price: number; quantity: number }[];
}

const orders: Order[] = [
  {
    id: "DH001",
    date: "2025-08-01",
    status: "Đã giao",
    total: 1500000,
    items: [
      { name: "Gạo ST25", price: 25000, quantity: 10 },
      { name: "Dầu ăn Neptune", price: 45000, quantity: 5 },
    ],
  },
  {
    id: "DH002",
    date: "2025-07-20",
    status: "Đang xử lý",
    total: 820000,
    items: [{ name: "Hạt giống cà chua", price: 20000, quantity: 10 }],
  },
  {
    id: "DH003",
    date: "2025-07-10",
    status: "Đã hủy",
    total: 450000,
    items: [{ name: "Phân bón NPK", price: 150000, quantity: 3 }],
  },
];

export default function OrderHistoryPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Đã giao":
        return "text-green-600 bg-green-100";
      case "Đang xử lý":
        return "text-yellow-600 bg-yellow-100";
      case "Đã hủy":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">📦 Lịch sử đơn hàng</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-md border">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-xl font-semibold mb-2">Bạn chưa có đơn hàng nào</h2>
          <p className="text-gray-500 mb-6">
            Hãy bắt đầu mua sắm và tận hưởng ưu đãi ngay hôm nay.
          </p>
          <a
            href="/products"
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Mua ngay
          </a>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200 bg-white">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <th className="px-6 py-4 text-left font-semibold">Mã đơn</th>
                <th className="px-6 py-4 text-left font-semibold">Ngày đặt</th>
                <th className="px-6 py-4 text-left font-semibold">Trạng thái</th>
                <th className="px-6 py-4 text-left font-semibold">Tổng tiền</th>
                <th className="px-6 py-4 text-center font-semibold">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr
                  key={order.id}
                  className={`${index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-green-50 transition`}
                >
                  <td className="px-6 py-4 font-medium">{order.id}</td>
                  <td className="px-6 py-4">{order.date}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-green-600">
                    {order.total.toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 hover:shadow-md transition"
                      onClick={() => setSelectedOrder(order)}
                    >
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}
