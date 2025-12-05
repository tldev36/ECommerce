"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Product } from "@/types/product";
import axios from "axios";
import { useCart } from "@/context/CartContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartPlus } from "@fortawesome/free-solid-svg-icons";
import { faHeart as faSolidHeart } from "@fortawesome/free-solid-svg-icons";
import { faHeart as faRegularHeart } from "@fortawesome/free-regular-svg-icons";

export default function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem } = useCart();
  const [imgSrc, setImgSrc] = useState(`/images/products/${product?.image}`);

  useEffect(() => {
    if (!product?.image) setImgSrc("/images/products/default.jpg");
  }, [product?.image]);

  const [isFavorite, setIsFavorite] = useState(false);

  const productPrice = product.price || 0;
  const finalPrice = product.discount
    ? productPrice - (productPrice * product.discount) / 100
    : productPrice;

  return (
    <div
      onClick={() => router.push(`/customer/product/${product.slug}`)}
      className="cursor-pointer bg-white rounded-xl shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative w-full h-48 rounded-t-xl overflow-hidden">
        <Image
          src={imgSrc}
          alt={product?.name ?? "Product"}
          fill
          sizes="(max-width: 768px) 50vw, 33vw"
          style={{ objectFit: "cover" }}
          onError={() => setImgSrc("/images/products/default.jpg")}
        />

        {/* Favorite */}
        {/* <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite((prev) => !prev);
          }}
          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white"
        >
          <FontAwesomeIcon
            icon={isFavorite ? faSolidHeart : faRegularHeart}
            className={`w-4 h-4 ${isFavorite ? "text-red-500" : "text-gray-500"}`}
          />
        </button> */}

        {product.discount && product.discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow">
            -{product.discount}%
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3 space-y-1">
        <h3 className="text-sm font-semibold line-clamp-2 text-gray-900">
          {product.name}
        </h3>

        {product.short && (
          <p className="text-xs text-gray-500 line-clamp-1">{product.short}</p>
        )}

        <div className="flex items-center justify-between pt-2">
          {/* Price */}
          <div className="text-sm font-medium">
            {product.discount && product.discount > 0 ? (
              <>
                <span className="text-red-600 font-bold">
                  {finalPrice.toLocaleString()}₫
                </span>
                <span className="text-gray-400 line-through text-xs ml-1">
                  {productPrice.toLocaleString()}₫
                </span>
              </>
            ) : (
              <span className="text-gray-800 font-semibold">
                {productPrice.toLocaleString()}₫
              </span>
            )}
            <span className="text-xs text-gray-500 ml-1">/ {product.unit}</span>
          </div>

          {/* Add to cart */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              addItem(product);
            }}
            className="flex items-center gap-2 text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition"
          >
            <FontAwesomeIcon icon={faCartPlus} className="text-sm" />
            
          </button>
        </div>
      </div>
    </div>
  );
}
