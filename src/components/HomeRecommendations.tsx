"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "@/components/product/ProductCard";
import { Product } from "@/types/product";

interface User {
  id: string;
  email: string;
  role?: string;
}
interface RecommendationResult {
  product: Product; // Sử dụng lại type Product đã import
  score: number;
}
// Type cho cấu trúc data mà API hybrid trả về
interface HybridApiResponse {
  user_id: number;
  recommendations: RecommendationResult[];
}

export default function HomeRecommendations() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // 🟢 1️⃣ Kiểm tra user đăng nhập
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await res.json();
        setUser(data?.user ?? null);
      } catch (err) {
        console.error("Lỗi khi lấy user:", err);
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  // 🟢 2️⃣ Lấy danh sách gợi ý (Đã sửa lỗi type-safe)
  useEffect(() => {
    const fetchRecommendations = async () => {
      // Chỉ fetch sau khi biết user là ai
      if (user === undefined) return;

      try {
        setLoading(true);
        let productsData: Product[] = []; // Biến tạm để chứa kết quả

        if (user?.id) {
          // --- TRƯỜNG HỢP 1: ĐÃ ĐĂNG NHẬP (GỌI HYBRID) ---
          const endpoint = `/api/recommendations/home/${user.id}`;
          console.log("Fetching from endpoint: ", endpoint);

          // ✅ Cung cấp type "HybridApiResponse" cho axios
          const res = await axios.get<HybridApiResponse>(endpoint);
          console.log("Hybrid recommendations data:", res.data);

          // ✅ Giờ 'res.data' đã được type-safe
          // Chúng ta bóc tách product từ mảng recommendations
          productsData = res.data.recommendations.map(r => r.product);
          console.log("productsData 1 ", productsData);
        } else {
          // --- TRƯỜNG HỢP 2: KHÁCH (GỌI POPULAR) ---
          const endpoint = "/api/products/popular";
          console.log("Fetching from endpoint: ", endpoint);

          // ✅ Cung cấp type "Product[]" cho axios
          const res = await axios.get<Product[]>(endpoint);
          console.log("Popular products data:", res.data);
          // ✅ 'res.data' chính là mảng Product[]
          productsData = res.data;
        }
        console.log("productsData 2 ", productsData);
        setProducts(productsData);

      } catch (err) {
        console.error("Error loading recommendations:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [user]);

  // 🟡 3️⃣ UI hiển thị
  if (loading) {
    return (
      <section className="w-full bg-white py-14">
        <div className="max-w-[1700px] mx-auto px-6 space-y-8">
          <div className="flex items-center justify-between">
            <p className="text-gray-600">Đang tải...</p>
          </div>
        </div>
      </section >
    );
  }

  if (!products || products.length === 0) {
    return (
      <p className="text-center text-gray-500 mt-4">
        Hiện chưa có gợi ý nào cho bạn.
      </p>
    );
  }

  return (
    <section className="w-full bg-white py-14">
      <div className="max-w-[1700px] mx-auto px-6 space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-wide text-gray-900">
            Sản phẩm có thể bạn quan tâm
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-7">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

    </section >
  );
}
