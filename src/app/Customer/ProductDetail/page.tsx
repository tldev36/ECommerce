"use client";

import { useParams } from "next/navigation";
import { products } from "@/data/products";
import Image from "next/image";
import Link from "next/link";

export default function ProductDetail() {
  const params = useParams();
  const slug = params.slug;

  // Tìm product theo slug
  const product = products.find((p) => p.slug === slug);

  if (!product) {
    return (
      <div className="container mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-4">Sản phẩm không tồn tại</h1>
        <Link href="/Customer/products" className="text-green-600 underline">
          Quay lại danh sách sản phẩm
        </Link>
      </div>
    );
  }

  // Tính giá sau giảm nếu có discount
  const discountedPrice = product.discount
    ? product.price - (product.price * product.discount) / 100
    : product.price;

  return (
    <div className="container mx-auto px-6 py-10">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Ảnh sản phẩm */}
        <div className="md:w-1/2">
          <Image
            src={product.image}
            alt={product.name}
            width={600}
            height={600}
            className="object-cover rounded-md"
          />
        </div>

        {/* Thông tin sản phẩm */}
        <div className="md:w-1/2">
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

          <p className="mb-4 text-gray-700">{product.short}</p>

          <div className="mb-4">
            {product.discount ? (
              <div className="flex items-center gap-4">
                <span className="text-2xl font-semibold text-red-600">
                  {discountedPrice.toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  })}
                </span>
                <span className="line-through text-gray-500">
                  {product.price.toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  })}
                </span>
                <span className="bg-red-600 text-white px-2 py-1 text-sm rounded">
                  -{product.discount}%
                </span>
              </div>
            ) : (
              <span className="text-2xl font-semibold text-green-700">
                {product.price.toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })}
              </span>
            )}
          </div>

          <p className="mb-6 text-sm text-gray-600">Đơn vị: {product.unit}</p>

          <button
            type="button"
            className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Thêm vào giỏ hàng
          </button>
        </div>
      </div>

      <div className="mt-10">
        <Link href="/Customer/products" className="text-green-600 underline">
          ← Quay lại danh sách sản phẩm
        </Link>
      </div>
    </div>
  );
}
