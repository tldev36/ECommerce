import React from "react";
import { Order } from "@/types/order";
import { MapPin, DollarSign, Calendar } from "lucide-react";
import { Clock, CheckCircle, Truck, Sparkles, AlertCircle } from "lucide-react";

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

const fmt = (v: number) => v.toLocaleString("vi-VN") + "₫";
const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

export default function InvoiceCard({
  order,
  index,
  onClick,
  onConfirm,
}: {
  order: Order;
  index: number;
  onClick: () => void;
  onConfirm: () => void;
}) {

  const config = statusConfig[order.status as keyof typeof statusConfig] ?? statusConfig.pending;
  const Icon = config.icon;

  return (
    <div
      onClick={onClick}
      className={`relative bg-white rounded-2xl p-6 cursor-pointer border 
      ${config.border} transition-all duration-300 ease-out
      hover:shadow-xl hover:-translate-y-2`}
    >

      {/* 🔹 Badge trạng thái */}
      <div
        className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold
        flex items-center gap-1 ${config.bg} ${config.text}`}
      >
        <Icon className="w-3 h-3" />
        {config.label}
      </div>

      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <div
            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.gradient}
            flex items-center justify-center text-white font-bold shadow-lg`}
          >
            {index}
          </div>
          <div>
            <span className="font-mono text-xs text-gray-500 block">Mã đơn</span>
            <span className="font-mono text-sm font-semibold text-gray-800">
              #{order.order_code}
            </span>
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-200 mb-4"></div>

      {/* Nội dung */}
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <MapPin className="w-4 h-4 text-blue-600" />
          <p className="text-sm text-gray-800 font-medium line-clamp-2">
            {order.shipping_address}, {order.ward_address}, {order.district_address}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <DollarSign className="w-4 h-4 text-blue-600" />
          <p className="text-lg font-bold text-blue-600">{fmt(order.amount)}</p>
        </div>

        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-blue-600" />
          <p className="text-sm text-gray-700 font-medium">
            {formatDate(order.created_at)}
          </p>
        </div>

        {/* ✅ Chỉ hiện nút khi trạng thái là pending */}
        {order.status === "pending" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onConfirm();
            }}
            className="w-full mt-4 py-3 rounded-xl font-semibold text-white
            bg-gradient-to-r from-green-600 to-emerald-600
            hover:from-green-700 hover:to-emerald-700
            transition-all shadow-md active:scale-[0.97]"
          >
            Xác nhận đơn hàng
          </button>
        )}
      </div>
    </div>
  );
}
