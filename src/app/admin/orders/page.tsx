"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Order } from "@/types/order";
import InvoiceList from "@/components/admin/orders/InvoiceList";
import InvoiceModal from "@/components/admin/orders/InvoiceModal";

export default function InvoiceReviewPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Order | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await axios.get<{ success: boolean; orders: Order[] }>("/api/admin/orders", {
          withCredentials: true,
        });
        console.log(res.data);
        if (res.data.success) setOrders(res.data.orders);
      } catch (err) {
        console.error("⚠️ Lỗi tải đơn hàng:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleUpdateStatus(orderId: number, newStatus: string, paymentStatus: string) {
    try {

      console.log("Dữ liệu gửi đi:", { orderId, newStatus, paymentStatus });
      // Gọi API cập nhật (dùng API update-status mới mà ta đã viết)
      const res = await axios.put<{ success: boolean }>(`/api/admin/orders/update-status`, {
        orderId: orderId,
        newStatus: newStatus,
        paymentStatus: paymentStatus
      });

      if (res.data.success) {
        // Cập nhật State danh sách
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        // toast.success(`Đã cập nhật sang: ${newStatus}`);
      }
    } catch (err) {
      console.error(err);
      // toast.error("Lỗi cập nhật trạng thái");
    }
  }

  // Hàm hủy riêng vì cần confirm đặc biệt
  async function handleCancelOrder(orderId: number) {
    if (!confirm("Hủy đơn này sẽ hoàn lại kho?")) return;
    handleUpdateStatus(orderId, 'CANCELLED', 'UNPAID');
  }

  if (loading)
    return (
      <div className="text-center py-20 text-gray-500 text-lg animate-pulse">
        Đang tải danh sách đơn hàng...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">📦 Quản lý đơn hàng</h1>

      <InvoiceList
        orders={orders}
        onSelect={(order) => setSelected(order)}
        onUpdateStatus={handleUpdateStatus} 
        onCancel={handleCancelOrder}
      />

      {
        selected && <InvoiceModal
          order={selected}
          onClose={() => setSelected(null)}
          // onUpdate={handleOrderUpdate}
        />
      }
    </div>
  );
}
