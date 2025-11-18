"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

interface Product {
  id: number;
  name: string;
  slug: string;
  price: string;
  image: string;
}

export default function CartRecommendations() {
  const { cart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!cart || cart.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        const ids = cart.map((item) => item.id);
        const res = await axios.post<any>("/api/recommendations/cart", {
          cartProductIds: ids,
        });
        setProducts(res.data);
      } catch (err) {
        console.error("Error loading cart recommendations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [cart]);

  if (loading) return <p className="text-center mt-4">Đang tải gợi ý cho bạn...</p>;
  if (!products.length) return null;

  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold mb-4">🛍️ Bạn có thể cần thêm...</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {products.map((p) => (
          <Link
            key={p.id}
            href={`/products/${p.slug}`}
            className="bg-white border rounded-2xl p-3 hover:shadow-lg transition"
          >
            <div className="relative w-full aspect-square mb-2">
              <Image
                src={`/images/products/${p.image}`}
                alt={p.name}
                fill
                className="object-cover rounded-md"
              />
            </div>
            <h3 className="text-sm font-medium truncate">{p.name}</h3>
            <p className="text-green-600 font-semibold mt-1">
              {Number(p.price).toLocaleString("vi-VN")}₫
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
