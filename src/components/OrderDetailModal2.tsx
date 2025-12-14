"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Order } from "@/types/order";
import { Product } from "@/types/product";
import {
  X, Package, MapPin, CreditCard, Calendar,
  Check, Clock, Truck, XCircle
} from "lucide-react";
import { ORDER_STATUS } from "@/config/order-status.config";
import { useEffect, useState } from "react";
import axios from "axios";

// --- 1. SUB-COMPONENT: Xử lý từng dòng sản phẩm (Tự gọi API check discount) ---
const OrderItemRow = ({ item }: { item: any }) => {
  const [originalPrice, setOriginalPrice] = useState<number>(0);
  const [discountRate, setDiscountRate] = useState<number>(0);
  const [discountPrice, setDiscountPrice] = useState<number>(0);

  // Giá khách thực tế đã trả (Lấy từ OrderItem)
  const buyPrice = Number(item.price);

  useEffect(() => {
    const fetchProductInfo = async () => {
      const productId = item.product?.id || item.product_id;
      if (!productId) return;

      try {
        const res = await axios.get<Product>(`/api/products/order/${productId}`);
        const data = res.data;

        if (data) {
          const apiPrice = Number(data.price || 0);      // Giá gốc (Niêm yết)
          const apiDiscount = Number(data.discount || 0); // % Giảm giá

          // --- LOGIC ĐÃ SỬA ---

          // TRƯỜNG HỢP 1: API xác nhận có giảm giá (Ưu tiên cao nhất)
          if (apiDiscount > 0) {
            const pri = buyPrice * item.quantity;
            const tempprice = pri * (1 - apiDiscount / 100);
            setOriginalPrice(pri); // Giá gốc lấy từ API
            setDiscountRate(apiDiscount); // % lấy từ API
            setDiscountPrice(tempprice);
          }
          // TRƯỜNG HỢP 2: API không có giảm, nhưng Giá Niêm Yết hiện tại cao hơn Giá Lúc Mua
          // (Tức là hồi xưa khách mua rẻ hơn bây giờ -> Vẫn hiện gạch ngang cho khách vui)
          // else if (apiPrice > buyPrice) {
          //   setOriginalPrice(apiPrice);
          //   const calculatedDiscount = Math.round(((apiPrice - buyPrice) / apiPrice) * 100);
          //   setDiscountRate(calculatedDiscount);
          // }
          else{
            const pri = buyPrice * item.quantity;
            setDiscountPrice(pri);
          }


        }
      } catch (error) {
        console.error("Lỗi lấy thông tin sp:", error);
      }
    };

    fetchProductInfo();
  }, [item, buyPrice]);

  return (
    <div className="flex gap-4 group">
      {/* Hình ảnh sản phẩm */}
      <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden relative border border-gray-200 shrink-0">
        <Image
          src={item.product?.image ? `/images/products/${item.product.image}` : "/images/no-image.png"}
          alt="product"
          fill
          className="object-cover"
        />
        {/* Badge % Giảm giá */}
        {discountRate > 0 && (
          <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] px-1.5 py-0.5 font-bold rounded-bl-md shadow-sm z-10">
            -{discountRate}%
          </div>
        )}
      </div>

      {/* Thông tin & Giá */}
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <p className="text-sm font-medium text-gray-900 line-clamp-2 pr-4 group-hover:text-emerald-600 transition-colors">
            {item.product?.name}
          </p>

          <div className="text-right shrink-0 flex flex-col items-end">
            {/* Giá gốc bị gạch ngang (Chỉ hiện khi có discount) */}
            {discountRate > 0 && (
              <span className="text-xs text-gray-400 line-through mb-0.5 block">
                {originalPrice.toLocaleString("vi-VN")} ₫
              </span>
            )}

            {/* Giá khách đã mua (Luôn hiển thị) */}
            <span className={`text-sm font-bold ${discountRate > 0 ? 'text-red-600' : 'text-gray-900'}`}>
              {discountPrice.toLocaleString("vi-VN")} ₫
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1 bg-gray-100 inline-block px-2 py-0.5 rounded text-center">x{item.quantity}</p>
      </div>
    </div>
  );
};

// --- 2. MAIN COMPONENT: Modal chi tiết đơn hàng ---
interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
}

export default function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  if (!order) return null;

  // Config & Helpers
  const getStatusConfig = (status?: string) => {
    const normalized = status?.toUpperCase();
    return ORDER_STATUS[normalized as keyof typeof ORDER_STATUS] || ORDER_STATUS.PENDING;
  };
  const config = getStatusConfig(order.status);

  // Progress Bar Steps
  const PROGRESS_STEPS = [
    ORDER_STATUS.PENDING,
    ORDER_STATUS.PROCESSING,
    ORDER_STATUS.SHIPPING,
    ORDER_STATUS.COMPLETED
  ];

  const currentStepIndex = PROGRESS_STEPS.findIndex(step => step.code === config.code);
  const isCancelled = config.code === 'CANCELLED';

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.4 }}
          className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Chi tiết đơn hàng</h2>
              <p className="text-sm text-gray-500">Mã đơn: <span className="font-mono font-medium text-gray-700">{order.order_code}</span></p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">

            {/* 1. TRẠNG THÁI ĐƠN HÀNG */}
            <div className="bg-gray-50 p-6">
              {isCancelled ? (
                <div className="flex items-center gap-4 bg-red-50 p-4 rounded-xl border border-red-100 text-red-700">
                  <XCircle size={32} />
                  <div>
                    <p className="font-bold text-lg">Đơn hàng đã bị hủy</p>
                    <p className="text-sm opacity-90">{config.description}</p>
                  </div>
                </div>
              ) : (
                <div className="relative flex justify-between items-center w-full px-2">
                  <div className="absolute top-4 left-0 w-full h-1 bg-gray-200 -z-0 rounded-full"></div>
                  <div
                    className="absolute top-4 left-0 h-1 bg-emerald-500 -z-0 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(10, (currentStepIndex / (PROGRESS_STEPS.length - 1)) * 100)}%` }}
                  ></div>
                  {PROGRESS_STEPS.map((step, index) => {
                    const isActive = index <= currentStepIndex;
                    let StepIcon = Clock;
                    if (step.code === 'PROCESSING') StepIcon = Package;
                    if (step.code === 'SHIPPING') StepIcon = Truck;
                    if (step.code === 'COMPLETED') StepIcon = Check;

                    return (
                      <div key={step.code} className="relative z-10 flex flex-col items-center gap-2 w-24">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isActive ? 'bg-emerald-500 border-emerald-500 text-white shadow-md scale-110' : 'bg-white border-gray-300 text-gray-300'
                          }`}>
                          <StepIcon size={16} />
                        </div>
                        <p className={`text-[10px] sm:text-xs font-semibold text-center ${isActive ? 'text-emerald-700' : 'text-gray-400'
                          }`}>
                          {step.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. THÔNG TIN GIAO HÀNG */}
            <div className="p-6 grid gap-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Địa chỉ nhận hàng</p>
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                      {order.shipping_address || "Chưa cập nhật địa chỉ"}
                    </p>
                  </div>
                </div>
                <div className="flex-1 space-y-3 sm:border-l sm:pl-6 border-gray-100">
                  <div className="flex items-center gap-3">
                    <CreditCard size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600 uppercase font-medium">{order.payment_method}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {new Date(order.created_at || "").toLocaleDateString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-2 bg-gray-50 border-t border-b border-gray-100"></div>

            {/* 3. DANH SÁCH SẢN PHẨM (Đã cập nhật logic Discount) */}
            <div className="p-6">
              <h3 className="font-bold text-gray-900 mb-4">Sản phẩm đã mua</h3>
              <div className="space-y-4">
                {order.order_items?.map((item, idx) => (
                  // Gọi Component con đã tách ra để xử lý logic hiển thị giá
                  <OrderItemRow key={idx} item={item} />
                ))}
              </div>
            </div>

          </div>

          {/* FOOTER - TỔNG TIỀN */}
          <div className="bg-gray-50 p-6 border-t border-gray-100 space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Tạm tính</span>
              <span>{(Number(order.amount) - Number(order.ship_amount || 0)).toLocaleString("vi-VN")} ₫</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Phí vận chuyển</span>
              <span>{Number(order.ship_amount || 0).toLocaleString("vi-VN")} ₫</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-2">
              <span className="font-bold text-gray-900">Tổng thanh toán</span>
              <span className="text-xl font-bold text-emerald-600">{Number(order.amount).toLocaleString("vi-VN")} ₫</span>
            </div>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}