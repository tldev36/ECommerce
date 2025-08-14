"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // nhiều sản phẩm hơn mỗi trang

  useEffect(() => {
    const allProducts = Array.from({ length: 25 }).map((_, i) => ({
      id: i + 1,
      name: `Sản phẩm ${i + 1}`,
      image: "/images/sample-product.jpg",
      price: Math.floor(Math.random() * 500000) + 20000,
      unit: "cái",
    }));
    setWishlist(allProducts);
  }, []);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = wishlist.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(wishlist.length / itemsPerPage);

  const removeFromWishlist = (id: number) => {
    setWishlist((prev) => prev.filter((item) => item.id !== id));
  };

  const removeAll = () => {
    setWishlist([]);
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 mt-16">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Danh sách yêu thích</h1>
        {wishlist.length > 0 && (
          <button
            onClick={removeAll}
            className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
          >
            Xóa tất cả
          </button>
        )}
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          Chưa có sản phẩm yêu thích
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {currentItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition overflow-hidden"
              >
                <div className="relative w-full h-36">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-3">
                  <h2 className="text-sm font-medium line-clamp-2">
                    {item.name}
                  </h2>
                  <p className="text-green-600 font-bold text-sm mt-1">
                    {item.price.toLocaleString()} đ / {item.unit}
                  </p>
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="mt-2 w-full px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-xs"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-6 gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-2.5 py-1 rounded-md text-sm ${
                    currentPage === i + 1
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
