"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import OrderDetailModal from "@/components/OrderDetailModal";
import { Order } from "@/types/order";
import { useCart } from "@/context/CartContext";
import { Search, Package, Calendar, MapPin, DollarSign, Filter, ChevronDown } from "lucide-react";

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const { user, isLoggedIn } = useCart();

  useEffect(() => {
    console.log("=== CART PAGE DEBUG ===");
    console.log("isLoggedIn:", isLoggedIn);
    console.log("user:", user);
  }, [isLoggedIn, user]);

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

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      { label: string; color: string; bg: string; icon: string }
    > = {
      pending: { label: "Đang xử lý", color: "text-amber-700", bg: "bg-amber-50 border-amber-200", icon: "⏳" },
      processing: { label: "Đang xử lý", color: "text-amber-700", bg: "bg-amber-50 border-amber-200", icon: "⏳" },
      delivered: { label: "Đã giao", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", icon: "✓" },
      completed: { label: "Đã giao", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", icon: "✓" },
      cancelled: { label: "Đã hủy", color: "text-rose-700", bg: "bg-rose-50 border-rose-200", icon: "✕" },
    };

    const style = statusMap[status] || {
      label: status,
      color: "text-gray-700",
      bg: "bg-gray-50 border-gray-200",
      icon: "•",
    };

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${style.bg} ${style.color}`}
      >
        <span>{style.icon}</span>
        {style.label}
      </span>
    );
  };


  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatAddress = (addressString?: string) => {
    if (!addressString) return "Chưa có địa chỉ";
    return addressString.split("-").slice(0, 2).join(", ");
  };



  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.shipping_address?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center h-96">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
              <Package className="w-6 h-6 text-green-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="mt-6 text-gray-600 font-medium animate-pulse">Đang tải đơn hàng của bạn...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Vui lòng đăng nhập</h2>
            <p className="text-gray-600 mb-8">Đăng nhập để xem lịch sử đơn hàng của bạn</p>
            <a
              href="/login"
              className="inline-block px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Đăng nhập ngay
            </a>
          </div>
        </div>
      </div>
    );
  }

  


  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8 px-4">
      <div className="max-w-7xl mx-auto mt-15">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Đơn hàng của tôi</h1>
              <p className="text-gray-600">Quản lý và theo dõi đơn hàng của bạn</p>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        {orders.length > 0 && (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo mã đơn, địa chỉ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-6 py-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-all"
              >
                <Filter className="w-5 h-5" />
                Lọc
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
              </button>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Tất cả", value: "all" },
                    { label: "Đang xử lý", value: "pending" },
                    { label: "Đã giao", value: "completed" },
                    { label: "Đã hủy", value: "cancelled" },
                  ].map(({ label, value }) => (
                    <button
                      key={value}
                      onClick={() => setStatusFilter(value)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${statusFilter === value
                        ? "bg-green-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Orders */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              {searchTerm || statusFilter !== "all" ? "Không tìm thấy đơn hàng" : "Chưa có đơn hàng"}
            </h2>
            <p className="text-gray-600 mb-8">
              {searchTerm || statusFilter !== "all"
                ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                : "Hãy bắt đầu mua sắm và tận hưởng ưu đãi ngay hôm nay"}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <a
                href="/products"
                className="inline-block px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Khám phá sản phẩm
              </a>
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">{order.order_code}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          {formatDate(order.created_at)}
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  {/* Details Grid */}
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {/* Amount */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <DollarSign className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Tổng tiền</p>
                        <p className="text-xl font-bold text-emerald-600">
                          {Number(order.amount).toLocaleString("vi-VN")} ₫
                        </p>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Địa chỉ giao hàng</p>
                        <p className="text-gray-800 font-medium">{formatAddress(order.shipping_address)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg transform group-hover:-translate-y-0.5"
                  >
                    Xem chi tiết đơn hàng
                  </button>

                  {/* Cancel Order Button */}
                  {(order.status === "pending" || order.status === "processing") && (
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      className="w-full mt-3 py-3 bg-gradient-to-r from-rose-600 to-red-600 text-white rounded-lg font-semibold hover:from-rose-700 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      Hủy đơn hàng
                    </button>
                  )}

                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        {orders.length > 0 && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 text-center">
              <p className="text-2xl font-bold text-gray-800">{orders.length}</p>
              <p className="text-sm text-gray-600">Tổng đơn</p>
            </div>
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 text-center">
              <p className="text-2xl font-bold text-amber-600">
                {orders.filter((o) => o.status === "Đang xử lý" || o.status === "pending").length}
              </p>
              <p className="text-sm text-gray-600">Đang xử lý</p>
            </div>
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 text-center">
              <p className="text-2xl font-bold text-emerald-600">
                {orders.filter((o) => o.status === "Đã giao" || o.status === "completed").length}
              </p>
              <p className="text-sm text-gray-600">Đã giao</p>
            </div>
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 text-center">
              <p className="text-2xl font-bold text-rose-600">
                {orders.filter((o) => o.status === "Đã hủy" || o.status === "cancelled").length}
              </p>
              <p className="text-sm text-gray-600">Đã hủy</p>
            </div>
          </div>
        )}


      </div>



      {/* Modal */}
      <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
}