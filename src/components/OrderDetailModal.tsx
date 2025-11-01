"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Order } from "@/types/order";
import { useEffect } from "react";

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
}

export default function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  // 🚫 Không có order => không render modal
  if (!order) return null;

  useEffect(() => {
    console.log("📦 Dữ liệu order:", order);
  }, [order]);

  const getStatusColor = (status?: string) => {
    if (!status) return "text-gray-600 bg-gray-100";
    switch (status.toLowerCase()) {
      case "đã giao":
      case "delivered":
        return "text-green-600 bg-green-100";
      case "đang xử lý":
      case "processing":
        return "text-yellow-600 bg-yellow-100";
      case "đã hủy":
      case "cancelled":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 relative"
        >
          {/* 🔹 Nút đóng */}
          <button
            className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl"
            onClick={onClose}
          >
            ✕
          </button>

          {/* 🔹 Tiêu đề */}
          <h2 className="text-2xl font-bold mb-2">Chi tiết đơn hàng</h2>
          <p className="text-gray-500 mb-4">
            Mã đơn: <span className="font-medium">{order.order_code}</span>
          </p>

          {/* 🔹 Thông tin đơn hàng */}
          <div className="mb-4 space-y-2 text-sm">
            <p>
              Ngày đặt:{" "}
              <span className="font-medium">
                {new Date(order.created_at ?? "").toLocaleDateString("vi-VN")}
              </span>
            </p>
            <p>
              Hình thức thanh toán:{" "}
              <span className="font-medium uppercase">{order.payment_method}</span>
            </p>
            <p>
              Trạng thái:{" "}
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                  order.status
                )}`}
              >
                {order.status}
              </span>
            </p>
          </div>

          {/* 🔹 Danh sách sản phẩm */}
          <h3 className="text-lg font-semibold mb-2">Sản phẩm</h3>
          {(order.order_items?.length ?? 0) > 0 ? (
            <div className="divide-y border rounded-lg mb-4">
              {order.order_items?.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 text-sm"
                >
                  <div className="flex items-center gap-3">
                    {/* ✅ Ảnh sản phẩm */}
                    <div className="w-10 h-10 flex-shrink-0 relative">
                      <Image
                        src={
                          item.product?.image
                            ? `/images/products/${item.product.image}`
                            : "/images/no-image.png" // fallback
                        }
                        alt={item.product?.name || "Sản phẩm"}
                        fill
                        className="object-cover rounded-md border"
                      />
                    </div>

                    {/* ✅ Thông tin sản phẩm */}
                    <div>
                      <p className="font-medium line-clamp-1">
                        {item.product?.name ?? "Sản phẩm"}
                      </p>
                      <p className="text-gray-500 text-xs">
                        SL: {item.quantity}
                      </p>
                    </div>
                  </div>

                  {/* ✅ Giá sản phẩm */}
                  <span className="font-semibold text-green-700">
                    {(item.price * item.quantity).toLocaleString("vi-VN")} ₫
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic mb-4">
              Không có sản phẩm nào trong đơn hàng này.
            </p>
          )}

          {/* 🔹 Tổng tiền */}
          <div className="text-right text-lg font-bold text-green-600">
            Tổng tiền: {Number(order.total_amount).toLocaleString("vi-VN")} ₫
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
