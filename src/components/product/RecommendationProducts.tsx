// app/components/product/RecommendationProducts.tsx
"use client";

import ProductCard from "@/components/product/ProductCard";
import { Product } from "@/types/product";
import { useState, useEffect } from "react";
import axios from "axios";

export default function RecommendationProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        // Gọi API lấy sản phẩm
        const res = await axios.get<Product[]>("/api/products");

        const top10 = res.data.slice(0, 10);
        setProducts(top10);
      } catch (err) {
        console.error("Lỗi khi tải sản phẩm đề xuất:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return (
    <section className="w-full bg-white py-14">
      <div className="max-w-[1700px] mx-auto px-6 space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-wide text-gray-900">
            Sản phẩm đề xuất
          </h2>
        </div>

        {/* {loading ? (
          <p className="text-gray-600">Đang tải...</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-7">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )} */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-7">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
