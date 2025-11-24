"use client";

import React, { useState } from "react";
import { Order } from "@/types/order";
import { 
  Package, X, CheckCircle, Truck, Clock, MapPin, 
  CreditCard, Calendar, ShoppingBag, AlertCircle,
  ChevronRight, Sparkles
} from "lucide-react";
import axios from "axios";

const fmt = (v: number) => v.toLocaleString("vi-VN") + "₫";
const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

const statusConfig = {
  pending: { 
    label: "Chờ duyệt", 
    bg: "bg-amber-50", 
    text: "text-amber-700", 
    border: "border-amber-200",
    icon: Clock,
    gradient: "from-amber-500 to-orange-500"
  },
  approved: { 
    label: "Đã duyệt", 
    bg: "bg-emerald-50", 
    text: "text-emerald-700", 
    border: "border-emerald-200",
    icon: CheckCircle,
    gradient: "from-emerald-500 to-green-500"
  },
  shipping: { 
    label: "Đang giao", 
    bg: "bg-blue-50", 
    text: "text-blue-700", 
    border: "border-blue-200",
    icon: Truck,
    gradient: "from-blue-500 to-cyan-500"
  },
  completed: { 
    label: "Hoàn thành", 
    bg: "bg-green-50", 
    text: "text-green-700", 
    border: "border-green-200",
    icon: Sparkles,
    gradient: "from-green-500 to-emerald-500"
  },
  confirmed: { 
    label: "Hoàn thành", 
    bg: "bg-green-50", 
    text: "text-green-700", 
    border: "border-green-200",
    icon: Sparkles,
    gradient: "from-green-500 to-emerald-500"
  },
  cancelled: { 
    label: "Từ chối", 
    bg: "bg-red-50", 
    text: "text-red-700", 
    border: "border-red-200",
    icon: AlertCircle,
    gradient: "from-red-500 to-rose-500"
  },
};

export default function InvoiceModal({
  order,
  onClose,
}: {
  order: Order;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(order.status);

  const currentStatus = statusConfig[status as keyof typeof statusConfig] || statusConfig.cancelled;
  const StatusIcon = currentStatus.icon;

  const handleConfirmShipping = async () => {
    if (!confirm("Xác nhận gửi đơn hàng này đi giao?")) return;
    try {
      setLoading(true);
      const res = await axios.put(`/api/orders/${order.id}/confirm`, { status: "shipping" });
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
    if (!addressString) return <span className="text-gray-400 italic">Chưa có địa chỉ</span>;
    return addressString.split("-").map((line, i) => (
      <div key={i} className="text-gray-600">{line.trim()}</div>
    ));
  }

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header với gradient */}
        <div className={`bg-gradient-to-r ${currentStatus.gradient} p-6 pb-16`}>
          <button
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all duration-200 hover:scale-110"
            onClick={onClose}
          >
            <X className="w-5 h-5 text-white" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-2xl p-3">
              <Package className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-white/80 text-sm font-medium">Đơn hàng</p>
              <h2 className="text-2xl font-bold text-white">#{order.order_code}</h2>
            </div>
          </div>
        </div>

        {/* Status Card - overlapping */}
        <div className="px-6 -mt-10 relative z-10">
          <div className={`${currentStatus.bg} ${currentStatus.border} border-2 rounded-2xl p-4 flex items-center gap-4 shadow-lg`}>
            <div className={`bg-gradient-to-br ${currentStatus.gradient} rounded-xl p-3`}>
              <StatusIcon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-gray-500 text-sm">Trạng thái đơn hàng</p>
              <p className={`font-bold text-lg ${currentStatus.text}`}>{currentStatus.label}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500 text-sm">Tổng thanh toán</p>
              <p className="font-bold text-xl text-gray-800">{fmt(order.amount)}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[50vh] overflow-y-auto">
          {/* Info Grid */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {/* Thời gian & Thanh toán */}
            <div className="bg-gray-50 rounded-2xl p-4 space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-purple-100 rounded-xl p-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Ngày đặt hàng</p>
                  <p className="font-semibold text-gray-800">{formatDate(order.created_at)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-indigo-100 rounded-xl p-2">
                  <CreditCard className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Thanh toán</p>
                  <p className="font-semibold text-gray-800 uppercase">{order.payment_method}</p>
                </div>
              </div>
            </div>

            {/* Địa chỉ */}
            <div className="bg-gray-50 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="bg-rose-100 rounded-xl p-2">
                  <MapPin className="w-5 h-5 text-rose-600" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-500 text-sm mb-1">Địa chỉ giao hàng</p>
                  <div className="font-medium text-gray-800 text-sm leading-relaxed">
                    {formatAddress(order.shipping_address)}
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between text-sm">
                <span className="text-gray-500">Phí vận chuyển</span>
                <span className="font-semibold text-gray-700">{fmt(order.ship_amount)}</span>
              </div>
            </div>
          </div>

          {/* Danh sách sản phẩm */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingBag className="w-5 h-5 text-gray-700" />
              <h3 className="font-bold text-gray-800">Sản phẩm đã đặt</h3>
              <span className="bg-gray-200 text-gray-600 text-xs font-semibold px-2 py-1 rounded-full">
                {order.order_items?.length || 0} sản phẩm
              </span>
            </div>

            <div className="space-y-3">
              {order.order_items?.map((item, idx) => (
                <div
                  key={item.id}
                  className="group bg-gray-50 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-2xl p-4 flex items-center gap-4 transition-all duration-300 hover:shadow-md"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {item.product?.image ? (
                    <img
                      src={`/images/products/${item.product.image}`}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-xl border-2 border-white shadow-md group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center">
                      <Package className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{item.product?.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="bg-white px-2 py-0.5 rounded-md text-sm text-gray-600 border">
                        SL: {item.quantity}
                      </span>
                      <span className="text-gray-400">×</span>
                      <span className="text-sm text-gray-600">{fmt(item.price)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                      {fmt(item.total_price)}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer với nút xác nhận */}
        {status === "pending" && (
          <div className="p-6 pt-0">
            <button
              onClick={handleConfirmShipping}
              disabled={loading}
              className="group relative w-full overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <span className="relative flex items-center justify-center gap-3">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Truck className="w-5 h-5" />
                    Xác nhận gửi đi giao hàng
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </div>
        )}
      </div> 
    </div>
  );
}