"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import OrderDetailModal from "@/components/OrderDetailModal";
import { Order } from "@/types/order";
import { useCart } from "@/context/CartContext";
import { Search, Package, Calendar, MapPin, DollarSign, Filter, ChevronRight, Clock, Truck, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { ORDER_STATUS, ORDER_STATUS_LIST } from "@/config/order-status.config";

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const { user, isLoggedIn } = useCart();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isLoggedIn || !user?.id) return;
      setLoading(true);
      try {
        const res = await axios.post<Order[]>("/api/orders/me", { user_id: user.id });
        setOrders(res.data);
      } catch (err) {
        console.error("Lỗi khi tải đơn hàng:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user?.id, isLoggedIn]);

  // --- HELPERS ---
  const getStatusConfig = (status: string) => {
    const normalizedStatus = status?.toUpperCase();
    return ORDER_STATUS[normalizedStatus as keyof typeof ORDER_STATUS] || ORDER_STATUS.PENDING;
  };

  const getStatusBadge = (status: string) => {
    const config = getStatusConfig(status);
    return (
      <span
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
        style={{
          color: config.color,
          backgroundColor: `${config.color}10`,
          borderColor: `${config.color}30`,
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.color }}></span>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(dateString));
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch = order.order_code.toLowerCase().includes(searchTerm.toLowerCase()) || (order.shipping_address?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      const normalizedStatus = order.status?.toUpperCase();
      const matchesStatus = statusFilter === "ALL" || normalizedStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  // --- LOGIC HỦY ĐƠN HÀNG (ĐÃ SỬA) ---
  const handleCancelOrder = async (orderId: any, userId: any) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) {
      return;
    }

    try {
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          status: 'CANCELLED',
          payment_status: 'UNPAID'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Cập nhật trực tiếp vào mảng orders để UI thay đổi ngay lập tức
        setOrders((prevOrders) => 
          prevOrders.map((order) => 
            order.id === orderId 
              ? { ...order, status: 'CANCELLED', payment_status: 'UNPAID' } 
              : order
          )
        );
        alert("Đã hủy đơn hàng thành công!");
      } else {
        alert(data.message || "Có lỗi xảy ra khi hủy đơn hàng.");
      }
    } catch (error) {
      console.error("Lỗi kết nối:", error);
      alert("Không thể kết nối đến máy chủ.");
    }
  };

  // --- UI COMPONENTS ---
  const statIcons = {
    ALL: Package,
    PENDING: Clock,
    SHIPPING: Truck,
    COMPLETED: CheckCircle,
    CANCELLED: XCircle
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
        <p className="text-gray-500 font-medium">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (!isLoggedIn) return <div className="p-10 text-center text-gray-500">Vui lòng đăng nhập để xem đơn hàng.</div>;

  return (
    <div className="min-h-screen bg-gray-50/50 py-8 px-4 sm:px-6 mt-15">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* 1. HEADER & TITLE */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Lịch sử đơn hàng</h1>
            <p className="text-gray-500 mt-1">Quản lý và theo dõi trạng thái các đơn hàng của bạn.</p>
          </div>
        </div>

        {/* 2. STATS DASHBOARD */}
        {orders.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* Tổng đơn */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
              <div className="p-3 bg-gray-100 rounded-xl text-gray-600"><Package size={24} /></div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Tổng đơn</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
            </div>
            {/* Các trạng thái chính */}
            {[ORDER_STATUS.PENDING,ORDER_STATUS.SHIPPING, ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED].map(st => {
              const count = orders.filter(o => o.status?.toUpperCase() === st.code).length;
              const Icon = statIcons[st.code as keyof typeof statIcons] || Package;

              return (
                <div key={st.code} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
                  <div className="p-3 rounded-xl" style={{ backgroundColor: `${st.color}15`, color: st.color }}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">{st.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 3. TOOLBAR */}
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo mã đơn hoặc địa chỉ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-sm transition-all"
            />
          </div>

          <div className="flex overflow-x-auto pb-2 scrollbar-hide gap-2">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all ${statusFilter === "ALL"
                ? "bg-gray-900 text-white shadow-md"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
            >
              Tất cả
            </button>
            {ORDER_STATUS_LIST.map((statusConfig) => (
              <button
                key={statusConfig.code}
                onClick={() => setStatusFilter(statusConfig.code)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all border ${statusFilter === statusConfig.code
                  ? "shadow-md scale-105"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                style={statusFilter === statusConfig.code ? {
                  backgroundColor: statusConfig.color,
                  borderColor: statusConfig.color,
                  color: 'white'
                } : {}}
              >
                {statusConfig.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4. ORDERS LIST */}
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Không tìm thấy đơn hàng</h3>
            <p className="text-gray-500 max-w-xs text-center mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn.</p>
          </div>
        ) : (
          <div className="grid gap-5">
            {filteredOrders.map((order) => {
              const currentStatus = getStatusConfig(order.status);

              return (
                <div
                  key={order.id}
                  className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-emerald-100 transition-all duration-300 overflow-hidden"
                >
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-6 pb-6 border-b border-gray-50">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
                          <Package size={24} />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-bold text-gray-900 text-lg">{order.order_code}</h3>
                            {getStatusBadge(order.status)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar size={14} />
                            <span>Đặt ngày {formatDate(order.created_at)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Tổng thành tiền</p>
                        <p className="text-xl font-bold text-emerald-600">
                          {Number(order.amount).toLocaleString("vi-VN")} ₫
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-6 mb-6">
                      <div className="flex-1 flex gap-3">
                        <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-1">Địa chỉ nhận hàng</p>
                          <p className="text-sm text-gray-600 leading-relaxed">{order.shipping_address || "Chưa cập nhật"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                      {/* --- NÚT HỦY ĐƠN HÀNG ĐÃ SỬA --- */}
                      {currentStatus.code === 'PENDING' && order.payment_method === "cod" && (
                        <button
                          onClick={() => user?.id && handleCancelOrder(order.id, user.id)}
                          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
                        >
                          Hủy đơn hàng
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all active:scale-95"
                      >
                        Chi tiết <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
}