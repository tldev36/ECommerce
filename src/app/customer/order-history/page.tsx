"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import OrderDetailModal from "@/components/OrderDetailModal";
import { Order } from "@/types/order";
import { useCart } from "@/context/CartContext";

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { user, isLoggedIn } = useCart();

  // 🧩 Debug
  useEffect(() => {
    console.log("=== CART PAGE DEBUG ===");
    console.log("isLoggedIn:", isLoggedIn);
    console.log("user:", user);
  }, [isLoggedIn, user]);

  // 🔹 Lấy danh sách đơn hàng
  useEffect(() => {
    const fetchOrders = async () => {
      if (!isLoggedIn || !user?.id) return;

      setLoading(true);
      try {
        const res = await axios.post<Order[]>("/api/orders/me", { user_id: user.id });
        setOrders(res.data);
      } catch (err) {
        console.error("Lỗi khi tải đơn hàng:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user?.id, isLoggedIn]); // 👈 thêm cả isLoggedIn

  // 🔹 Helper màu trạng thái
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Đã giao":
      case "delivered":
        return "text-green-600 bg-green-100";
      case "Đang xử lý":
      case "processing":
        return "text-yellow-600 bg-yellow-100";
      case "Đã hủy":
      case "cancelled":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500 animate-pulse">Đang tải đơn hàng...</div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-md border">
        <h2 className="text-xl font-semibold mb-2">Vui lòng đăng nhập để xem đơn hàng</h2>
        <a
          href="/login"
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Đăng nhập
        </a>
      </div>
    );
  }

  function formatAddress(addressString?: string) {
    if (!addressString) return null; // tránh lỗi null/undefined
    return addressString.split("-").map((line, index) => (
      <div key={index}>{line.trim()}</div>
    ));
  }

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
                <th className="px-6 py-4 text-left font-semibold">Địa chỉ</th>

                <th className="px-6 py-4 text-center font-semibold">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr
                  key={order.id}
                  className={`${index % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-green-50 transition`}
                >
                  <td className="px-6 py-4 font-medium">{order.order_code}</td>
                  <td className="px-6 py-4">
                    {new Date(order.created_at ?? "").toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-green-600">
                    {Number(order.amount).toLocaleString("vi-VN")} ₫
                  </td>
                  <td className="px-6 py-4 font-semibold text-green-600">
                    {formatAddress(order.shipping_address)}
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

      {/* 🔹 Modal chi tiết */}
      <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
}
