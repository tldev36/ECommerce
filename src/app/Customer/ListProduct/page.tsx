"use client";

import { useState } from "react";
import ProductCard from "@/components/product/ProductCard";
import { products } from "@/data/products"; // Giả sử bạn có file này
import FloatingButtons from "@/components/layout/FloatingButtons";

const categories = ["Tất cả", "Phân bón", "Hạt giống", "Gạo"];

export default function ListProduct() {
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");

  // Lọc sản phẩm theo category
  const filteredProducts =
    selectedCategory === "Tất cả"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="container mx-auto px-6 pt-20 pb-10">
      <h1 className="text-3xl font-bold mb-6">Danh sách sản phẩm</h1>

      <div className="flex gap-8">
        {/* Bộ lọc bên trái */}
        <aside className="w-60 sticky top-24 self-start border border-gray-200 rounded-md p-4 shadow-sm h-fit bg-white">
          <h2 className="text-xl font-semibold mb-4">Bộ lọc</h2>
          <div>
            <h3 className="font-medium mb-2">Danh mục</h3>
            <ul>
              {categories.map((cat) => (
                <li key={cat}>
                  <label className="inline-flex items-center cursor-pointer mb-2">
                    <input
                      type="radio"
                      name="category"
                      value={cat}
                      checked={selectedCategory === cat}
                      onChange={() => setSelectedCategory(cat)}
                      className="form-radio text-green-600"
                    />
                    <span className="ml-2 text-gray-700">{cat}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Danh sách sản phẩm bên phải */}
        <section className="flex-1">
          {filteredProducts.length === 0 ? (
            <p className="text-gray-600">Không có sản phẩm phù hợp.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>
      <FloatingButtons />
    </div>
  );
}
