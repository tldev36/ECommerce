"use client";

import { motion, AnimatePresence } from "framer-motion";

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  date: string;
  status: string;
  total: number;
  items: OrderItem[];
}

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
}

export default function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  if (!order) return null;

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
    <AnimatePresence>
      {order && (
        <motion.div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 relative"
          >
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl"
              onClick={onClose}
            >
              ✕
            </button>

            {/* Title */}
            <h2 className="text-2xl font-bold mb-2">Chi tiết đơn hàng</h2>
            <p className="text-gray-500 mb-4">Mã đơn: {order.id}</p>

            {/* Order Info */}
            <div className="mb-4 space-y-2">
              <p className="text-gray-700">
                Ngày đặt: <span className="font-medium">{order.date}</span>
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

            {/* Items */}
            <h3 className="text-lg font-semibold mb-2">Sản phẩm</h3>
            <div className="divide-y border rounded-lg mb-4">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 text-sm"
                >
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <span className="font-medium">
                    {(item.price * item.quantity).toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="text-lg font-bold text-green-600">
              Tổng tiền:{" "}
              {order.total.toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
