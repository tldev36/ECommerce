"use client";

import React, { useState } from "react";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Search,
  Eye,
  FileSpreadsheet,
  Calendar,
  Filter,
} from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { OrderRow } from "@/types";
import OrderDetailModal from "@/components/admin/OrderDetailModal"; // Uncomment khi cần dùng

interface OrdersTableProps {
  ordersList: OrderRow[];
  loading: boolean;
  page: number;
  perPage: number;
  totalOrdersCount: number;
  search: string;
  onSearchChange: (value: string) => void;
  onView?: (order: any) => void;
  onPageChange: (page: number) => void;
}

export default function OrdersTable({
  ordersList = [],
  loading,
  page,
  perPage,
  totalOrdersCount,
  search = "",
  onSearchChange,
  onView,
  onPageChange,
}: OrdersTableProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // Tính toán số trang
  const totalPages = Math.max(1, Math.ceil(totalOrdersCount / perPage));

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);

  const formatDate = (v: string) =>
    new Date(v).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = ordersList.map((o, i) => ({
        STT: (page - 1) * perPage + i + 1,
        "Mã đơn": o.order_code,
        "Ngày tạo": formatDate(o.created_at),
        "Tổng tiền": o.amount,
        // "Trạng thái": o.status, // Thêm trạng thái vào excel nếu cần
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "DanhSachDonHang");

      const file = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      saveAs(new Blob([file]), `BaoCao_DonHang_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (error) {
      console.error(error);
      alert("Xuất Excel thất bại!");
    }
    setIsExporting(false);
  };

  return (
    <div className="space-y-6">
      {/* --- Toolbar Section --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
        
        {/* Search Box */}
        <div className="relative w-full sm:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo mã đơn, SĐT..."
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 sm:text-sm transition duration-200"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
           
            {/* Export Button */}
            <button
                onClick={handleExport}
                disabled={ordersList.length === 0 || isExporting}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            >
                {isExporting ? <Loader2 className="animate-spin w-4 h-4" /> : <FileSpreadsheet className="w-4 h-4" />}
                Xuất Excel
            </button>
        </div>
      </div>

      {/* --- Table Section --- */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4 text-center w-16">STT</th>
                <th className="px-6 py-4">Mã đơn hàng</th>
                <th className="px-6 py-4">Ngày tạo</th>
                <th className="px-6 py-4 text-right">Tổng tiền</th>
                <th className="px-6 py-4 text-center">Thao tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        <span className="text-sm text-gray-500">Đang tải dữ liệu...</span>
                    </div>
                  </td>
                </tr>
              ) : ordersList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                        <FileSpreadsheet className="w-8 h-8 text-gray-300" />
                        <span>Không tìm thấy đơn hàng nào</span>
                    </div>
                  </td>
                </tr>
              ) : (
                ordersList.map((o, i) => (
                  <tr 
                    key={o.id} 
                    className="hover:bg-gray-50/80 transition-colors duration-150 group"
                  >
                    <td className="px-6 py-4 text-center text-sm text-gray-500">
                      {(page - 1) * perPage + i + 1}
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-100 group-hover:border-blue-200 transition-colors">
                            {o.order_code}
                        </span>
                      </div>
                      {/* Uncomment nếu muốn hiện tên khách hàng dưới mã đơn */}
                      {/* <div className="text-xs text-gray-500 mt-1">{o.customer || "Khách lẻ"}</div> */}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {formatDate(o.created_at)}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-bold text-emerald-600">
                        {formatCurrency(o.amount)}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* --- Pagination Section --- */}
        {!loading && ordersList.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm text-gray-500">
              Hiển thị <span className="font-medium text-gray-900">{ordersList.length}</span> trên tổng số <span className="font-medium text-gray-900">{totalOrdersCount}</span> đơn hàng
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                className="p-2 border border-gray-300 rounded-lg hover:bg-white hover:text-blue-600 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-400 transition bg-white text-gray-500 shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-lg shadow-sm min-w-[3rem] text-center">
                {page}
              </span>

              <button
                disabled={page * perPage >= totalOrdersCount}
                onClick={() => onPageChange(page + 1)}
                className="p-2 border border-gray-300 rounded-lg hover:bg-white hover:text-blue-600 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-400 transition bg-white text-gray-500 shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Detail (Uncomment khi cần) */}
      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
}