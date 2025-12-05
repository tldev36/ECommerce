"use client";

import React from "react";
import {
  X,
  User,
  MapPin,
  Calendar,
  CreditCard,
  Package,
  Printer,
  Truck,
  Tag,
} from "lucide-react";
import { OrderRow } from "@/types"; // Đảm bảo import đúng type của bạn

interface OrderDetailModalProps {
  order: any; // Hoặc dùng type OrderRow nếu đầy đủ field
  onClose: () => void;
}

export default function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  if (!order) return null;

  // Format tiền tệ
  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);

  // Format ngày
  const formatDate = (v: string) =>
    new Date(v).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  // Helper render trạng thái
  const renderStatus = (status: string) => {
    const s = status?.toUpperCase();
    let style = "bg-gray-100 text-gray-600 border-gray-200";
    let label = status;

    switch (s) {
      case "COMPLETED":
        style = "bg-emerald-50 text-emerald-700 border-emerald-200";
        label = "Hoàn thành";
        break;
      case "PENDING":
        style = "bg-yellow-50 text-yellow-700 border-yellow-200";
        label = "Chờ xử lý";
        break;
      case "SHIPPING":
        style = "bg-blue-50 text-blue-700 border-blue-200";
        label = "Đang giao";
        break;
      case "CANCELLED":
        style = "bg-red-50 text-red-700 border-red-200";
        label = "Đã hủy";
        break;
    }

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${style}`}>
        {label}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* 1. Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-gray-800">
                Đơn hàng #{order.order_code}
              </h2>
              {renderStatus(order.status)}
            </div>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(order.created_at)}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
                onClick={() => window.print()} // Nút in đơn giản (hoặc xử lý in riêng)
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"
                title="In đơn hàng"
            >
                <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* 2. Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Thông tin khách hàng & Giao hàng */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cột trái: Khách hàng */}
            <div className="space-y-4 p-4 rounded-xl border border-gray-100 bg-gray-50/30">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-blue-500" />
                Thông tin khách hàng
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Tên khách:</span>
                  <span className="font-medium text-gray-900">{order.customer || "Khách lẻ"}</span>
                </div>
                {/* Giả sử shipping_address chứa cả SĐT, nếu tách riêng thì hiển thị riêng */}
                <div className="flex flex-col gap-1">
                  <span className="text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Địa chỉ giao hàng:
                  </span>
                  <span className="font-medium text-gray-900 pl-4">
                    {order.shipping_address || "Tại cửa hàng"}
                  </span>
                </div>
              </div>
            </div>

            {/* Cột phải: Thanh toán & Vận chuyển */}
            <div className="space-y-4 p-4 rounded-xl border border-gray-100 bg-gray-50/30">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-500" />
                Thanh toán & Vận chuyển
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-500">Phương thức:</span>
                    <span className="font-medium text-gray-900">{order.payment_method || "COD"}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500">Phí vận chuyển:</span>
                    <span className="font-medium text-gray-900">{formatCurrency(order.ship_amount || 0)}</span>
                </div>
                 {/* Nếu có mã giảm giá */}
                 {(order.coupon_amount > 0) && (
                    <div className="flex justify-between text-emerald-600">
                        <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> Giảm giá:</span>
                        <span className="font-bold">-{formatCurrency(order.coupon_amount)}</span>
                    </div>
                 )}
              </div>
            </div>
          </div>

          {/* Danh sách sản phẩm */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Package className="w-4 h-4 text-orange-500" />
                Chi tiết sản phẩm ({order.items?.length || 0})
            </h3>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium">
                  <tr>
                    <th className="px-4 py-3 w-16 text-center">#</th>
                    <th className="px-4 py-3">Sản phẩm</th>
                    <th className="px-4 py-3 text-center">ĐVT</th>
                    <th className="px-4 py-3 text-right">Đơn giá</th>
                    <th className="px-4 py-3 text-center">SL</th>
                    <th className="px-4 py-3 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {order.items?.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 text-center text-gray-400">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          
                          <div>
                            <p className="font-medium text-gray-900 line-clamp-1">{item.product_name}</p>
                            {/* <p className="text-xs text-gray-500">Mã: {item.product_id}</p> */}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-500">{item.unit || "Cái"}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(item.price)}</td>
                      <td className="px-4 py-3 text-center font-medium">{item.quantity}</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">
                        {formatCurrency(item.total_price || item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 3. Footer (Summary) */}
        <div className="bg-gray-50 p-6 border-t border-gray-200">
          <div className="flex flex-col items-end gap-2 text-sm">
            <div className="flex justify-between w-full sm:w-64">
                <span className="text-gray-500">Tạm tính:</span>
                <span className="font-medium">
                    {formatCurrency((order.amount || 0) - (order.ship_amount || 0) + (order.coupon_amount || 0))}
                </span>
            </div>
            
            <div className="flex justify-between w-full sm:w-64 pt-3 border-t border-gray-200">
                <span className="text-base font-bold text-gray-900">Tổng cộng:</span>
                <span className="text-xl font-bold text-emerald-600">
                    {formatCurrency(order.amount)}
                </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}