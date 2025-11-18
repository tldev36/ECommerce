"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  image: string;
  price: string;
  slug: string;
}

export default function ProductDetailRecommendations({ productId }: { productId: number }) {
  const [similar, setSimilar] = useState<Product[]>([]);
  const [alsoBought, setAlsoBought] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;

    const fetchRecommendations = async () => {
      try {
        const res = await axios.get<any>(`/api/recommendations/product/${productId}`);
        setSimilar(res.data.similarProducts || []);
        setAlsoBought(res.data.alsoBoughtProducts || []);
      } catch (error) {
        console.error("Lỗi khi tải gợi ý sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [productId]);

  if (loading) return <p className="mt-10 text-gray-500 text-center">Đang tải gợi ý sản phẩm...</p>;
  if (!similar.length && !alsoBought.length) return null;

  const renderProducts = (products: Product[]) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {products.map((p) => (
        <Link
          key={p.id}
          href={`/products/${p.slug}`}
          className="bg-white rounded-xl hover:shadow-xl hover:scale-105 transition-transform duration-200 p-3 flex flex-col"
        >
          <div className="relative w-full aspect-square mb-3">
            <Image
              src={`/images/products/${p.image}`}
              alt={p.name}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover rounded-md"
            />
          </div>
          <h3 className="text-sm font-semibold text-gray-800 truncate mb-1">{p.name}</h3>
          <p className="text-green-600 font-bold text-base">
            {Number(p.price).toLocaleString("vi-VN")}₫
          </p>
        </Link>
      ))}
    </div>
  );

  return (
    <section className="max-w-[1400px] mx-auto px-6 py-12 space-y-12">
      {similar.length > 0 && (
        <div>
          <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-2">
            🧺 Sản phẩm tương tự
          </h2>
          {renderProducts(similar)}
        </div>
      )}

      {alsoBought.length > 0 && (
        <div>
          <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-2">
            🛒 Người mua sản phẩm này cũng mua
          </h2>
          {renderProducts(alsoBought)}
        </div>
      )}
    </section>
  );
}
