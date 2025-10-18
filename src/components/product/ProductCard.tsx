"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as faSolidHeart } from "@fortawesome/free-solid-svg-icons";
import { faHeart as faRegularHeart } from "@fortawesome/free-regular-svg-icons";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem, setCartFromServer, isLoggedIn } = useCart(); // ✅ lấy thêm
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsFavorite((prev) => !prev);
    // TODO: lưu localStorage hoặc gọi API
  };

  const finalPrice = product.discount
    ? product.price - (product.price * product.discount) / 100
    : product.price;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product); // ✅ chỉ gọi context
    alert(`Đã thêm ${product.name} vào giỏ hàng!`);
  };

  return (
    <Link
      href={`/customer/product/${product.slug}`}
      className="block bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
    >
      <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white">
        {/* Ảnh + badge */}
        <div className="relative w-full h-48">
          <Image
            src={"/images/products/" + product.image}
            alt={product.name}
            fill
            style={{ objectFit: "cover" }}
          />

          {/* Nút yêu thích */}
          <button
            onClick={toggleFavorite}
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
          {product.short && (
            <p className="text-xs text-gray-500 mt-1">{product.short}</p>
          )}
          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm font-medium">
              {product.discount && product.discount > 0 ? (
                <div>
                  <span className="text-red-600 font-bold">
                    {finalPrice.toLocaleString()} ₫
                  </span>
                  <span className="line-through text-gray-400 ml-2">
                    {product.price.toLocaleString()} ₫
                  </span>
                  <span className="ml-1">/ {product.unit}</span>
                </div>
              ) : (
                <span>
                  {product.price.toLocaleString()} ₫ / {product.unit}
                </span>
              )}
            </div>

            {/* Nút thêm */}
            <button
              onClick={handleAddToCart}
              className="text-sm bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition"
            >
              Thêm
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
