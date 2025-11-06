import React from "react";
import { Order } from "@/types/order";
import InvoiceCard from "./InvoiceCard";

interface Props {
  orders: Order[];
  onSelect: (order: Order) => void;
}

export default function InvoiceList({ orders, onSelect }: Props) {
  if (orders.length === 0)
    return <p className="text-gray-500 text-center text-lg">Không có đơn hàng nào.</p>;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {orders.map((order) => (
        <InvoiceCard key={order.id} order={order} onClick={() => onSelect(order)} />
      ))}
    </div>
  );
}
