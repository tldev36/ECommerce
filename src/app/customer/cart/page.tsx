"use client";
import { useCart } from "@/context/CartContext";
import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faShoppingCart, faMinus, faPlus, faShoppingBag, faArrowRight, faTag } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import CartRecommendations from "@/components/CartRecommendations";


export default function CartPage() {
  const { cart, removeItem, clearCart, updateQuantity } = useCart();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [user, setUser] = useState(null);
  
  // State lưu thông tin mới nhất từ Server (Giá, % giảm giá)
  const [productDetails, setProductDetails] = useState<Record<number, any>>({});
  const [isRefreshing, setIsRefreshing] = useState(true);

  // 1. Lấy thông tin User
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

  // 2. 🔥 FETCH DỮ LIỆU MỚI NHẤT CHO SẢN PHẨM TRONG GIỎ 🔥
  useEffect(() => {
    const fetchLatestProductData = async () => {
      if (cart.length === 0) {
        setIsRefreshing(false);
        return;
      }

      setIsRefreshing(true);
      try {
        // Tạo danh sách các Promise để gọi API lấy chi tiết từng sản phẩm
        // Giả sử bạn có API: /api/products/[id]
        const promises = cart.map(async (item) => {
            const res = await fetch(`/api/cart/products/${item.product_id}`);
            if (!res.ok) return null;
            return res.json();
        });

        const results = await Promise.all(promises);
        
        // Chuyển mảng kết quả thành Object map theo ID để dễ tra cứu
        const detailsMap: Record<number, any> = {};
        results.forEach((prod) => {
            if (prod && prod.id) { // Kiểm tra prod.id hoặc prod.product.id tùy API trả về
                detailsMap[prod.id] = prod; 
            }
        });
        
        setProductDetails(detailsMap);
      } catch (error) {
        console.error("Lỗi cập nhật giá giỏ hàng:", error);
      } finally {
        setIsRefreshing(false);
      }
    };

    fetchLatestProductData();
  }, [cart.length]); // Chỉ chạy khi số lượng item trong giỏ thay đổi (hoặc mới vào trang)


  // 3. --- LOGIC TÍNH TOÁN (Đã cập nhật để dùng dữ liệu mới nhất) ---
  
  // Merge cart (số lượng) với productDetails (giá, giảm giá mới nhất)
  const displayCart = useMemo(() => {
    return cart.map(item => {
        const freshData = productDetails[Number(item.product_id)];
        return {
            ...item,
            // Nếu có dữ liệu mới thì dùng, không thì dùng dữ liệu cũ trong cart
            price: freshData ? freshData.price : item.price,
            discount: freshData ? freshData.discount : item.discount, // Giữ nguyên chính tả dicount của bạn
            name: freshData ? freshData.name : item.name,
            image: freshData ? freshData.image : item.image,
        };
    });
  }, [cart, productDetails]);

  // Tính toán dựa trên displayCart (dữ liệu đã làm mới)
  const subTotal = displayCart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);

  const totalDiscount = displayCart.reduce((sum, item) => {
    const percent = item.discount || 0; 
    if (percent > 0) {
      const discountAmountPerItem = (Number(item.price) * percent) / 100;
      return sum + (discountAmountPerItem * item.quantity);
    }
    return sum;
  }, 0);

  const finalTotal = subTotal - totalDiscount;

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
        
        {cart.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
             <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
               <FontAwesomeIcon icon={faShoppingBag} className="text-gray-400 text-4xl" />
             </div>
             <h2 className="text-2xl font-bold text-gray-800 mb-3">Giỏ hàng trống</h2>
             <Link href="/customer/list-product" className="text-green-600 hover:underline">Quay lại mua sắm</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* DANH SÁCH SẢN PHẨM */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-green-500 px-6 py-4 flex justify-between items-center">
                  <h2 className="text-white font-semibold text-lg">Sản phẩm trong giỏ ({cart.length})</h2>
                  {isRefreshing && <span className="text-white text-sm italic animate-pulse">Đang cập nhật giá...</span>}
                </div>
                <div className="divide-y divide-gray-100">
                  {displayCart.map((item) => {
                    const percent = item.discount || 0;
                    const hasDiscount = percent > 0;
                    const originalPrice = Number(item.price);
                    const discountedPrice = hasDiscount 
                      ? originalPrice * (1 - percent / 100) 
                      : originalPrice;

                    return (
                      <div key={item.product_id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                        <div className="flex flex-col sm:flex-row gap-6">
                          {/* ẢNH SẢN PHẨM */}
                          <div className="relative group">
                            <div className="w-28 h-28 bg-gray-100 rounded-xl overflow-hidden shadow-md relative">
                              <Image
                                src={item.image ? `/images/products/${item.image}` : "/images/placeholder.png"}
                                alt={item.name || "Product image"}
                                width={112} height={112}
                                className="w-full h-full object-cover"
                              />
                              {hasDiscount && (
                                <span className="absolute top-0 left-0 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-br-lg z-10">
                                  -{percent}%
                                </span>
                              )}
                            </div>
                          </div>

                          {/* THÔNG TIN */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 text-lg mb-2">{item.name}</h3>
                            
                            {/* KHU VỰC HIỂN THỊ GIÁ */}
                            <div className="mb-4">
                                {hasDiscount ? (
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="text-red-600 font-bold text-lg">
                                                {discountedPrice.toLocaleString("vi-VN")}₫
                                            </span>
                                            <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded border border-red-200">
                                                Giảm {percent}%
                                            </span>
                                        </div>
                                        <span className="text-gray-400 text-sm line-through">
                                            {originalPrice.toLocaleString("vi-VN")}₫
                                        </span>
                                    </div>
                                ) : (
                                    <p className="text-green-600 font-semibold text-lg">
                                        {originalPrice.toLocaleString("vi-VN")}₫
                                    </p>
                                )}
                            </div>

                            {/* Nút tăng giảm số lượng */}
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                                    <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded text-gray-700"><FontAwesomeIcon icon={faMinus} className="text-xs"/></button>
                                    <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded text-gray-700"><FontAwesomeIcon icon={faPlus} className="text-xs"/></button>
                                </div>
                            </div>
                          </div>

                          {/* THÀNH TIỀN CỦA ITEM */}
                          <div className="flex flex-col items-end justify-between sm:min-w-[140px]">
                            <div className="text-right">
                              <p className="text-xs text-gray-500 mb-1">Thành tiền</p>
                              <p className="font-bold text-green-600 text-xl">
                                {(discountedPrice * item.quantity).toLocaleString()}₫
                              </p>
                              {hasDiscount && (
                                <p className="text-xs text-red-500 mt-1">
                                    Tiết kiệm: {((originalPrice - discountedPrice) * item.quantity).toLocaleString()}₫
                                </p>
                              )}
                            </div>
                            <button onClick={() => removeItem(item.product_id)} className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1 mt-2">
                                <FontAwesomeIcon icon={faTrash} /> Xóa
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Nút xóa hết */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <button onClick={clearCart} className="text-red-600 hover:underline text-sm font-medium flex items-center gap-2">
                        <FontAwesomeIcon icon={faTrash} /> Xóa toàn bộ giỏ hàng
                    </button>
                </div>
              </div>
            </div>

            {/* TÓM TẮT ĐƠN HÀNG (SIDEBAR) */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Thanh toán</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Tổng tiền hàng:</span>
                    <span className="font-medium">{subTotal.toLocaleString()}₫</span>
                  </div>
                  
                  {totalDiscount > 0 && (
                      <div className="flex justify-between text-red-600 bg-red-50 p-2 rounded">
                        <span><FontAwesomeIcon icon={faTag} className="mr-1"/> Giảm giá:</span>
                        <span className="font-bold">-{totalDiscount.toLocaleString()}₫</span>
                      </div>
                  )}

                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between items-end">
                      <span className="text-gray-900 font-bold">Tổng cộng:</span>
                      <span className="text-2xl font-bold text-green-600">{finalTotal.toLocaleString()}₫</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleCheckout} 
                  disabled={loading}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow transition-all disabled:opacity-50"
                >
                  {loading ? "Đang xử lý..." : "Tiến hành đặt hàng"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Gợi ý sản phẩm */}
        {cart.length > 0 && (
            <div className="mt-12">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Có thể bạn quan tâm</h3>
                <CartRecommendations />
            </div>
        )}
      </div>
    </div>
  );
}