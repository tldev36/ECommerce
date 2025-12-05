"use client";

import React from "react";
import { Order } from "@/types/order";
import { 
  Clock, CheckCircle, Truck, PackageCheck, 
  AlertCircle, ChevronRight, MapPin, Calendar 
} from "lucide-react";
import { ORDER_STATUS } from "@/config/order-status.config";

// 1. Map Icon theo trạng thái (Vì config chỉ chứa màu/text)
const StatusIcons: Record<string, any> = {
  PENDING: Clock,
  CONFIRMED: CheckCircle,
  SHIPPING: Truck,
  COMPLETED: PackageCheck,
  CANCELLED: AlertCircle,
};

// 2. Format tiền tệ
const fmt = (v: number) => Number(v).toLocaleString("vi-VN") + "₫";

interface InvoiceCardProps {
  order: Order;
  index: number;
  onClick: () => void;
  onConfirm: () => void;
}

export default function InvoiceCard({
  order,
  index,
  onClick,
  onConfirm,
}: InvoiceCardProps) {
  // 3. Lấy config từ file chung
  const statusKey = order.status?.toUpperCase();
  const config = ORDER_STATUS[statusKey as keyof typeof ORDER_STATUS] || ORDER_STATUS.PENDING;
  
  // Lấy Icon tương ứng
  const Icon = StatusIcons[statusKey] || Clock;

  // Xử lý hiển thị địa chỉ gọn gàng
  // Giả sử shipping_address chứa "Tên-SĐT-Địa chỉ" hoặc chỉ là Địa chỉ
  const addressParts = order.shipping_address?.split('-') || [];
  const displayAddress = addressParts.length > 1 ? addressParts.slice(1).join(' - ') : order.shipping_address;

  return (
    <tr
      onClick={onClick}
      className="border-b border-gray-100 hover:bg-gray-50/80 cursor-pointer transition-colors group"
    >
      {/* STT */}
      <td className="py-4 px-6 text-gray-400 font-medium text-xs">
        #{index + 1}
      </td>

      {/* Mã đơn & Thời gian */}
      <td className="py-4 px-6">
        <div className="font-bold text-gray-800 text-sm mb-1">
          {order.order_code}
        </div>
        <div className="flex items-center text-xs text-gray-400 gap-1">
          <Calendar className="w-3 h-3" />
          {new Date(order.created_at).toLocaleDateString("vi-VN", {
            day: '2-digit', month: '2-digit'
          })}
        </div>
      </td>

      {/* Địa chỉ (Hiển thị thông minh hơn) */}
      <td className="py-4 px-6 max-w-[280px]">
        <div className="flex items-start gap-2">
           <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
           <div className="flex flex-col">
              {/* Nếu có ward/district riêng thì hiển thị, nếu không dùng shipping_address */}
              <span className="text-sm text-gray-700 font-medium line-clamp-1" title={order.shipping_address}>
                 {order.shipping_address?.split('-')[0] || "Khách hàng"}
              </span>
              <span className="text-xs text-gray-500 line-clamp-1" title={`${order.ward_address}, ${order.district_address}`}>
                 {order.ward_address ? `${order.ward_address}, ${order.district_address}` : displayAddress}
              </span>
           </div>
        </div>
      </td>

      {/* Tổng tiền */}
      <td className="py-4 px-6 font-bold text-emerald-600 text-sm">
        {fmt(Number(order.amount))}
      </td>

      {/* Trạng thái (Badge đồng bộ config) */}
      <td className="py-4 px-6">
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border shadow-sm whitespace-nowrap"
          style={{
            color: config.color,
            backgroundColor: `${config.color}15`, // Nền trong suốt 15%
            borderColor: `${config.color}30`      // Viền trong suốt 30%
          }}
        >
          <Icon className="w-3.5 h-3.5" />
          {config.label}
        </span>
      </td>

      {/* Hành động */}
      <td className="py-4 px-6 text-right">
        <div className="flex items-center justify-end gap-2">
          {/* Nút xác nhận chỉ hiện khi status là PENDING */}
          {config.code === 'PENDING' ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onConfirm();
              }}
              className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 text-xs font-semibold shadow-sm transition-all flex items-center gap-1"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Duyệt đơn
            </button>
          ) : (
             // Nếu không phải Pending thì hiện mũi tên gợi ý xem chi tiết
             <div className="p-2 text-gray-300 group-hover:text-emerald-500 transition-colors">
                <ChevronRight className="w-5 h-5" />
             </div>
          )}
        </div>
      </td>
    </tr>
  );
}