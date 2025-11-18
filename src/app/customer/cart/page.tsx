"use client";
import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faShoppingCart,
  faMinus,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { cart, removeItem, clearCart, updateQuantity, isLoggedIn } = useCart();

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [user, setUser] = useState<any>(null);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        console.log("✅ User data:", data); // Thêm dòng này
        setUser(data.user || null);
      } catch (err) {
        console.error("❌ Fetch user error:", err);
        setUser(null);
      }
    };
    fetchUser();
  }, []);


  // 🧩 Thêm log để xem tình trạng đăng nhập và dữ liệu
  useEffect(() => {
    console.log("=== CART PAGE DEBUG ===");
    console.log("isLoggedIn:", isLoggedIn);
    console.log("user:", user);
    console.log("cart:", cart);

    // Kiểm tra cookie `token` phía client (chỉ để debug)
    console.log(
      "token cookie (client):",
      document.cookie.includes("token") ? "✅ Có token" : "❌ Không có token"
    );
  }, [isLoggedIn, user, cart]);

  const handleCheckout = async () => {
    if (!user) {
      router.push("/auth/login?redirect=/customer/cart");
      return;
    }

    try {
      setLoading(true);

      router.push("/customer/checkout");
    } catch (err) {
      console.error(err);
      alert("❌ Có lỗi khi đặt hàng. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-20 max-w-5xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3 text-green-700">
        <FontAwesomeIcon icon={faShoppingCart} className="text-green-600" />
        Giỏ hàng của bạn
      </h1>

      {cart.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl shadow">
          <p className="text-gray-600 mb-6 text-lg">Giỏ hàng của bạn đang trống.</p>
          <Link
            href="/customer/list-product"
            className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
          >
            🛍️ Mua ngay
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-gray-100 rounded-xl shadow-lg p-4 divide-y">
            {cart.map((item) => (
              <div
                key={item.product_id}
                className="flex flex-col sm:flex-row items-center gap-6 py-6"
              >
                <Image
                  src={`/images/products/${item.image}`}
                  alt={item.name || "Product image"}
                  width={100}
                  height={100}
                  className="rounded-lg border shadow-sm"
                />
                <div className="flex-1 w-full">
                  <p className="font-semibold text-gray-800 text-lg">
                    {item.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span>{item.price?.toLocaleString("vi-VN")}₫</span>
                  </p>

                  <div className="flex items-center gap-3 mt-3">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      className="px-2 py-1 border rounded-lg hover:bg-gray-100"
                    >
                      <FontAwesomeIcon icon={faMinus} />
                    </button>
                    <span className="px-4 py-1 bg-gray-100 rounded-lg font-medium">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      className="px-2 py-1 border rounded-lg hover:bg-gray-100"
                    >
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-bold text-green-600 text-lg">
                    {(item.price * item.quantity).toLocaleString()} ₫
                  </p>
                  <button
                    type="button"
                    onClick={() => removeItem(item.product_id)}
                    className="text-red-500 text-sm hover:underline mt-2 flex items-center gap-1"
                  >
                    <FontAwesomeIcon icon={faTrash} /> Xoá
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row justify-between items-center bg-gray-50 p-6 rounded-xl shadow-inner gap-4">
            <button
              type="button"
              onClick={clearCart}
              className="px-5 py-2 border rounded-lg text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faTrash} /> Xoá hết
            </button>

            <div className="text-right">
              <p className="text-xl font-semibold">
                Tổng cộng:{" "}
                <span className="text-green-600 text-2xl font-bold">
                  {total.toLocaleString()} ₫
                </span>
              </p>
              <button
                type="button"
                disabled={loading}
                onClick={handleCheckout}
                className="mt-3 px-8 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition disabled:opacity-50"
              >
                {loading ? "Đang xử lý..." : "Thanh toán"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
