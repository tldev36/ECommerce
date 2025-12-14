"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, Heart, Plus } from "lucide-react";
import axios from "axios";

interface ProductCardProps {
  product: Product;
}

interface User {
  id: string;
  email: string;
  role?: string;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [imgSrc, setImgSrc] = useState(`/images/products/${product?.image}`);
  // const [isFavorite, setIsFavorite] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [hasLoggedView, setHasLoggedView] = useState(false);

  // Tính giá
  const productPrice = Number(product.price) || 0;
  const finalPrice = product.discount
    ? productPrice - (productPrice * product.discount) / 100
    : productPrice;

  // 🟢 Khi load component → lấy thông tin user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await res.json();
        if (data?.user?.id) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Lỗi khi lấy user:", err);
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  // 🟢 Ghi log xem sản phẩm nếu có user
  const hasLoggedRef = useRef(false);

  useEffect(() => {
    const logView = async () => {
      if (!user?.id || !product.id) return;

      if (hasLoggedRef.current) return; // chặn tuyệt đối
      hasLoggedRef.current = true;

      await axios.post("/api/interactions", {
        userId: user.id,
        productId: product.id,
        interactionType: "view",
      });
    };

    logView();
  }, [user, product.id]);

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

  return (
    <div
      onClick={() => router.push(`/customer/product/${product.slug}`)}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full"
    >
      {/* 📸 Image Section */}
      <div className="relative w-full aspect-[4/3] bg-gray-50 overflow-hidden">
        <Image
          src={imgSrc}
          alt={product?.name ?? "Product"}
          fill
          sizes="(max-width: 768px) 50vw, 33vw"
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          onError={() => setImgSrc("/images/products/default.jpg")}
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.discount != null && product.discount > 0 ? (
            <>
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-md">
                -{product.discount}%
              </span>
            </>
          ) : (
            // Nếu không có giảm giá
            <></>
          )}
          {product.is_new && (
            <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-md">
              MỚI
            </span>
          )}
        </div>

        {/* Favorite Button (Hidden by default, show on hover) */}
        {/* <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white text-gray-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 duration-300"
        >
          <Heart className={`w-4 h-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
        </button> */}
      </div>

      {/* 📝 Content Section */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors" title={product.name}>
            {product.name}
          </h3>

          {/* {product.short && (
            <p className="text-xs text-gray-500 line-clamp-1 mt-1">{product.short}</p>
          )} */}
        </div>

        <div className="mt-4 flex items-end justify-between">
          {/* Price */}
          <div>
            {product.discount && product.discount > 0 ? (
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 line-through">
                  {productPrice.toLocaleString()}₫
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-red-600">
                    {finalPrice.toLocaleString()}₫
                  </span>
                  {/* <span className="text-xs text-gray-500 font-medium">/ {product.unit}</span> */}
                </div>
              </div>
            ) : (
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-gray-900">
                  {productPrice.toLocaleString()}₫
                </span>
                {/* <span className="text-xs text-gray-500 font-medium">/ {product.unit}</span> */}
              </div>
            )}
          </div>

          {/* Add Cart Button */}
          <button
            onClick={handleAddToCart}
            className="w-10 h-10 flex items-center justify-center bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm hover:shadow-md active:scale-95"
            title="Thêm vào giỏ"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}