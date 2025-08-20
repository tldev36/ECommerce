"use client";

import { useCart } from "@/context/CartContext";

export default function ProductCard({ product }: any) {
  const { addItem } = useCart();

  return (
    <button onClick={() => addItem(product)}>Thêm vào giỏ</button>
  );
}
