"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import { Product } from "@/types/product";

interface ProductDetailProps {
  slug: string;
}

export default function ProductDetail({ slug }: ProductDetailProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get<Product>(`/api/products/${slug}`);
        setProduct(res.data);
      } catch (err) {
        console.error("Lỗi khi load sản phẩm:", err);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchProduct();
  }, [slug]);

  if (loading) return <p className="p-6">Đang tải sản phẩm...</p>;
  if (!product) return <p className="p-6 text-red-500">Không tìm thấy sản phẩm</p>;

  // Tính giá sau khi giảm (nếu có discount)
  const finalPrice = product.discount
    ? Number(product.price) - Number(product.discount)
    : Number(product.price);

  return (
    <div className="container mx-auto px-6 pt-20 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white shadow-lg rounded-2xl p-6">
        
        {/* Hình ảnh */}
        <div className="flex justify-center items-center">
          <Image
            src={`/images/products/${product.image}`}
            alt={product.name}
            width={400}
            height={300}
            className="rounded-xl shadow-md"
          />
        </div>

        {/* Thông tin sản phẩm */}
        <div className="flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-3">{product.name}</h1>
            {product.short && <p className="text-gray-600 mb-4">{product.short}</p>}

            {/* Giá */}
            <div className="mb-4">
              {product.discount ? (
                <>
                  <p className="text-xl line-through text-gray-400">
                    {Number(product.price).toLocaleString()} đ
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {finalPrice.toLocaleString()} đ / {product.unit}
                  </p>
                  <span className="inline-block mt-2 px-3 py-1 text-sm font-semibold bg-red-500 text-white rounded-full">
                    -{Number(product.discount).toLocaleString()} đ
                  </span>
                </>
              ) : (
                <p className="text-3xl font-bold text-green-600">
                  {Number(product.price).toLocaleString()} đ / {product.unit}
                </p>
              )}
            </div>
          </div>

          {/* Nút hành động */}
          <div className="flex gap-4 mt-6">
            <button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl shadow transition">
              Mua ngay
            </button>
            <button className="flex-1 border border-green-600 text-green-600 hover:bg-green-50 font-semibold py-3 px-6 rounded-xl transition">
              Thêm giỏ hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
