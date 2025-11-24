"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import ProductCard from "@/components/product/ProductCard";
import { Product } from "@/types/product";

export default function CartRecommendations() {
  const { cart, user } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      // ❌ Chưa login → bỏ qua API
      if (!user) {
        setProducts([]);
        setLoading(false);
        return;
      }

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
  }, [cart, user]);

  // useEffect(() => {
  //   const fetchRecommendations = async () => {
  //     if (!cart || cart.length === 0) {
  //       setProducts([]);
  //       setLoading(false);
  //       return;
  //     }

  //     try {
  //       const ids = cart.map((item) => item.id);
  //       const res = await axios.post<any>("/api/recommendations/cart", {
  //         cartProductIds: ids,
  //       });
  //       setProducts(res.data);
  //     } catch (err) {
  //       console.error("Error loading cart recommendations:", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchRecommendations();
  // }, [cart]);

  // useEffect(() => {
  //   const fetchRecommendations = async () => {
  //     // ✅ Nếu chưa đăng nhập → gợi ý phổ biến
  //     if (!user) {
  //       try {
  //         const res = await axios.get<any>("/api/recommendations/popular");
  //         setProducts(res.data);
  //       } catch (err) {
  //         console.error("Error loading guest recommendations:", err);
  //       } finally {
  //         setLoading(false);
  //       }
  //       return;
  //     }

  //     // ✅ Nếu đăng nhập nhưng giỏ hàng trống
  //     if (!cart || cart.length === 0) {
  //       setProducts([]);
  //       setLoading(false);
  //       return;
  //     }

  //     // ✅ Nếu đăng nhập và có giỏ hàng → gợi ý theo giỏ hàng
  //     try {
  //       const ids = cart.map((item) => item.id);
  //       const res = await axios.post<Product[]>("/api/recommendations/cart", {
  //         cartProductIds: ids,
  //       });
  //       setProducts(res.data);
  //     } catch (err) {
  //       console.error("Error loading cart recommendations:", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchRecommendations();
  // }, [cart, user]);


  if (loading) return <p className="text-center mt-4">Đang tải gợi ý cho bạn...</p>;
  if (!products.length) return null;

  return (
    <section className="mt-10">
      {/* <h2 className="text-xl font-bold mb-4">🛍️ Bạn có thể cần thêm...</h2> */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 md:grid-cols-5 gap-7">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
