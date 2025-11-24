"use client";
import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faShoppingCart, faMinus, faPlus, faShoppingBag, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import HomeRecommendations from "@/components/HomeRecommendations";
import CartRecommendations from "@/components/CartRecommendations";

export default function CartPage() {
  const { cart, removeItem, clearCart, updateQuantity, isLoggedIn } = useCart();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        setUser(data.user || null);
      } catch {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  const handleCheckout = async () => {
    if (!user) {
      router.push("/auth/login?redirect=/customer/cart");
      return;
    }
    setLoading(true);
    router.push("/customer/checkout");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        {/* <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <FontAwesomeIcon icon={faShoppingCart} className="text-white text-xl" />
            </div>
            Giỏ hàng
          </h1>
          {cart.length > 0 && (
            <p className="text-gray-600 ml-16">
              Bạn có <span className="font-semibold text-green-600">{totalItems} sản phẩm</span> trong giỏ hàng
            </p>
          )}
        </div> */}

        {/* GIỎ HÀNG */}
        {cart.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FontAwesomeIcon icon={faShoppingBag} className="text-gray-400 text-4xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Giỏ hàng trống</h2>
            <p className="text-gray-600 mb-8">Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
            <Link
              href="/customer/list-product"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold"
            >
              <FontAwesomeIcon icon={faShoppingBag} />
              Khám phá sản phẩm
              <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
            </Link>
          </div>
        ) : (
          // <div className="grid lg:grid-cols-3 gap-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* DANH SÁCH SẢN PHẨM */}
            {/* <div className="lg:col-span-2 space-y-4"> */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-green-500 px-6 py-4">
                  <h2 className="text-white font-semibold text-lg">Sản phẩm trong giỏ</h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {cart.map((item) => (
                    <div
                      key={item.product_id}
                      className="p-6 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="flex flex-col sm:flex-row gap-6">
                        {/* Hình ảnh */}
                        <div className="relative group">
                          <div className="w-28 h-28 bg-gray-100 rounded-xl overflow-hidden shadow-md">
                            <Image
                              src={`/images/products/${item.image}`}
                              alt={item.name || "Product image"}
                              width={112}
                              height={112}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                        </div>

                        {/* Thông tin sản phẩm */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">
                            {item.name}
                          </h3>
                          <p className="text-green-600 font-semibold text-lg mb-4">
                            {item.price?.toLocaleString("vi-VN")}₫
                          </p>

                          {/* Điều chỉnh số lượng */}
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600 font-medium">Số lượng:</span>
                            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm transition-all duration-200 text-gray-700"
                              >
                                <FontAwesomeIcon icon={faMinus} className="text-sm" />
                              </button>
                              <span className="w-12 text-center font-bold text-gray-900">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm transition-all duration-200 text-gray-700"
                              >
                                <FontAwesomeIcon icon={faPlus} className="text-sm" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Giá và nút xóa */}
                        <div className="flex flex-col items-end justify-between sm:min-w-[140px]">
                          <div className="bg-green-50 px-4 py-2 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">Thành tiền</p>
                            <p className="font-bold text-green-600 text-xl">
                              {(item.price * item.quantity).toLocaleString()}₫
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.product_id)}
                            className="flex items-center gap-2 text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                            Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Xóa tất cả */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={clearCart}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium text-sm hover:underline transition-all"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                    Xóa toàn bộ giỏ hàng
                  </button>
                </div>
              </div>
            </div>

            {/* TỔNG TIỀN VÀ THANH TOÁN */}
            {/* <div className="lg:col-span-1"> */}
            <div className="lg:col-span-1">
              {/* HEADER */}
              <div className="mb-8 flex justify-end">
                <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3 mb-2">
                  
                  Giỏ hàng
                  <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <FontAwesomeIcon icon={faShoppingCart} className="text-white text-xl" />
                  </div>
                </h1>
                {/* {cart.length > 0 && (
                  <p className="text-gray-600 ml-16">
                    Bạn có <span className="font-semibold text-green-600">{totalItems} sản phẩm</span> trong giỏ hàng
                  </p>
                )} */}
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Tóm tắt đơn hàng</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính:</span>
                    <span className="font-semibold">{total.toLocaleString()}₫</span>
                  </div>
                  {/* <div className="flex justify-between text-gray-600">
                    <span>Phí vận chuyển:</span>
                    <span className="font-semibold text-green-600">Miễn phí</span>
                  </div> */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-baseline">
                      <span className="text-lg font-semibold text-gray-900">Tổng cộng:</span>
                      <span className="text-3xl font-bold text-green-600">
                        {total.toLocaleString()}₫
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleCheckout}
                  className="w-full py-4 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Đang xử lý...
                    </span>
                  ) : (
                    "Tiến hành thanh toán"
                  )}
                </button>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Thanh toán an toàn & bảo mật</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Miễn phí vận chuyển toàn quốc</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Đổi trả trong 7 ngày</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* GỢI Ý SẢN PHẨM */}
        {cart.length > 0 && (
          <section className="mt-16">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-gray-900">
                <span className="text-3xl">💡</span>
                Bạn có thể quan tâm
              </h2>
              <div className="overflow-x-auto">
                <CartRecommendations />
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}