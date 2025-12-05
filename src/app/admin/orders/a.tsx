// "use client";

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { Order } from "@/types/order";
// import InvoiceList from "@/components/admin/orders/InvoiceList";
// import InvoiceModal from "@/components/admin/orders/InvoiceModal";

// export default function InvoiceReviewPage() {
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [selected, setSelected] = useState<Order | null>(null);

//   useEffect(() => {
//     (async () => {
//       setLoading(true);
//       try {
//         const res = await axios.get<{ success: boolean; orders: Order[] }>("/api/admin/orders", {
//           withCredentials: true,
//         });
//         if (res.data.success) setOrders(res.data.orders);
//       } catch (err) {
//         console.error("⚠️ Lỗi tải đơn hàng:", err);
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, []);

//   const handleOrderUpdate = (updatedOrder: Order) => {
//     setOrders((prev) =>
//       prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
//     );
//     // Nếu đang mở modal của đơn này thì cập nhật luôn data trong modal
//     if (selected?.id === updatedOrder.id) {
//       setSelected(updatedOrder);
//     }
//   };

//   async function confirmOrderStatus(order: Order) {
//     await axios.put(`/api/admin/orders/${order.id}/status`, {
//       status: "processing"
//     });
//     handleOrderUpdate({ ...order, status: 'processing' });
//     setOrders(prev =>
//       prev.map(o =>
//         o.id === order.id ? { ...o, status: "processing" } : o
//       )
//     );
//   }

//   async function cancelOrderStatus(order: Order) {
//     await axios.put(`/api/admin/orders/${order.id}/status`, {
//       status: "cancelled"
//     });
//     handleOrderUpdate({ ...order, status: 'cancelled' });
//     setOrders(prev =>
//       prev.map(o =>
//         o.id === order.id ? { ...o, status: "cancelled" } : o
//       )
//     );
//   }

//   if (loading)
//     return (
//       <div className="text-center py-20 text-gray-500 text-lg animate-pulse">
//         Đang tải danh sách đơn hàng...
//       </div>
//     );

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <h1 className="text-3xl font-bold mb-8 text-gray-800">📦 Quản lý đơn hàng</h1>

//       <InvoiceList
//         orders={orders}
//         onSelect={(order) => setSelected(order)}
//         onConfirm={(order) => confirmOrderStatus(order)}
//         onCancel={(order) => cancelOrderStatus(order)}
//       />

//       {
//         selected && <InvoiceModal
//           order={selected}
//           onClose={() => setSelected(null)}
//           // onUpdate={handleOrderUpdate}
//         />
//       }
//     </div>
//   );
// }
