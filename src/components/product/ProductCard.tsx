// src/components/product/ProductCard.tsx
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/data/products";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.slug}`} className="block">
      <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white">
        <div className="relative w-full h-48">
          <Image src={product.image} alt={product.name} fill style={{ objectFit: "cover" }} />
        </div>
        <div className="p-3">
          <h3 className="text-sm font-semibold line-clamp-2">{product.name}</h3>
          <p className="text-xs text-gray-500 mt-1">{product.short}</p>
          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm font-medium">{product.price.toLocaleString()} ₫ / {product.unit}</div>
            <button className="text-sm bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700">
              Thêm
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
