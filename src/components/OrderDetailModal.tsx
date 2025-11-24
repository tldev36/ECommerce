"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Order } from "@/types/order";
import { X, Package, Calendar, CreditCard, Truck, CheckCircle2, Clock, XCircle } from "lucide-react";

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
}

export default function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  if (!order) return null;

  const getStatusConfig = (status?: string) => {
    if (!status) return {
      color: "text-gray-600 bg-gray-50 border-gray-200",
      icon: Clock,
      gradient: "from-gray-50 to-gray-100"
    };

    const s = status.toLowerCase();
    if (s === "đã giao" || s === "completed") {
      return {
        color: "text-emerald-700 bg-emerald-50 border-emerald-200",
        icon: CheckCircle2,
        gradient: "from-emerald-50 to-green-100"
      };
    }
    if (s === "đang xử lý" || s === "pending") {
      return {
        color: "text-amber-700 bg-amber-50 border-amber-200",
        icon: Clock,
        gradient: "from-amber-50 to-yellow-100"
      };
    }
    if (s === "đã hủy" || s === "cancelled") {
      return {
        color: "text-rose-700 bg-rose-50 border-rose-200",
        icon: XCircle,
        gradient: "from-rose-50 to-red-100"
      };
    }
    return {
      color: "text-gray-600 bg-gray-50 border-gray-200",
      icon: Clock,
      gradient: "from-gray-50 to-gray-100"
    };
  };

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  const formatStatus = (status?: string) => {
    if (!status) return "Không xác định";
    const s = status.toLowerCase();
    if (s === "pending") return "Đang xử lý";
    if (s === "completed") return "Đã giao";
    if (s === "cancelled") return "Đã hủy";
    return status; // fallback
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header với gradient */}
          <div className={`bg-gradient-to-br ${statusConfig.gradient} px-8 py-6 border-b border-gray-100`}>
            <button
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 hover:bg-white/50 rounded-full p-2 transition-all duration-200"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start justify-between pr-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Chi tiết đơn hàng</h2>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-500" />
                  <p className="text-gray-600">
                    Mã đơn: <span className="font-semibold text-gray-900">{order.order_code}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-8 py-6 max-h-[70vh] overflow-y-auto">
            {/* Thông tin đơn hàng - Grid layout */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-4 border border-blue-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-blue-500 rounded-lg p-2">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm text-gray-600 font-medium">Ngày đặt</span>
                </div>
                <p className="text-lg font-bold text-gray-900 ml-11">
                  {new Date(order.created_at ?? "").toLocaleDateString("vi-VN")}
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-4 border border-purple-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-purple-500 rounded-lg p-2">
                    <CreditCard className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm text-gray-600 font-medium">Thanh toán</span>
                </div>
                <p className="text-lg font-bold text-gray-900 uppercase ml-11">
                  {order.payment_method}
                </p>
              </div>

              <div className={`bg-gradient-to-br ${statusConfig.gradient} rounded-2xl p-4 border ${statusConfig.color.split(' ')[2]}`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`${statusConfig.color.split(' ')[1].replace('bg-', 'bg-').replace('50', '500')} rounded-lg p-2`}>
                    <StatusIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm text-gray-600 font-medium">Trạng thái</span>
                </div>
                <p className={`text-lg font-bold ml-11 ${statusConfig.color.split(' ')[0]}`}>
                  {formatStatus(order.status)}
                </p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl p-4 border border-orange-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-orange-500 rounded-lg p-2">
                    <Truck className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm text-gray-600 font-medium">Phí vận chuyển</span>
                </div>
                <p className="text-lg font-bold text-gray-900 ml-11">
                  {Number(order.ship_amount).toLocaleString("vi-VN")} ₫
                </p>
              </div>
            </div>

            {/* Danh sách sản phẩm */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Sản phẩm ({order.order_items?.length ?? 0})
              </h3>

              {(order.order_items?.length ?? 0) > 0 ? (
                <div className="space-y-3">
                  {order.order_items?.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-16 h-16 flex-shrink-0 relative rounded-xl overflow-hidden border-2 border-white shadow-md">
                          <Image
                            src={
                              item.product?.image
                                ? `/images/products/${item.product.image}`
                                : "/images/no-image.png"
                            }
                            alt={item.product?.name || "Sản phẩm"}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 mb-1 line-clamp-2">
                            {item.product?.name ?? "Sản phẩm"}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full font-medium">
                              SL: {item.quantity}
                            </span>
                            <span className="text-xs text-gray-500">
                              {item.price.toLocaleString("vi-VN")} ₫/sp
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-bold text-lg text-emerald-600">
                          {(item.price * item.quantity).toLocaleString("vi-VN")} ₫
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-2xl border border-gray-100">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 italic">Không có sản phẩm nào trong đơn hàng này.</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer - Tổng tiền */}
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 px-8 py-6 border-t border-emerald-400">
            <div className="flex justify-between items-center">
              <span className="text-white/90 text-lg font-medium">Tổng tiền thanh toán</span>
              <span className="text-3xl font-bold text-white">
                {Number(order.amount).toLocaleString("vi-VN")} ₫
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}