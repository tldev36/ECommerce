// src/components/product/ProductCard.tsx
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/data/products";

export default function ProductCard({ product }: { product: Product }) {
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

          {/* Badge giảm giá */}
          {product.discount && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{product.discount}%
            </span>
          )}

          {/* Badge mới */}
          {product.isNew && (
            <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
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
