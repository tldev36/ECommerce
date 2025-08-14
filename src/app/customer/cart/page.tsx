"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

const initialCart = [
  {
    id: 1,
    name: "Áo thun nam Basic",
    price: 200000,
    quantity: 2,
    image: "/images/apple.jpg",
  },
  {
    id: 2,
    name: "Giày thể thao",
    price: 750000,
    quantity: 1,
    image: "/images/apple.jpg",
  },
];

const suggestedProducts = [
  {
    id: 101,
    name: "Mũ lưỡi trai",
    price: 150000,
    image: "/images/apple.jpg",
  },
  {
    id: 102,
    name: "Kính mát thời trang",
    price: 300000,
    image: "/images/apple.jpg",
  },
  {
    id: 103,
    name: "Tất thể thao",
    price: 80000,
    image: "/images/apple.jpg",
  },
];

export default function CartPage() {
  const [cartItems, setCartItems] = useState(initialCart);
  const [note, setNote] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountError, setDiscountError] = useState("");

  const router = useRouter();

  const removeItem = (id: number) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const totalPriceBeforeDiscount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalPrice = totalPriceBeforeDiscount * (1 - discountPercent / 100);

  const applyDiscount = () => {
    setDiscountError("");
    const code = discountCode.trim().toUpperCase();

    if (code === "SALE10") {
      setDiscountPercent(10);
    } else if (code === "SALE20") {
      setDiscountPercent(20);
    } else {
      setDiscountPercent(0);
      setDiscountError("Mã giảm giá không hợp lệ");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 flex gap-8 mt-16 min-h-[700px]">
      {/* Left side: Cart + Note + Discount */}
      <div className="flex-1">
        <h1 className="text-3xl font-semibold mb-6">Giỏ hàng của bạn</h1>

        {cartItems.length === 0 ? (
          <p className="text-center text-gray-500">Giỏ hàng trống</p>
        ) : (
          <div className="space-y-4 mb-8">
            {cartItems.map(({ id, name, price, quantity, image }) => (
              <div
                key={id}
                className="flex items-center bg-white shadow rounded-lg p-4"
              >
                <div className="relative w-24 h-24 rounded overflow-hidden flex-shrink-0">
                  <Image
                    src={image}
                    alt={name}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="96px"
                    priority
                  />
                </div>
                <div className="flex-1 ml-4">
                  <h2 className="font-semibold text-lg">{name}</h2>
                  <p className="text-gray-600">
                    Giá:{" "}
                    <span className="font-medium">
                      {price.toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </span>
                  </p>
                  <p className="text-gray-600">Số lượng: {quantity}</p>
                  <p className="text-gray-800 font-semibold mt-1">
                    Thành tiền:{" "}
                    {(price * quantity).toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}
                  </p>
                </div>

                <button
                  onClick={() => removeItem(id)}
                  className="text-red-500 hover:text-red-700 font-bold ml-4"
                  aria-label={`Xóa ${name} khỏi giỏ hàng`}
                >
                  Xóa
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Ghi chú */}
        <div className="mb-6">
          <label
            htmlFor="note"
            className="block mb-2 font-medium text-gray-700"
          >
            Ghi chú đơn hàng
          </label>
          <textarea
            id="note"
            rows={4}
            className="w-full rounded-md border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Bạn muốn ghi chú gì cho đơn hàng?"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        {/* Mã giảm giá */}
        <div className="mb-8 max-w-sm">
          <label
            htmlFor="discountCode"
            className="block mb-2 font-medium text-gray-700"
          >
            Nhập mã giảm giá
          </label>
          <div className="flex gap-2">
            <input
              id="discountCode"
              type="text"
              className="flex-1 rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Mã giảm giá"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
            />
            <button
              onClick={applyDiscount}
              className="bg-green-600 text-white px-4 rounded-md hover:bg-green-700 transition"
            >
              Áp dụng
            </button>
          </div>
          {discountError && (
            <p className="mt-1 text-red-500 font-medium">{discountError}</p>
          )}
          {discountPercent > 0 && (
            <p className="mt-1 text-green-600 font-semibold">
              Áp dụng giảm giá {discountPercent}%
            </p>
          )}
        </div>

        {/* Tổng tiền và thanh toán */}
        <div className="text-right">
          <p className="text-xl font-bold mb-3">
            Tổng cộng:{" "}
            {totalPrice.toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
            })}
          </p>
          <button
            disabled={cartItems.length === 0}
            className={`mt-2 px-6 py-3 rounded-lg text-white font-semibold ${
              cartItems.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            } transition`}
            onClick={() => router.push("/customer/checkout")}
          >
            Thanh toán
          </button>
        </div>
      </div>

      {/* Right side: Suggested products */}
      <div className="w-80 bg-white p-4 rounded-lg shadow sticky top-6 h-fit mt-15">
        <h2 className="text-xl font-semibold mb-4">Sản phẩm gợi ý</h2>
        <ul className="space-y-4">
          {suggestedProducts.map(({ id, name, price, image }) => (
            <li key={id} className="flex items-center gap-3">
              <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
                <Image
                  src={image}
                  alt={name}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="64px"
                  priority
                />
              </div>
              <div>
                <p className="font-medium">{name}</p>
                <p className="text-green-600 font-semibold">
                  {price.toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  })}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
