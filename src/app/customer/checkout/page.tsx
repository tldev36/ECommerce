"use client";

import { useCart } from "@/context/CartContext";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import AddressForm from "@/components/checkout/AddressForm";
import { Address } from "@/types/address";
import CouponInput from "@/components/checkout/CouponInput";
import InvoiceModal from "@/components/checkout/InvoiceModal";
import PaymentMethodSelector from "@/components/checkout/PaymentMethodSelector";
import ShippingFeeCalculator from "@/components/checkout/ShippingFeeCalculator";
import { ZaloPayCreateOrderResponse } from "@/types/ZaloPayCreateOrderResponse";
import { MoMoCreatePaymentResponse } from "@/types/MoMoCreatePaymentResponse";
import type { PaymentMethod } from "@/types/order";
import { formatFullAddress } from "@/lib/formatFullAddress";

export default function CheckoutPage() {
  const { cart, clearCart, isLoggedIn, user, loadingUser } = useCart();
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [shippingFee, setShippingFee] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [showInvoice, setShowInvoice] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);

  const selectedAddr = addresses.find((a) => a.id === selectedAddress);

  // 🧮 Tổng tiền
  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const finalTotal = useMemo(
    () => Math.max(total - discount + shippingFee, 0),
    [total, discount, shippingFee]
  );

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

  // 📦 Lấy danh sách địa chỉ
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await fetch("/api/shipping-address", {
          method: "GET",
          credentials: "include",
        });
        const result = await res.json();
        if (res.ok) setAddresses(result.addresses || []);
      } catch (err) {
        console.error("Lỗi fetch địa chỉ:", err);
      }
    };
    fetchAddresses();
  }, []);

  // 🔹 Tự chọn địa chỉ mặc định
  useEffect(() => {
    if (addresses.length > 0 && selectedAddress === null) {
      const defaultAddr = addresses.find((a) => a.default === true);
      setSelectedAddress(defaultAddr?.id ?? addresses[0].id ?? null);
    }
  }, [addresses, selectedAddress]);

  // ➕ Thêm / Sửa / Xoá địa chỉ
  const handleAddAddress = (newAddress: Address) => {
    setAddresses((prev) => [...prev, newAddress]);
    setShowForm(false);
  };

  const handleUpdateAddress = (updated: Address) => {
    setAddresses((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    setEditingAddress(null);
    setShowForm(false);
  };

  const handleDeleteAddress = (id: number) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    if (selectedAddress === id) setSelectedAddress(null);
  };

  // 🎟️ Áp dụng mã giảm giá
  const handleApplyCoupon = async (code: string) => {
    try {
      setCouponLoading(true);
      const res = await axios.post<{ valid: boolean; message?: string; discount_percent?: number; discount_amount?: number }>("/api/coupons/validate", { code });
      const result = res.data;

      if (!result.valid) {
        alert(result.message || "❌ Mã không hợp lệ hoặc đã hết hạn!");
        return;
      }

      if (result.discount_percent) {
        setDiscount((total * result.discount_percent) / 100);
      } else if (result.discount_amount) {
        setDiscount(result.discount_amount);
      }
      setCouponCode(code);
    } catch (err) {
      console.error("Lỗi khi áp dụng mã:", err);
      alert("⚠️ Không thể áp dụng mã giảm giá!");
    } finally {
      setCouponLoading(false);
    }
  };

  // 🛍️ Đặt hàng
  const handlePlaceOrder = async () => {
    if (!isLoggedIn || !user) {
      alert("⚠️ Bạn cần đăng nhập trước khi đặt hàng!");
      return;
    }
    if (!selectedAddr) {
      alert("⚠️ Vui lòng chọn địa chỉ giao hàng!");
      return;
    }

    const orderInfo = {
      user_id: user.id,
      shipping_address_id: selectedAddr.id,
      items: cart,
      total_amount: finalTotal,
      payment_method: paymentMethod,
      ship_amount: shippingFee,
      coupon_amount: discount
    };

    // MoMo
    // if (paymentMethod === "momo") {
    //   try {
    //     const momoData = {
    //       amount: finalTotal,
    //       orderId: `ORD-${Date.now()}`,
    //       orderInfo: `Thanh toán đơn hàng của ${user.full_name || user.email}`,
    //       userInfo: {
    //         id: user.id,
    //         name: user.full_name,
    //         email: user.email,
    //         phone: user.phone,
    //       },
    //       deliveryInfo: {
    //         address: selectedAddr.detail_address,
    //         ward: selectedAddr.ward_name,
    //       },
    //       items: cart,
    //     };

    //     const res = await axios.post<MoMoCreatePaymentResponse>(
    //       "/api/momo/create",
    //       momoData
    //     );

    //     if (res.data.payUrl) {
    //       window.location.href = res.data.payUrl;
    //     } else alert("❌ MoMo không trả về payUrl.");
    //   } catch (err) {
    //     console.error("Lỗi tạo thanh toán MoMo:", err);
    //     alert("⚠️ Không thể tạo thanh toán MoMo.");
    //   }
    //   return;
    // }

    // ZaloPay
    if (paymentMethod === "zalopay") {
      try {
        const res = await axios.post<ZaloPayCreateOrderResponse>(
          "/api/zalopay/create",
          orderInfo
        );
        const data = res.data;
        if (data.return_code === 1 && data.order_url) {
          window.location.href = data.order_url;
          // clearCart();
        }
        else alert("❌ Không thể tạo QR thanh toán ZaloPay");
      } catch (err) {
        console.error("Lỗi tạo đơn ZaloPay:", err);
        alert("⚠️ Lỗi khi tạo đơn ZaloPay");
      }
      return;
    }

    // 🧾 Xử lý đơn hàng COD
    try {
      // Định nghĩa kiểu phản hồi từ API
      interface OrderResponse {
        success: boolean;
        message?: string;
        order?: any; // hoặc bạn có thể định nghĩa rõ kiểu Order nếu đã có interface
      }

      const res = await axios.post<OrderResponse>("/api/orders", orderInfo, {
        withCredentials: true, // nếu bạn dùng cookie token cho user
      });

      if (res.data.success) {
        alert("🎉 Đặt hàng thành công!");
        clearCart();
        router.push("/customer/home");
      } else {
        console.error("❌ API trả lỗi:", res.data.message);
        alert(res.data.message || "❌ Lỗi khi tạo đơn hàng!");
      }
    } catch (err: any) {
      console.error("⚠️ Lỗi kết nối server:", err.response?.data || err.message);
      alert("⚠️ Không thể kết nối đến server! Vui lòng thử lại sau.");
    }

  };

  // 🧮 Tổng trọng lượng (gram)
  const totalWeight = useMemo(() => {
    return cart.reduce((sum, item) => {
      let w = 0;
      if (typeof item.unit === "string") {
        const value = parseFloat(item.unit);
        if (item.unit.toLowerCase().includes("kg")) w = value * 1000;
        else if (item.unit.toLowerCase().includes("g")) w = value;
      } else if (typeof item.unit === "number") w = item.unit;
      return sum + w * (item.quantity || 1);
    }, 0);
  }, [cart]);

  // load user
  if (loadingUser) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-600">
        ⏳ Đang tải thông tin người dùng...
      </div>
    );
  }

  //
  // 🧩 Thêm log để xem tình trạng đăng nhập và dữ liệu
  // useEffect(() => {
  //   console.log("=== CART PAGE DEBUG ===");
  //   console.log("isLoggedIn:", isLoggedIn);
  //   console.log("user:", user);
  //   console.log("cart:", cart);

  //   // Kiểm tra cookie `token` phía client (chỉ để debug)
  //   console.log(
  //     "token cookie (client):",
  //     document.cookie.includes("token") ? "✅ Có token" : "❌ Không có token"
  //   );
  // }, [isLoggedIn, user, cart]);

  return (
    <div className="mt-20 max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">🛒 Thanh toán</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* 📍 Địa chỉ */}
        <div className="bg-white shadow-md rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">📍 Địa chỉ giao hàng</h2>

          {addresses.length === 0 ? (
            <p className="text-gray-500 italic mb-3">Chưa có địa chỉ. Hãy thêm mới!</p>
          ) : (
            <ul className="space-y-4">
              {addresses.map((addr) => (
                <li
                  key={addr.id}
                  onClick={() => setSelectedAddress(addr.id!)}
                  className={`p-4 border rounded-xl cursor-pointer transition ${selectedAddress === addr.id
                    ? "border-green-600 bg-green-50"
                    : "border-gray-200 hover:border-green-400"
                    }`}
                >
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium text-gray-800">
                        {addr.recipient_name} - {addr.phone}
                      </p>
                      <p className="text-sm text-gray-600">
                        {addr.detail_address}, {addr.ward_name}, {addr.district_name},{" "}
                        {addr.province_name}
                        {addr.default && (
                          <span className="ml-2 text-xs text-white bg-green-600 px-2 py-0.5 rounded-full">
                            Mặc định
                          </span>
                        )}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingAddress(addr);
                        setShowForm(true);
                      }}
                      className="text-blue-600 text-sm hover:underline font-medium"
                    >
                      📝 Sửa
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <button
            className="mt-4 text-green-600 font-medium hover:underline"
            onClick={() => {
              setEditingAddress(null);
              setShowForm(!showForm);
            }}
          >
            ➕ {showForm ? "Đóng form" : "Thêm địa chỉ mới"}
          </button>

          {showForm && (
            <AddressForm
              editingAddress={editingAddress}
              handleAddAddress={handleAddAddress}
              handleUpdateAddress={handleUpdateAddress}
              handleDeleteAddress={handleDeleteAddress}
            />
          )}
        </div>

        {/* 🛍️ Giỏ hàng */}
        <div className="bg-white shadow-md rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">🛍️ Giỏ hàng của bạn</h2>

          <ShippingFeeCalculator
            key={`${selectedAddr?.id || "no-address"}`}
            customerAddress={formatFullAddress({
              ward_name: selectedAddr?.ward_name,
              district_name: selectedAddr?.district_name,
              province_name: selectedAddr?.province_name,
            })}
            weight={totalWeight}
            onFeeChange={(fee) => setShippingFee(fee)}
          />



          <ul className="divide-y">
            {cart.map((item) => (
              <li key={item.product_id} className="flex justify-between py-3 text-gray-700">
                <span>
                  {item.name}{" "}
                  <span className="text-sm text-gray-500">x {item.quantity}</span>
                </span>
                <span className="font-medium">
                  {(item.price * item.quantity).toLocaleString()} ₫
                </span>
              </li>
            ))}
          </ul>

          <CouponInput onApply={handleApplyCoupon} loading={couponLoading} />

          <div className="mt-6 border-t pt-4 space-y-2 font-bold text-lg">
            <div className="flex justify-between">
              <span>Tạm tính:</span>
              <span>{total.toLocaleString()} ₫</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Giảm giá ({couponCode}):</span>
                <span>-{discount.toLocaleString()} ₫</span>
              </div>
            )}

            <div className="flex justify-between text-green-700 border-t pt-2">
              <span>Tổng cộng:</span>
              <span>{finalTotal.toLocaleString()} ₫</span>
            </div>
          </div>

          <PaymentMethodSelector selectedMethod={paymentMethod} onChange={setPaymentMethod} />

          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="w-full mt-6 bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition text-lg font-medium disabled:opacity-50"
          >
            {loading ? "⏳ Đang xử lý..." : "Xác nhận đặt hàng"}
          </button>

          <InvoiceModal
            isOpen={showInvoice}
            onClose={() => setShowInvoice(false)}
            order={orderData}
          />
        </div>
      </div>
    </div>
  );
}
