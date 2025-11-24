"use client";
import { useState, useMemo } from "react";
import InvoiceCard from "./InvoiceCard";
import { Search } from "lucide-react";

export default function OrdersPage({
  orders,
  onSelect,
}: {
  orders: any[]; onSelect: (order: any) => void
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  // ✅ Lọc theo tìm kiếm
  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const text = search.toLowerCase();
      return (
        o.order_code.toLowerCase().includes(text) ||
        o.to_name?.toLowerCase().includes(text) ||
        o.shipping_address?.toLowerCase().includes(text) ||
        o.status?.toLowerCase().includes(text)
      );
    });
  }, [search, orders]);

  // ✅ Cắt theo phân trang
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / pageSize);

  return (
    <div className="space-y-6">

      {/* ✅ Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1); // reset về trang 1 khi tìm kiếm
          }}
          placeholder="Tìm kiếm đơn hàng..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      {/* ✅ Order List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paginated.map((order, idx) => (
          <InvoiceCard
            key={order.order_code}
            order={order}
            index={(page - 1) * pageSize + idx + 1}
            onClick={() => { }}
            onConfirm={() => { }}
          />
        ))}
      </div>

      {/* ✅ Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 rounded-lg border disabled:opacity-40"
          >
            Trước
          </button>

          <span className="text-sm font-medium">
            Trang {page} / {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 rounded-lg border disabled:opacity-40"
          >
            Tiếp
          </button>
        </div>
      )}
    </div>
  );
}
