"use client";

import { useState } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar as fasStar,
  faShoppingCart,
  faBolt,
} from "@fortawesome/free-solid-svg-icons";
import { faStar as farStar } from "@fortawesome/free-regular-svg-icons";

export default function ProductDetail() {
  const product = {
    id: 1,
    name: "Gạo ST25 - Thơm ngon đặc sản",
    price: 32000,
    oldPrice: 35000,
    description:
      "Gạo ST25 là loại gạo thơm ngon, dẻo, hạt dài, được canh tác tại Sóc Trăng. Phù hợp để nấu cơm, làm xôi, cơm chiên...",
    detailDescription: `
      Gạo ST25 được mệnh danh là “gạo ngon nhất thế giới” vào năm 2019. 
      Được trồng ở vùng đất phù sa màu mỡ của Sóc Trăng, hạt gạo dài, trắng, bóng, 
      khi nấu cho cơm dẻo thơm, ngọt vị tự nhiên. 
      Không chứa hóa chất bảo quản, đảm bảo an toàn cho sức khỏe.
    `,
    image: "/images/apple.jpg",
    stock: 20,
    rating: 4.5,
  };

  const relatedProducts = [
    { id: 2, name: "Gạo Lài Sữa", price: 28000, image: "/images/rice.jpg" },
    {
      id: 3,
      name: "Gạo Nàng Thơm Chợ Đào",
      price: 30000,
      image: "/images/apple.jpg",
    },
    { id: 4, name: "Gạo Hữu Cơ", price: 40000, image: "/images/apple.jpg" },
    { id: 5, name: "Gạo Japonica", price: 35000, image: "/images/apple.jpg" },
  ];

  const [quantity, setQuantity] = useState(1);
  const [reviewRating, setReviewRating] = useState(0);
  const [showAllReviews, setShowAllReviews] = useState(false);

  // Hàm render sao
  const renderStars = (
    rating: number,
    clickable = false,
    onClick?: (star: number) => void
  ) => {
    return Array.from({ length: 5 }, (_, i) => {
      const starNumber = i + 1;
      return (
        <FontAwesomeIcon
          key={starNumber}
          icon={starNumber <= Math.floor(rating) ? fasStar : farStar}
          className={`text-yellow-400 w-5 h-5 ${
            clickable ? "cursor-pointer" : ""
          }`}
          onClick={clickable ? () => onClick && onClick(starNumber) : undefined}
        />
      );
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-4 mt-16">
      {/* Chi tiết sản phẩm */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Hình ảnh */}
        <div className="border rounded-2xl overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            width={500}
            height={500}
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Thông tin sản phẩm */}
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">{product.name}</h1>

          {/* Giá */}
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-red-500">
              {product.price.toLocaleString()}₫
            </span>
            {product.oldPrice && (
              <span className="text-gray-400 line-through">
                {product.oldPrice.toLocaleString()}₫
              </span>
            )}
          </div>

          {/* Đánh giá */}
          <div className="flex items-center gap-1">
            {renderStars(product.rating)}
            <span className="ml-2 text-sm text-gray-500">
              {product.rating} / 5
            </span>
          </div>

          {/* Mô tả ngắn */}
          <p className="text-gray-600">{product.description}</p>

          {/* Chọn số lượng */}
          <div className="flex items-center gap-4">
            <span className="font-medium">Số lượng:</span>
            <div className="flex items-center border rounded-lg">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-1 text-lg hover:bg-gray-200"
              >
                -
              </button>
              <span className="px-4">{quantity}</span>
              <button
                onClick={() =>
                  setQuantity((q) => Math.min(product.stock, q + 1))
                }
                className="px-3 py-1 text-lg hover:bg-gray-200"
              >
                +
              </button>
            </div>
          </div>

          {/* Nút hành động */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2">
              <FontAwesomeIcon icon={faBolt} className="w-4 h-4" />
              Mua ngay
            </button>
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2">
              <FontAwesomeIcon icon={faShoppingCart} className="w-4 h-4" />
              Thêm vào giỏ
            </button>
          </div>

          <div className="text-sm text-gray-500">
            Còn lại: {product.stock} sản phẩm
          </div>
        </div>
      </div>

      {/* Mô tả chi tiết */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-3">Mô tả sản phẩm</h2>
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
          {product.detailDescription}
        </p>
      </div>

      {/* Sản phẩm gợi ý */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-5">Sản phẩm gợi ý</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {relatedProducts.map((item) => (
            <div
              key={item.id}
              className="border rounded-xl overflow-hidden hover:shadow-lg transition"
            >
              <Image
                src={item.image}
                alt={item.name}
                width={300}
                height={300}
                className="w-full h-40 object-cover"
              />
              <div className="p-3">
                <h3 className="text-sm font-medium">{item.name}</h3>
                <p className="text-red-500 font-semibold">
                  {item.price.toLocaleString()}₫
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Đánh giá sản phẩm */}
      <div className="mt-12 border-t pt-6">
        <h2 className="text-xl font-semibold mb-4">Đánh giá sản phẩm</h2>

        {/* Danh sách đánh giá */}
        <div className="space-y-4">
          {[
            {
              name: "Nguyễn Văn A",
              stars: 5,
              comment: "Gạo thơm, dẻo, ăn rất ngon. Đóng gói cẩn thận.",
            },
            {
              name: "Trần Thị B",
              stars: 4,
              comment: "Chất lượng tốt, nhưng giao hàng hơi chậm.",
            },
            {
              name: "Lê Văn C",
              stars: 5,
              comment: "Đúng như mô tả, chất lượng tuyệt vời.",
            },
            { name: "Phạm Thị D", stars: 3, comment: "Ổn, nhưng giá hơi cao." },
          ]
            .slice(0, showAllReviews ? undefined : 2) // nếu showAllReviews = false thì chỉ lấy 2 item
            .map((review, idx) => (
              <div key={idx} className="p-4 border rounded-lg shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{review.name}</span>
                  {renderStars(review.stars)}
                </div>
                <p className="text-gray-700 mt-2">{review.comment}</p>
              </div>
            ))}

          {/* Nút xem thêm / thu gọn */}
          <div className="text-center">
            <button
              onClick={() => setShowAllReviews(!showAllReviews)}
              className="mt-3 px-4 py-2 text-sm text-black bg-gray-300 hover:bg-green-900 hover:text-white rounded-lg"
            >
              {showAllReviews ? "Thu gọn" : "Xem thêm"}
            </button>
          </div>
        </div>

        {/* Form viết đánh giá */}
        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Viết đánh giá của bạn</h3>
          <div className="space-y-4">
            <div className="flex gap-1 text-yellow-500 text-2xl">
              {renderStars(reviewRating, true, setReviewRating)}
            </div>
            <input
              type="text"
              placeholder="Nhập tên của bạn"
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
            <textarea
              placeholder="Chia sẻ trải nghiệm của bạn..."
              rows={4}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
            ></textarea>
            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg">
              Gửi đánh giá
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
