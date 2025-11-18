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

  if (loading) return <p className="mt-10 text-gray-500">Đang tải gợi ý sản phẩm...</p>;

  if (!similar.length && !alsoBought.length) return null;

  return (
    <div className="mt-12 space-y-10">
      {similar.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4">🧺 Sản phẩm tương tự</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {similar.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.slug}`}
                className="border rounded-xl p-3 bg-white hover:shadow-lg transition"
              >
                <div className="relative w-full aspect-square mb-2">
                  <Image
                    src={`/images/products/${p.image}`}
                    alt={p.name}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
                <h3 className="text-sm font-semibold truncate">{p.name}</h3>
                <p className="text-green-600 font-medium">
                  {Number(p.price).toLocaleString("vi-VN")}₫
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {alsoBought.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4">🛒 Người mua sản phẩm này cũng mua...</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {alsoBought.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.slug}`}
                className="border rounded-xl p-3 bg-white hover:shadow-lg transition"
              >
                <div className="relative w-full aspect-square mb-2">
                  <Image
                    src={`/images/products/${p.image}`}
                    alt={p.name}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
                <h3 className="text-sm font-semibold truncate">{p.name}</h3>
                <p className="text-green-600 font-medium">
                  {Number(p.price).toLocaleString("vi-VN")}₫
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
