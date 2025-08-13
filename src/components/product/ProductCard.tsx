"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/data/products";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as faSolidHeart } from "@fortawesome/free-solid-svg-icons";
import { faHeart as faRegularHeart } from "@fortawesome/free-regular-svg-icons";

export default function ProductCard({ product }: { product: Product }) {
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault(); // Ngăn click vào Link
    setIsFavorite((prev) => !prev);
    // TODO: Ghi dữ liệu vào localStorage hoặc API
  };

  return (
    <Link href={`/products/${product.slug}`} className="block">
      <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white">
        {/* Ảnh + badge */}
        <div className="relative w-full h-48">
          <Image
            src={product.image}
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
          {product.discount && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{product.discount}%
            </span>
          )}

          {/* Badge mới */}
          {product.isNew && (
            <span className="absolute top-10 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
              Mới
            </span>
          )}

          {/* Badge bán chạy */}
          {product.isBestSeller && (
            <span className="absolute bottom-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
              Bán chạy
            </span>
          )}
        </div>

        {/* Thông tin sản phẩm */}
        <div className="p-3">
          <h3 className="text-sm font-semibold line-clamp-2">{product.name}</h3>
          <p className="text-xs text-gray-500 mt-1">{product.short}</p>
          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm font-medium">
              {product.price.toLocaleString()} ₫ / {product.unit}
            </div>
            <button className="text-sm bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700">
              Thêm
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
