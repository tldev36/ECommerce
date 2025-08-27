"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import { Product } from "@/types/product";
import Link from "next/link";
import ProductCard from "./ProductCard";

interface ProductDetailProps {
  slug: string;
}

export default function ProductDetail({ slug }: ProductDetailProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get<Product>(`/api/products/${slug}`);
        setProduct(res.data);

        // Gọi API lấy sản phẩm liên quan
        const relatedRes = await axios.get<Product[]>(`/api/products/related?slug=${slug}`);
        setRelated(relatedRes.data);
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

  const finalPrice = product.discount && product.discount > 0
    ? Number(product.price) * (1 - Number(product.discount) / 100)
    : Number(product.price);

  const discountPercent = product.discount && product.discount > 0
    ? Number(product.discount)
    : 0;


  const handleIncrease = () => setQuantity((prev) => prev + 1);
  const handleDecrease = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  return (
    <div className="container mx-auto px-6 pt-20 pb-10">
      {/* Chi tiết sản phẩm */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white shadow-xl rounded-2xl p-8">

        {/* Ảnh sản phẩm */}
        <div className="flex justify-center items-center relative">
          {product.is_new && (
            <span className="absolute top-4 left-4 bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
              Mới
            </span>
          )}
          {product.is_best_seller && (
            <span className="absolute top-4 right-4 bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
              Bán chạy
            </span>
          )}
          <Image
            src={`/images/products/${product.image}`}
            alt={product.name}
            width={500}
            height={400}
            className="rounded-xl shadow-lg object-contain hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Thông tin sản phẩm */}
        <div className="flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-3">{product.name}</h1>
            {product.short && (
              <p className="text-gray-600 mb-4 leading-relaxed">{product.short}</p>
            )}

            {/* Giá */}
            <div className="mb-6">
              {product.discount && product.discount > 0 ? ( // ✅ kiểm tra > 0
                <>
                  <p className="text-lg line-through text-gray-400">
                    {Number(product.price).toLocaleString()} đ
                  </p>
                  <div className="flex items-center gap-3">
                    <p className="text-4xl font-bold text-green-600">
                      {finalPrice.toLocaleString()} đ / {product.unit}
                    </p>
                    <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow">
                      -{discountPercent}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Tiết kiệm {Number(product.discount).toLocaleString()} đ
                  </p>
                </>
              ) : (
                <p className="text-4xl font-bold text-green-600">
                  {Number(product.price).toLocaleString()} đ / {product.unit}
                </p>
              )}
            </div>


            {/* Mô tả chi tiết */}
            {product.short && (
              <div className="border-t pt-4 text-gray-700 leading-relaxed">
                <h2 className="text-lg font-semibold mb-2">Mô tả sản phẩm</h2>
                <p>{product.short}</p>
              </div>
            )}
          </div>

          {/* Chọn số lượng */}
          <div className="flex items-center gap-4 mt-6">
            <span className="font-semibold">Số lượng:</span>
            <div className="flex border rounded-lg overflow-hidden">
              <button
                onClick={handleDecrease}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200"
              >
                -
              </button>
              <input
                type="text"
                value={quantity}
                readOnly
                className="w-14 text-center border-x outline-none"
              />
              <button
                onClick={handleIncrease}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200"
              >
                +
              </button>
            </div>
          </div>

          {/* Nút hành động */}
          <div className="flex gap-4 mt-8">
            <button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition">
              Mua ngay
            </button>
            <button className="flex-1 border border-green-600 text-green-600 hover:bg-green-50 font-semibold py-4 px-6 rounded-xl transition">
              Thêm giỏ hàng
            </button>
          </div>
        </div>
      </div>

      {/* Sản phẩm liên quan */}
      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
