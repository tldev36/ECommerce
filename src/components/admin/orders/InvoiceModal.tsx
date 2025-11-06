"use client";

import React, { useState } from "react";
import { Order } from "@/types/order";
import { Package, X, CheckCircle } from "lucide-react";
import axios from "axios";

const fmt = (v: number) => v.toLocaleString("vi-VN") + "₫";
const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

export default function InvoiceModal({
  order,
  onClose,
}: {
  order: Order;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(order.status);

  const handleConfirmShipping = async () => {
    if (!confirm("Xác nhận gửi đơn hàng này đi giao?")) return;

    try {
      setLoading(true);
      const res = await axios.put(`/api/orders/${order.id}/confirm`, {
        status: "shipping",
      });
      if (res.status === 200) {
        alert("✅ Đơn hàng đã được xác nhận giao thành công!");
        setStatus("shipping");
      } else {
        alert("❌ Xác nhận thất bại, vui lòng thử lại.");
      }
    } catch (error) {
      console.error(error);
      alert("Lỗi khi cập nhật trạng thái đơn hàng.");
    } finally {
      setLoading(false);
    }
  };

   function formatAddress(addressString?: string) {
    if (!addressString) return null; // tránh lỗi null/undefined
    return addressString.split("-").map((line, index) => (
      <div key={index}>{line.trim()}</div>
    ));
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl p-8 relative overflow-y-auto max-h-[90vh]">
        {/* Nút đóng */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </button>

        {/* Tiêu đề */}
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Package className="w-6 h-6 text-blue-500" />
          Chi tiết đơn hàng #{order.order_code}
        </h2>

        {/* Thông tin đơn */}
        <div className="grid md:grid-cols-2 gap-4 mb-6 text-sm">
          <div className="space-y-2">
            <p>
              <strong>Trạng thái:</strong>{" "}
              <span
                className={`px-2 py-1 rounded-md text-xs font-semibold ${
                  status === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : status === "approved"
                    ? "bg-green-100 text-green-700"
                    : status === "shipping"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {status === "pending"
                  ? "Chờ duyệt"
                  : status === "approved"
                  ? "Đã duyệt"
                  : status === "shipping"
                  ? "Đang giao"
                  : "Từ chối"}
              </span>
            </p>
            <p>
              <strong>Ngày tạo:</strong> {formatDate(order.created_at)}
            </p>
            <p>
              <strong>Phương thức thanh toán:</strong>{" "}
              {order.payment_method.toUpperCase()}
            </p>
          </div>
          <div className="space-y-2">
            <div>
              <strong>Địa chỉ giao hàng:</strong>
              <br />
              {formatAddress(order.shipping_address)}
            </div>
            <p>
              <strong>Phí ship:</strong> {fmt(order.ship_amount)}
            </p>
            <p>
              <strong>Tổng tiền:</strong>{" "}
              <span className="text-green-700 font-semibold">
                {fmt(order.amount)}
              </span>
            </p>
          </div>
        </div>

        {/* Danh sách sản phẩm */}
        <h3 className="text-lg font-semibold mb-3 border-b pb-2">
          Danh sách sản phẩm
        </h3>

        <div className="divide-y border rounded-lg mb-6">
          {order.order_items?.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center p-3 hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-3">
                {item.product?.image ? (
                  <img
                    src={`/images/products/${item.product.image}`}
                    alt={item.product.name}
                    className="w-12 h-12 object-cover rounded-lg border"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                    No image
                  </div>
                )}
                <div>
                  <p className="font-medium">{item.product?.name}</p>
                  <p className="text-gray-500 text-xs">
                    SL: {item.quantity} × {fmt(item.price)}
                  </p>
                </div>
              </div>
              <span className="font-semibold text-green-700">
                {fmt(item.total_price)}
              </span>
            </div>
          ))}
        </div>

        {/* Nút xác nhận giao hàng */}
        {status === "pending" && (
          <button
            onClick={handleConfirmShipping}
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-60"
          >
            <CheckCircle className="w-5 h-5" />
            {loading ? "Đang xử lý..." : "Xác nhận gửi đi giao hàng"}
          </button>
        )}
      </div>
    </div>
  );
}
