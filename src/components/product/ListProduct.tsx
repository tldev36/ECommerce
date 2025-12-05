"use client";

import { useState, useEffect } from "react";
import ProductCard from "@/components/product/ProductCard";
import FloatingButtons from "@/components/layout/FloatingButtons";
import { Product } from "@/types/product";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface ListProductProps {
  slug?: string;
}

function removeVietnameseTones(str: string) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // bỏ dấu
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}


export default function ListProduct({ slug }: ListProductProps) {

  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string; slug: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(slug || "tat-ca");

  const [search, setSearch] = useState("");



  // Lấy search từ URL khi param thay đổi
  useEffect(() => {
    const q = searchParams?.get("search") || "";
    setSearch(q.toLowerCase());
  }, [searchParams]);

  // const filteredProducts =
  //   selectedCategory === "tat-ca"
  //     ? products
  //     : products.filter((p) => p.categories?.slug === selectedCategory);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          axios.get<Product[]>("/api/products"),
          axios.get<{ id: number; name: string; slug: string }[]>("/api/categories"),
        ]);

        setProducts(prodRes.data);
        setCategories([{ id: 0, name: "Tất cả", slug: "tat-ca" }, ...catRes.data]);
      } catch (err) {
        console.error("Lỗi khi fetch dữ liệu:", err);
      }
    };
    fetchData();
  }, []);

  const handleCategoryChange = (catSlug: string) => {
    setSelectedCategory(catSlug);

    const params = new URLSearchParams(window.location.search);
    params.delete("search");
    window.history.replaceState({}, "", `${window.location.pathname}`);
  };

  const filteredProducts = products.filter((p) => {
    const matchCategory =
      selectedCategory === "tat-ca" ||
      p.categories?.slug === selectedCategory;

    const normalizedName = removeVietnameseTones(p.name);
    const normalizedSearch = removeVietnameseTones(search);

    // Nếu không nhập search → chỉ lọc theo category
    if (!normalizedSearch.trim()) return matchCategory;

    // Nếu có search → lọc theo cả 2
    return matchCategory && normalizedName.includes(normalizedSearch);
  });

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
                <li key={cat.id}>
                  <label className="inline-flex items-center cursor-pointer mb-2">
                    <input
                      type="radio"
                      name="category"
                      value={cat.slug}
                      checked={selectedCategory === cat.slug}
                      onChange={() => handleCategoryChange(cat.slug)}
                      className="form-radio text-green-600"
                    />
                    <span className="ml-2 text-gray-700">{cat.name}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Danh sách sản phẩm */}
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
