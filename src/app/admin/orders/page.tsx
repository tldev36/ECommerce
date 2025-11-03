"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { OrderDTO } from "@/types/dto";

export default function InvoiceReviewPage() {
  const [invoices, setInvoices] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<OrderDTO | null>(null);

  const fmt = (v: number) => v.toLocaleString("vi-VN") + "₫";
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

  // 🧩 Fetch orders từ backend
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await axios.get<{ success: boolean; orders: any[] }>("/api/admin/orders", { withCredentials: true });
        if (res.data.success) {
          const mapped: OrderDTO[] = res.data.orders.map((o: any) => ({
            id: Number(o.id),
            order_code: o.order_code,
            total_amount: Number(o.amount ?? 0),
            payment_method: o.payment_method ?? "cod",
            status: o.status ?? "pending",
            created_at: o.created_at ?? "",
            updated_at: o.updated_at ?? "",
            shipping_address: o.shipping_address ?? "",
            ship_amount: Number(o.ship_amount ?? 0),
            coupon_amount: o.coupon_amount ? Number(o.coupon_amount) : undefined,
            order_items: (o.order_items ?? []).map((i: any) => ({
              id: Number(i.id),
              product_id: Number(i.product_id),
              quantity: Number(i.quantity ?? 0),
              price: Number(i.price ?? 0),
              total_price: Number(i.total_price ?? 0),
              product: {
                id: Number(i.product?.id ?? 0),
                name: i.product?.name ?? "Sản phẩm",
                image: i.product?.image ?? null,
              },
            })),
          }));
          setInvoices(mapped);
        }
      } catch (err) {
        console.error("⚠️ Lỗi tải đơn hàng:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="text-center py-10 text-gray-500">Đang tải đơn hàng...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6">Danh sách hóa đơn</h1>
      {invoices.length === 0 ? (
        <p className="text-gray-500">Không có đơn hàng nào.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {invoices.map((inv) => (
            <div
              key={inv.order_code}
              className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition cursor-pointer"
              onClick={() => setSelected(inv)}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-mono font-semibold">{inv.order_code}</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    inv.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : inv.status === "approved"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {inv.status === "pending"
                    ? "Chờ duyệt"
                    : inv.status === "approved"
                    ? "Đã duyệt"
                    : "Từ chối"}
                </span>
              </div>
              <div className="text-gray-700 mb-1">
                Khách: <span className="font-medium">{inv.shipping_address || "-"}</span>
              </div>
              <div className="text-gray-700 mb-1">
                Tổng: <span className="font-semibold text-green-700">{fmt(inv.total_amount)}</span>
              </div>
              <div className="text-gray-500 text-sm">
                Ngày: {formatDate(inv.created_at)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chi tiết đơn hàng khi chọn */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl p-6 relative">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl"
              onClick={() => setSelected(null)}
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold mb-4">Chi tiết đơn hàng</h2>
            <p className="mb-2">
              Mã đơn: <span className="font-mono font-semibold">{selected.order_code}</span>
            </p>
            <p className="mb-2">
              Địa chỉ giao hàng: <span className="font-medium">{selected.shipping_address}</span>
            </p>
            <p className="mb-4">
              Tổng tiền: <span className="font-semibold text-green-700">{fmt(selected.total_amount)}</span>
            </p>

            <h3 className="text-lg font-semibold mb-2">Sản phẩm</h3>
            <div className="divide-y border rounded-lg mb-4">
              {selected.order_items.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-3 text-sm">
                  <div className="flex items-center gap-3">
                    {item.product.image && (
                      <img
                        src={`/images/products/${item.product.image}`}
                        alt={item.product.name}
                        className="w-10 h-10 object-cover rounded-md border"
                      />
                    )}
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-gray-500 text-xs">SL: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-semibold text-green-700">
                    {fmt(item.total_price)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
