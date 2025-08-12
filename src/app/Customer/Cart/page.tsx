"use client";

import { useState } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Gạo ST25 - Thơm ngon đặc sản",
      price: 32000,
      quantity: 2,
      image: "/images/apple.jpg",
      discount: 10, // % giảm giá
    },
    {
      id: 2,
      name: "Gạo Lài Sữa",
      price: 28000,
      quantity: 1,
      image: "/images/rice.jpg",
      discount: 0,
    },
  ]);

  const updateQuantity = (id: number, type: "increase" | "decrease") => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity:
                type === "increase"
                  ? item.quantity + 1
                  : item.quantity > 1
                  ? item.quantity - 1
                  : 1,
            }
          : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const calcPrice = (item: any) => {
    if (item.discount && item.discount > 0) {
      return item.price - (item.price * item.discount) / 100;
    }
    return item.price;
  };

  const totalPrice = cartItems.reduce(
    (total, item) => total + calcPrice(item) * item.quantity,
    0
  );
  

  return (
    <div className="max-w-6xl mx-auto p-4 mt-16 min-h-100">
      <h1 className="text-2xl font-bold mb-6">Giỏ hàng</h1>

      {cartItems.length === 0 ? (
        <p>Giỏ hàng của bạn đang trống.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Danh sách sản phẩm */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 border rounded-lg p-4"
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  width={80}
                  height={80}
                  className="rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-medium">{item.name}</h3>

                  {item.discount > 0 ? (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 line-through">
                        {item.price.toLocaleString()}₫
                      </span>
                      <span className="text-red-500 font-semibold">
                        {calcPrice(item).toLocaleString()}₫
                      </span>
                      <span className="bg-red-100 text-red-500 text-xs px-2 py-1 rounded">
                        -{item.discount}%
                      </span>
                    </div>
                  ) : (
                    <p className="text-red-500 font-semibold">
                      {item.price.toLocaleString()}₫
                    </p>
                  )}

                  {/* Chọn số lượng */}
                  <div className="flex items-center mt-2 border rounded-lg w-fit">
                    <button
                      onClick={() => updateQuantity(item.id, "decrease")}
                      className="px-3 py-1"
                    >
                      -
                    </button>
                    <span className="px-4">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, "increase")}
                      className="px-3 py-1"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  className="text-gray-500 hover:text-red-500 text-lg"
                  title="Xóa sản phẩm"
                >
                  <FontAwesomeIcon icon={faTrash} className="w-4 h-4"/>
                </button>
              </div>
            ))}
          </div>

          {/* Tổng tiền */}
          <div className="border rounded-lg p-4 h-fit">
            <h2 className="text-lg font-semibold mb-4">Tóm tắt đơn hàng</h2>
            <div className="flex justify-between mb-2">
              <span>Tạm tính:</span>
              <span>{totalPrice.toLocaleString()}₫</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Tổng:</span>
              <span className="text-red-500">
                {totalPrice.toLocaleString()}₫
              </span>
            </div>
            <button
              onClick={() => router.push("/Customer/Checkout")}
              className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium"
            >
              Thanh toán
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
