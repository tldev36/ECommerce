"use client";

import { useState, useMemo } from "react";
import { 
  Search, Eye, CheckCircle, XCircle, 
  ChevronLeft, ChevronRight, Filter, 
  Calendar, MapPin, Package, Truck, PackageCheck, AlertCircle, Box
} from "lucide-react";
import { Order } from "@/types/order";
// Import Config
import { ORDER_STATUS, ORDER_STATUS_LIST } from "@/config/order-status.config";

interface InvoiceListProps {
  orders: Order[];
  onSelect: (order: Order) => void;
  onUpdateStatus: (orderId: number, newStatus: string, paymentStatus: string) => void;
  onCancel: (orderId: number) => void;
}

export default function InvoiceList({
  orders,
  onSelect,
  onUpdateStatus,
  onCancel,
}: InvoiceListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // State lọc
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // 1. Helper lấy config
  const getStatusConfig = (status: string) => {
    const normalized = status?.toUpperCase();
    return ORDER_STATUS[normalized as keyof typeof ORDER_STATUS] || ORDER_STATUS.PENDING;
  };

  // 2. Logic lọc dữ liệu
  const filtered = useMemo(() => {
    const text = search.toLowerCase();
    
    return orders.filter((o) => {
      // Điều kiện tìm kiếm text
      const matchesSearch = 
        o.order_code.toLowerCase().includes(text) ||
        o.shipping_address?.toLowerCase().includes(text) ||
        getStatusConfig(o.status).label.toLowerCase().includes(text);

      // Điều kiện lọc trạng thái
      const normalizedStatus = o.status?.toUpperCase();
      const matchesStatus = statusFilter === "ALL" || normalizedStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  // 3. Phân trang
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const formatCurrency = (amount: number) => Number(amount).toLocaleString("vi-VN") + "₫";

  const renderStatusBadge = (status: string) => {
    const config = getStatusConfig(status);
    return (
      <span
        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border shadow-sm whitespace-nowrap"
        style={{
          color: config.color,
          backgroundColor: `${config.color}15`,
          borderColor: `${config.color}30`,
        }}
      >
        {config.label}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* --- FILTER TABS (Thanh lọc trạng thái) --- */}
      <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
        <button
          onClick={() => { setStatusFilter("ALL"); setPage(1); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap border ${
            statusFilter === "ALL"
              ? "bg-gray-800 text-white border-gray-800 shadow-md"
              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
          }`}
        >
          Tất cả
        </button>
        {ORDER_STATUS_LIST.map((status) => (
          <button
            key={status.code}
            onClick={() => { setStatusFilter(status.code); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap border ${
              statusFilter === status.code
                ? "shadow-md ring-1 ring-offset-1"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
            style={
              statusFilter === status.code
                ? {
                    backgroundColor: `${status.color}15`,
                    color: status.color,
                    borderColor: status.color,
                    boxShadow: `0 2px 4px ${status.color}20`
                  }
                : {}
            }
          >
            {status.label}
            <span className="ml-2 text-xs opacity-70 bg-black/5 px-1.5 py-0.5 rounded-full font-bold">
               {orders.filter(o => o.status?.toUpperCase() === status.code).length}
            </span>
          </button>
        ))}
      </div>

      {/* --- MAIN CARD --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
        
        {/* Toolbar: Tìm kiếm */}
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50 rounded-t-xl">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Tìm theo mã đơn, địa chỉ..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all shadow-sm"
            />
          </div>
          <div className="text-sm text-gray-500 font-medium">
            Hiển thị <span className="font-bold text-gray-900">{paginated.length}</span> / {filtered.length} đơn hàng
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
              <tr>
                <th className="py-4 px-6 whitespace-nowrap">Mã đơn / Ngày</th>
                <th className="py-4 px-6">Khách hàng / Địa chỉ</th>
                <th className="py-4 px-6">Tổng tiền</th>
                <th className="py-4 px-6 text-center">Trạng thái</th>
                <th className="py-4 px-6 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.map((order) => {
                const config = getStatusConfig(order.status);
                
                // Tách địa chỉ
                const addressParts = order.shipping_address?.split('-') || [];
                const customerName = addressParts[0] || "Khách lẻ";
                const addressDetail = addressParts.slice(1).join('-') || order.shipping_address;

                return (
                  <tr key={order.id} className="hover:bg-gray-50/80 transition-colors group">
                    
                    {/* Cột 1: Mã đơn */}
                    <td className="py-4 px-6 align-top">
                      <span className="font-bold text-gray-900 block mb-1 text-base">{order.order_code}</span>
                      <div className="flex items-center text-xs text-gray-400 gap-1.5">
                        <Calendar className="w-3 h-3" />
                        {new Date(order.created_at).toLocaleDateString("vi-VN")}
                        <span className="text-gray-300">|</span>
                        {new Date(order.created_at).toLocaleTimeString("vi-VN", {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </td>

                    {/* Cột 2: Khách hàng */}
                    <td className="py-4 px-6 align-top max-w-[280px]">
                      <div className="font-medium text-gray-800 truncate" title={customerName}>{customerName}</div>
                      <div className="flex items-start gap-1 mt-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                        <span className="truncate" title={addressDetail}>{addressDetail}</span>
                      </div>
                    </td>

                    {/* Cột 3: Tiền */}
                    <td className="py-4 px-6 align-middle font-bold text-emerald-600 text-base">
                      {formatCurrency(Number(order.amount))}
                    </td>

                    {/* Cột 4: Trạng thái */}
                    <td className="py-4 px-6 align-middle text-center">
                      {renderStatusBadge(order.status)}
                    </td>

                    {/* Cột 5: Hành động */}
                    <td className="py-4 px-6 align-middle text-right">
                      <div className="flex justify-end items-center gap-2 opacity-90 group-hover:opacity-100 transition-opacity">
                        
                        <button onClick={() => onSelect(order)} className="p-2 text-gray-500 bg-white border border-gray-200 hover:border-emerald-500 hover:text-emerald-600 rounded-lg transition-all shadow-sm tooltip" title="Xem chi tiết">
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Nút hành động nhanh dựa trên trạng thái */}
                        {config.code === 'PENDING' && (
                          <button onClick={() => { onUpdateStatus(order.id,'PROCESSING', order.payment_status); }} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors shadow-sm" title="Duyệt đơn hàng">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}

                        {/* {config.code === 'CONFIRMED' && (
                          <button onClick={() => { if (confirm(`Xác nhận duyệt đơn C ${order.order_code}?`)) onConfirm(order); }} className="p-2 text-sky-600 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors shadow-sm" title="Chuyển đóng gói">
                            <Box className="w-4 h-4" />
                          </button>
                        )} */}

                        {config.code === 'PROCESSING' && (
                          <button onClick={() => { onUpdateStatus(order.id,'SHIPPING', order.payment_status); }} className="p-2 text-purple-600 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors shadow-sm" title="Giao vận chuyển">
                            <Truck className="w-4 h-4" />
                          </button>
                        )}

                        {config.code === 'SHIPPING' && (
                          <button onClick={() => { onUpdateStatus(order.id ,'COMPLETED', order.payment_status); }} className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors shadow-sm" title="Hoàn tất đơn">
                            <PackageCheck className="w-4 h-4" />
                          </button>
                        )}



                        {/* Nút Hủy: Hiện khi chưa Hoàn thành và chưa Hủy */}
                        {config.code !== 'COMPLETED' && config.code !== 'CANCELLED' && (
                          <button onClick={() => { if (confirm(`Hủy đơn này?`)) onCancel(order.id); }} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors shadow-sm" title="Hủy đơn hàng">
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}

                      </div>
                    </td>
                  </tr>
                );
              })}

              {paginated.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400 bg-gray-50/30">
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-gray-100 p-3 rounded-full mb-3"><Filter className="w-6 h-6 text-gray-300" /></div>
                      <p>Không tìm thấy đơn hàng nào phù hợp</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- Pagination --- */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 flex justify-between items-center bg-gray-50 rounded-b-xl">
            <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm">
              <ChevronLeft className="w-4 h-4" /> Trước
            </button>
            <span className="text-sm font-medium text-gray-600">Trang <span className="font-bold text-gray-900">{page}</span> / {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm">
              Tiếp <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}