"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "@/components/product/ProductCard";
import { Product } from "@/types/product";

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

  if (loading)
    return <p className="mt-10 text-gray-500 text-center">Đang tải gợi ý sản phẩm...</p>;
  if (!similar.length && !alsoBought.length) return null;

  const renderProducts = (products: Product[]) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );

  return (
    <section className="max-w-[1400px] mx-auto px-6 py-12 space-y-12">
      {similar.length > 0 && (
        <div>
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            🧺 Sản phẩm tương tự
          </h2>
          {renderProducts(similar)}
        </div>
      )}

      {/* Nếu bạn cần thì bật phần này lên */}
      {/* {alsoBought.length > 0 && (
        <div>
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            🛒 Người mua sản phẩm này cũng mua
          </h2>
          {renderProducts(alsoBought)}
        </div>
      )} */}
    </section>
  );
}
