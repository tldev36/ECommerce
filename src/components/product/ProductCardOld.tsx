"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Product } from "@/types/product";
import axios from "axios";
import { useCart } from "@/context/CartContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as faSolidHeart } from "@fortawesome/free-solid-svg-icons";
import { faHeart as faRegularHeart } from "@fortawesome/free-regular-svg-icons";

interface User {
  id: string;
  email: string;
  role?: string;
}

export default function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem } = useCart();
  const [user, setUser] = useState<User | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingView, setLoadingView] = useState(false);

  // 
  const [imgSrc, setImgSrc] = useState(`/images/products/${product?.image}`);

  useEffect(() => {
    if (!product?.image) {
      setImgSrc("/images/products/default.jpg");
    }
  }, [product?.image]);

  // 🟢 Lấy user khi component mount
  // useEffect(() => {
  //   const fetchUser = async () => {
  //     try {
  //       const res = await fetch("/api/auth/me", { cache: "no-store" });
  //       const data = await res.json();
  //       if (data?.user?.id) setUser(data.user);
  //     } catch (err) {
  //       console.error("Lỗi khi lấy user:", err);
  //     }
  //   };
  //   fetchUser();
  // }, []);

  // 🔹 Khi click vào sản phẩm → log view → chuyển trang
  const handleViewProduct = async () => {
    if (loadingView) return;
    setLoadingView(true);

    try {
      if (user?.id) {
        await axios.post("/api/interactions", {
          userId: user.id,
          productId: product.id,
          interactionType: "view",
        });
      }
    } catch (err) {
      console.error("Lỗi ghi log view:", err);
    } finally {
      router.push(`/customer/product/${product.slug}`);
      setLoadingView(false);
    }
  };

  // 🔹 Thêm vào giỏ
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);

    if (user?.id) {
      try {
        await axios.post("/api/interactions", {
          userId: user.id,
          productId: product.id,
          interactionType: "add_to_cart",
        });
      } catch (err) {
        console.error("Lỗi ghi log add_to_cart:", err);
      }
    }

    alert(`Đã thêm ${product.name} vào giỏ hàng!`);
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsFavorite((prev) => !prev);
  };

  const productPrice = product.price || 0;
  const finalPrice = product.discount
    ? productPrice - (productPrice * product.discount) / 100
    : productPrice;

  return (
    <div
      onClick={handleViewProduct}
      className="cursor-pointer block bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
    >
      <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white">
        {/* Ảnh + badge */}
        <div className="relative w-full h-48">
          {/* <Image
            src={`/images/products/${product?.image ?? "default.jpg"}`}
            alt={product?.name ?? "Product"}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            style={{ objectFit: "cover" }}
          /> */}
          <Image
            src={imgSrc}
            alt={product?.name ?? "Product"}
            fill
            sizes="100vw"
            style={{ objectFit: "cover" }}
            onError={() => setImgSrc("/images/products/default.jpg")}
          />

          {/* Nút yêu thích */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(e);
            }}
            className="absolute top-2 right-2 w-9 h-9 flex items-center justify-center bg-white rounded-full shadow hover:bg-gray-100"
          >
            <FontAwesomeIcon
              icon={isFavorite ? faSolidHeart : faRegularHeart}
              className={`w-4 h-4 ${isFavorite ? "text-red-500" : "text-gray-600"}`}
            />
          </button>

          {/* Badge giảm giá */}
          {product.discount && product.discount > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{product.discount}%
            </span>
          )}

          {/* Badge mới */}
          {product.is_new && (
            <span className="absolute top-10 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
              Mới
            </span>
          )}

          {/* Badge bán chạy */}
          {product.is_best_seller && (
            <span className="absolute bottom-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
              Bán chạy
            </span>
          )}
        </div>

        {/* Thông tin sản phẩm */}
        <div className="p-3">
          <h3 className="text-sm font-semibold line-clamp-2">{product.name}</h3>
          {product.short && <p className="text-xs text-gray-500 mt-1">{product.short}</p>}

          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm font-medium">
              {product.discount && product.discount > 0 ? (
                <div>
                  <span className="text-red-600 font-bold">
                    {finalPrice.toLocaleString()} ₫
                  </span>
                  <span className="line-through text-gray-400 ml-2">
                    {productPrice.toLocaleString()} ₫
                  </span>
                  <span className="ml-1">/ {product.unit}</span>
                </div>
              ) : (
                <span>
                  {productPrice.toLocaleString()} ₫ / {product.unit}
                </span>
              )}
            </div>

            {/* Nút thêm */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart(e);
              }}
              className="text-sm bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition"
            >
              Thêm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
