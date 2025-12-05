"use client";

import React, { useState } from "react";
import { Order } from "@/types/order";
import { 
  X, CheckCircle, Truck, Clock, MapPin, 
  CreditCard, Calendar, PackageCheck, AlertCircle,
  Package, Printer, User, Phone, ChevronRight
} from "lucide-react";
import axios from "axios";
import { ORDER_STATUS } from "@/config/order-status.config"; // 1. Import Config

// Format tiền tệ
const fmt = (v: number) => Number(v).toLocaleString("vi-VN") + "₫";

// Map Icon theo Config (Vì config chỉ chứa string/color)
const StatusIcons: Record<string, any> = {
  PENDING: Clock,
  CONFIRMED: CheckCircle,
  SHIPPING: Truck,
  COMPLETED: PackageCheck,
  CANCELLED: AlertCircle,
};

interface InvoiceModalProps {
  order: Order;
  onClose: () => void;
}

export default function InvoiceModal({ order, onClose }: InvoiceModalProps) {
  const [loading, setLoading] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(order);

  // 2. Lấy config từ trạng thái hiện tại
  const statusKey = currentOrder.status?.toUpperCase();
  const config = ORDER_STATUS[statusKey as keyof typeof ORDER_STATUS] || ORDER_STATUS.PENDING;
  const StatusIcon = StatusIcons[statusKey] || Clock;

  // Xử lý xác nhận giao hàng (Logic ví dụ)
  const handleConfirmShipping = async () => {
    if (!confirm("Xác nhận chuyển đơn hàng sang trạng thái ĐANG GIAO?")) return;
    try {
      setLoading(true);
      // Gọi API cập nhật (Điều chỉnh endpoint theo backend của bạn)
      const res = await axios.put<{success: boolean}>(`/api/admin/orders/${order.id}/status`, { status: "shipping" });
      if (res.data.success) {
        // Cập nhật state local để UI đổi màu ngay lập tức
        setCurrentOrder({ ...currentOrder, status: "shipping" }); 
        alert("✅ Cập nhật thành công!");
      }
    } catch (error) {
      alert("❌ Lỗi cập nhật trạng thái.");
    } finally {
      setLoading(false);
    }
  };

  // Helper tách địa chỉ
  const parseAddress = (fullStr: string) => {
    const parts = fullStr?.split('-') || [];
    return {
       name: parts[0] || "Khách lẻ",
       phone: parts[1] || "",
       detail: parts.slice(2).join('-') || fullStr
    };
  };
  const addressInfo = parseAddress(currentOrder.shipping_address || "");

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* --- HEADER --- */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
           <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
                style={{ backgroundColor: config.color, color: 'white' }}
              >
                 <Package className="w-6 h-6" />
              </div>
              <div>
                 <h2 className="text-xl font-bold text-gray-900">Chi tiết đơn hàng</h2>
                 <p className="text-sm text-gray-500 font-mono">#{currentOrder.order_code}</p>
              </div>
           </div>

           <div className="flex gap-2">
              <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" title="In hóa đơn">
                 <Printer className="w-5 h-5" />
              </button>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                 <X className="w-6 h-6" />
              </button>
           </div>
        </div>

        {/* --- BODY (Scrollable) --- */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
           <div className="grid lg:grid-cols-3 gap-6">
              
              {/* Cột Trái: Thông tin chung */}
              <div className="lg:col-span-2 space-y-6">
                 
                 {/* Card Trạng thái */}
                 <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="p-3 rounded-full bg-gray-50 border border-gray-100">
                          <StatusIcon className="w-6 h-6" style={{ color: config.color }} />
                       </div>
                       <div>
                          <p className="text-sm text-gray-500">Trạng thái hiện tại</p>
                          <p className="text-lg font-bold" style={{ color: config.color }}>{config.label}</p>
                       </div>
                    </div>
                    
                    {/* Nút hành động nhanh (Ví dụ: Pending -> Shipping) */}
                    {statusKey === 'CONFIRMED' && (
                        <button 
                           onClick={handleConfirmShipping}
                           disabled={loading}
                           className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
                        >
                           {loading ? 'Đang xử lý...' : 'Giao hàng ngay'}
                        </button>
                    )}
                 </div>

                 {/* Card Sản phẩm */}
                 <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                       <h3 className="font-bold text-gray-700 flex items-center gap-2">
                          <PackageCheck className="w-4 h-4" /> Danh sách sản phẩm ({currentOrder.order_items?.length})
                       </h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                       {currentOrder.order_items?.map((item, idx) => (
                          <div key={idx} className="p-4 flex gap-4 hover:bg-gray-50 transition-colors">
                             {/* Ảnh sản phẩm */}
                             <div className="w-16 h-16 bg-gray-100 rounded-lg border border-gray-200 flex-shrink-0 overflow-hidden relative">
                                {item.product?.image ? (
                                   <img 
                                      src={`/images/products/${item.product.image}`} 
                                      alt="product" 
                                      className="w-full h-full object-cover"
                                   />
                                ) : (
                                   <div className="w-full h-full flex items-center justify-center text-gray-300"><Package /></div>
                                )}
                             </div>
                             
                             {/* Thông tin item */}
                             <div className="flex-1">
                                <p className="font-medium text-gray-900 line-clamp-1">{item.product?.name}</p>
                                <p className="text-sm text-gray-500 mt-1">Đơn giá: {fmt(Number(item.price))}</p>
                             </div>

                             {/* Tổng tiền item */}
                             <div className="text-right">
                                <p className="font-bold text-gray-900">{fmt(Number(item.price) * item.quantity)}</p>
                                <p className="text-sm text-gray-500">x{item.quantity}</p>
                             </div>
                          </div>
                       ))}
                    </div>
                    
                    {/* Tổng kết tiền */}
                    <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-2">
                       <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Thành tiền</span>
                          <span className="font-medium">{fmt(Number(currentOrder.amount) - Number(currentOrder.ship_amount || 0))}</span>
                       </div>
                       <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Phí vận chuyển</span>
                          <span className="font-medium">{fmt(Number(currentOrder.ship_amount || 0))}</span>
                       </div>
                       <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200 mt-2">
                          <span>Tổng cộng</span>
                          <span className="text-emerald-600">{fmt(Number(currentOrder.amount))}</span>
                       </div>
                    </div>
                 </div>

              </div>

              {/* Cột Phải: Thông tin Khách & Vận chuyển */}
              <div className="space-y-6">
                 
                 {/* Card Khách hàng */}
                 <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                    <h3 className="font-bold text-gray-900 border-b pb-2">Thông tin khách hàng</h3>
                    
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                          <User className="w-4 h-4" />
                       </div>
                       <div>
                          <p className="text-xs text-gray-500">Họ tên</p>
                          <p className="font-medium text-sm">{addressInfo.name}</p>
                       </div>
                    </div>

                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                          <Phone className="w-4 h-4" />
                       </div>
                       <div>
                          <p className="text-xs text-gray-500">Số điện thoại</p>
                          <p className="font-medium text-sm">{addressInfo.phone}</p>
                       </div>
                    </div>

                    <div className="flex items-start gap-3">
                       <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-4 h-4" />
                       </div>
                       <div>
                          <p className="text-xs text-gray-500">Địa chỉ giao hàng</p>
                          <p className="font-medium text-sm leading-tight mt-0.5">{addressInfo.detail}</p>
                       </div>
                    </div>
                 </div>

                 {/* Card Thông tin khác */}
                 <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                    <h3 className="font-bold text-gray-900 border-b pb-2">Thông tin khác</h3>
                    
                    <div className="flex justify-between items-center text-sm">
                       <div className="flex items-center gap-2 text-gray-500">
                          <Calendar className="w-4 h-4" /> Ngày đặt
                       </div>
                       <span className="font-medium">{new Date(currentOrder.created_at).toLocaleDateString("vi-VN")}</span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                       <div className="flex items-center gap-2 text-gray-500">
                          <CreditCard className="w-4 h-4" /> Thanh toán
                       </div>
                       <span className="font-medium uppercase bg-gray-100 px-2 py-0.5 rounded text-xs border border-gray-200">
                          {currentOrder.payment_method}
                       </span>
                    </div>
                 </div>

              </div>
           </div>
        </div>

        {/* --- FOOTER (Nút đóng) --- */}
        <div className="p-4 border-t border-gray-100 bg-white flex justify-end">
           <button 
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors"
           >
              Đóng
           </button>
        </div>

      </div>
    </div>
  );
}