import React from "react";
import { Order } from "@/types/order";
import { MapPin, DollarSign, Calendar } from "lucide-react";

const fmt = (v: number) => v.toLocaleString("vi-VN") + "₫";
const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

export default function InvoiceCard({
  order,
  onClick,
}: {
  order: Order;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="bg-white shadow-lg rounded-xl p-5 hover:shadow-2xl transition-all cursor-pointer border border-gray-100 hover:-translate-y-1"
    >
      <div className="flex justify-between items-center mb-3">
        <span className="font-mono text-sm text-gray-600">#{order.order_code}</span>
        <span
          className={`px-3 py-1 text-xs font-semibold rounded-full ${
            order.status === "pending"
              ? "bg-yellow-100 text-yellow-700"
              : order.status === "seed"
              ? "bg-green-100 text-green-700"
              : order.status === "completed"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {order.status === "pending"
            ? "Chờ duyệt"
            : order.status === "seed"
            ? "Đã duyệt"
            : order.status === "completed"
            ? "Xong"
            : "Từ chối"}
        </span>
      </div>

      <div className="flex items-center gap-2 text-gray-700 mb-1">
        <MapPin className="w-4 h-4 text-gray-400" />
        <span className="text-sm truncate">
          {order.shipping_address}, {order.ward_address}, {order.district_address}
        </span>
      </div>

      <div className="flex items-center gap-2 text-green-700 mb-1">
        <DollarSign className="w-4 h-4 text-green-500" />
        <span className="font-semibold">{fmt(order.amount)}</span>
      </div>

      <div className="flex items-center gap-2 text-gray-500 text-sm">
        <Calendar className="w-4 h-4 text-gray-400" />
        {formatDate(order.created_at)}
      </div>
    </div>
  );
}
