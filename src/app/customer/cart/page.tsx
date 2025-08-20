"use client";
import { useCart } from "@/context/CartContext";
import Image from "next/image";
import Link from "next/link";

export default function CartPage() {
  const { cart, removeItem, updateQuantity, clearCart } = useCart();

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        🛒 Giỏ hàng của bạn
      </h1>

      {cart.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg shadow">
          <p className="text-gray-600 mb-4">Giỏ hàng của bạn đang trống.</p>
          <Link
            href="/customer/list-product"
            className="inline-block px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Mua ngay
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md p-4 divide-y">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 py-4"
              >
                <Image
                  src={`/images/products/${item.image}`}
                  alt={item.name}
                  width={80}
                  height={80}
                  className="rounded-lg border"
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    {item.price.toLocaleString()} ₫ / {item.unit}
                  </p>

                  {/* Nút tăng giảm số lượng */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="px-2">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-bold text-green-600">
                    {(item.price * item.quantity).toLocaleString()} ₫
                  </p>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 text-sm hover:underline mt-1"
                  >
                    Xoá
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Tổng cộng */}
          <div className="mt-6 flex justify-between items-center bg-gray-50 p-4 rounded-lg shadow-inner">
            <button
              onClick={clearCart}
              className="px-4 py-2 border rounded-lg text-red-600 hover:bg-red-50"
            >
              Xoá hết
            </button>
            <div className="text-right">
              <p className="text-lg font-semibold">
                Tổng cộng:{" "}
                <span className="text-green-600 text-xl font-bold">
                  {total.toLocaleString()} ₫
                </span>
              </p>
              <button className="mt-2 w-full px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                Thanh toán
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
