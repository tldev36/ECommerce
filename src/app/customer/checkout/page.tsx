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

export default function CheckoutPage() {
  const { cart, clearCart, isLoggedIn, user } = useCart();
  const router = useRouter();

  // 🧩 State quản lý
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

  const [paymentQR, setPaymentQR] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);


  const [showInvoice, setShowInvoice] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);

  const selectedAddr = addresses.find(a => a.id === selectedAddress);

  // 🧮 Tính tổng tiền
  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const finalTotal = useMemo(() => Math.max(total - discount + shippingFee, 0), [
    total,
    discount,
    shippingFee,
  ]);

  // 🧩 Lấy thông tin user ngay khi load trang
  // useEffect(() => {
  //   const fetchUser = async () => {
  //     try {
  //       const res = await fetch("/api/auth/me", { credentials: "include" });
  //       const data = await res.json();

  //       if (res.ok && data.user) {
  //         console.log("👤 User loaded:", data.user);
  //         // Nếu context chưa có user, có thể cập nhật tạm ở đây
  //         // (tuỳ cách bạn lưu user trong CartContext)
  //       } else {
  //         console.warn("⚠️ Không tìm thấy user hoặc chưa đăng nhập");
  //       }
  //     } catch (err) {
  //       console.error("❌ Lỗi khi lấy thông tin user:", err);
  //     }
  //   };

  //   fetchUser();
  // }, []);


  // 🧩 Log kiểm tra user & isLoggedIn
  useEffect(() => {

    fetch("/api/auth/me", { credentials: "include" })
      .then(r => r.json())
      .then(console.log);
    console.log("=== CHECKOUT DEBUG ===");
    console.log("isLoggedIn:", isLoggedIn);
    console.log("user:", user);
    console.log("cart:", cart);
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
    console.log("🛒 Danh sách giỏ hàng hiện tại:", cart);
    fetchAddresses();
  }, []);

  // 🔹 Tự chọn địa chỉ mặc định
  useEffect(() => {
    if (addresses.length > 0 && selectedAddress === null) {
      const defaultAddr = addresses.find((a) => a.default === true);
      setSelectedAddress(defaultAddr?.id ?? addresses[0].id ?? null);
    }
  }, [addresses, selectedAddress]);

  const handleDeleteAddress = (id: number) => {
    setAddresses(prev => prev.filter(addr => addr.id !== id));
    if (selectedAddress === id) setSelectedAddress(null);
    setEditingAddress(null);
    setShowForm(false);
  };


  // ➕ Thêm địa chỉ
  const handleAddAddress = (newAddress: Address) => {
    const newId =
      addresses.length > 0
        ? Math.max(...addresses.map((a) => a.id || 0)) + 1
        : 1;
    setAddresses([...addresses, { ...newAddress, id: newId }]);
    setShowForm(false);
  };

  // 📝 Cập nhật địa chỉ
  const handleUpdateAddress = (updated: Address) => {
    setAddresses((prev) =>
      prev.map((a) => (a.id === updated.id ? updated : a))
    );
    setEditingAddress(null);
    setShowForm(false);
  };

  // 🎟️ Áp dụng mã giảm giá
  const handleApplyCoupon = async (code: string) => {
    try {
      setCouponLoading(true);
      const res = await axios.post<CouponValidationResponse>("/api/coupons/validate", { code });

      const result = res.data;

      if (!result.valid) {
        alert(result.message || "❌ Mã không hợp lệ hoặc đã hết hạn!");
        return;
      }

      if (result.discount_percent) {
        setDiscount((total * result.discount_percent) / 100);
        setCouponCode(code);
        alert(`🎉 Áp dụng mã ${code}: giảm ${result.discount_percent}%`);
      } else if (result.discount_amount) {
        setDiscount(result.discount_amount);
        setCouponCode(code);
        alert(
          `🎉 Áp dụng mã ${code}: giảm ${result.discount_amount.toLocaleString()}₫`
        );
      } else {
        alert("❌ Mã không có giá trị giảm hợp lệ!");
      }
    } catch (err) {
      console.error("Lỗi khi áp dụng mã:", err);
      alert("⚠️ Không thể áp dụng mã giảm giá. Vui lòng thử lại.");
    } finally {
      setCouponLoading(false);
    }
  };

  // dữ liệu truyền cho modal hoá đơn
  // const orderDataFromTO = {
  //   user_id: user?.id,
  //   shipping_address_id: selectedAddress,
  //   items: cart,
  //   total_amount: total + shippingFee,
  //   payment_method: paymentMethod,
  // };

  // 🛍️ Xác nhận đặt hàng
  const handlePlaceOrder = async () => {
    if (!isLoggedIn || !user) {
      alert("⚠️ Bạn cần đăng nhập trước khi đặt hàng!");
      return;
    }

    if (!selectedAddress) {
      alert("⚠️ Vui lòng chọn địa chỉ giao hàng!");
      return;
    }

    const orderInfo = {
      user_id: user.id,
      shipping_address_id: selectedAddress,
      items: cart,
      total_amount: total + shippingFee,
      payment_method: paymentMethod,
    };

    const addr = selectedAddr;

    const parts = addr?.province_district_ward?.split(",").map(p => p.trim()) || [];

    // Giả sử parts = ["Phường Phú Cường", "Thành phố Thủ Dầu Một", "Bình Dương"]
    const ward_name = parts[0] || "";
    const district_name = parts[1] || "";
    const province_name = parts[2] || "";


    const orderInfoghn = {
      user_id: user.id,
      shipping_address_id: addr?.id,
      shipping_address: {
        name: addr?.recipient_name,
        phone: addr?.phone,
        address: addr?.detail_address, // ví dụ: "123 Đường ABC"
        ward_code: ward_name,    // mã phường GHN (vd: 440108)
        district_id: district_name, // mã quận GHN (vd: 1501)
      },
      items: cart.map((item) => ({
        product_id: item.product_id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        weight: item.unit || 200, // gram
        discount_percent: item.dicount_percent || 0,
      })),
      total_amount: total + shippingFee,
      payment_method: paymentMethod,
      coupon_id: couponCode || null,
    };

    // Nếu chọn MoMo
    if (paymentMethod === "momo") {
      try {
        const momoData = {
          amount: finalTotal,
          orderId: `ORDER-${Date.now()}`,
          orderInfo: `Thanh toán đơn hàng của ${user.full_name || user.email}`,
          items: cart.map((item) => ({
            id: item.product_id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          userInfo: {
            id: user.id,
            name: user.full_name,
            email: user.email,
            phone: user.phone,
          },
          deliveryInfo: {
            address: selectedAddr?.detail_address,
            ward: selectedAddr?.province_district_ward,
          },
        };

        const res = await axios.post<MoMoCreatePaymentResponse>("/api/momo/create", momoData, {
          headers: { "Content-Type": "application/json" },
        });

        if (res.data.payUrl) {
          window.location.href = res.data.payUrl;
        } else {
          alert("❌ MoMo không trả về payUrl, vui lòng kiểm tra log.");
        }
      } catch (err) {
        console.error("❌ Lỗi tạo thanh toán MoMo:", err);
        alert("⚠️ Không thể tạo thanh toán MoMo, xem log console để biết chi tiết.");
      }
      return;
    }



    // Nếu chọn ZaloPay
    if (paymentMethod === "zalopay") {
      try {
        console.log("💰 Gửi orderData sang ZaloPay:", orderInfo);
        const res = await axios.post<ZaloPayCreateOrderResponse>(
          "/api/zalopay/create",
          orderInfo,
          { headers: { "Content-Type": "application/json" } }
        );

        const data = res.data;
        console.log("💳 ZaloPay response:", data);

        if (data.return_code === 1 && data.order_url) {
          // 🔹 Chuyển hướng sang ZaloPay để thanh toán
          window.location.href = data.order_url;
        } else {
          alert(data.return_message || "❌ Không thể tạo QR thanh toán ZaloPay");
        }
      } catch (error) {
        console.error("❌ Lỗi tạo đơn ZaloPay:", error);
        alert("⚠️ Đã xảy ra lỗi khi tạo đơn thanh toán ZaloPay");
      }
      return; // Không tiếp tục đặt COD
    }

    // Nếu là COD hoặc các phương thức khác
    try {
      const res = await axios.post("/api/orders", orderInfoghn);
      const { success, order } = res.data as { success: boolean; order: any };

      if (success) {
        alert(`🎉 Đặt hàng thành công! Mã đơn: ${order.order_code}`);
        clearCart();
        router.push("/customer/home");
      } else {
        alert("❌ Lỗi khi tạo đơn hàng!");
      }
    } catch (error) {
      console.error(error);
      alert("⚠️ Lỗi khi kết nối đến server!");
    }
  };



  // 🧮 Tính tổng cân nặng (gram)
  const totalWeight = useMemo(() => {
    return cart.reduce((sum, item) => {
      let w = 0;

      if (typeof item.unit === "string") {
        // Lấy phần số (vd: "5000gram" -> 5000, "2.5kg" -> 2.5)
        const value = parseFloat(item.unit);
        const lower = item.unit.toLowerCase();

        if (lower.includes("kg")) {
          w = value * 1000; // đổi kg -> gram
        } else if (lower.includes("g")) {
          w = value; // gram thì giữ nguyên
        } else {
          // Nếu không có đơn vị, giả định là gram
          w = value;
        }
      } else if (typeof item.unit === "number") {
        w = item.unit; // Nếu DB là số rồi thì giữ nguyên
      }

      return sum + w * (item.quantity || 1);
    }, 0);
  }, [cart]);

  // useEffect(() => {
  //   if (user && selectedAddress && cart.length > 0) {
  //     setOrderData({
  //       user_id: user.id,
  //       shipping_address_id: selectedAddress,
  //       items: cart,
  //       total_amount: total + shippingFee,
  //       payment_method: paymentMethod,
  //     });
  //   }
  // }, [user, selectedAddress, cart, total, shippingFee, paymentMethod]);

  return (
    <div className="mt-20 max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
        🛒 Thanh toán
      </h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* 🧩 Cột trái - Địa chỉ */}
        <div className="bg-white shadow-md rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            📍 Địa chỉ giao hàng
          </h2>

          {addresses.length === 0 ? (
            <p className="text-gray-500 italic mb-3">
              Chưa có địa chỉ. Hãy thêm mới!
            </p>
          ) : (
            <ul className="space-y-4">
              {addresses.map((addr) => {
                // đảm bảo id luôn có kiểu number
                const id = addr.id ?? 0;

                return (
                  <li
                    key={id}
                    onClick={() => setSelectedAddress(id)}
                    className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-xl cursor-pointer transition 
              ${selectedAddress === id
                        ? "border-green-600 bg-green-50"
                        : "border-gray-200 hover:border-green-400"
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="address"
                        className="mt-1 cursor-pointer"
                        checked={selectedAddress === id}
                        onChange={() => setSelectedAddress(id)}
                      />
                      <div>
                        <p className="font-medium text-gray-800">
                          {addr.recipient_name} - {addr.phone}
                        </p>
                        <p className="text-sm text-gray-600">
                          {addr.detail_address}, {addr.province_district_ward}{" "}
                          {addr.default && (
                            <span className="ml-2 text-xs text-white bg-green-600 px-2 py-0.5 rounded-full">
                              Mặc định
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation(); // tránh chọn radio khi bấm "Sửa"
                        setEditingAddress(addr);
                        setShowForm(true);
                      }}
                      className="text-blue-600 text-sm hover:underline font-medium"
                    >
                      📝 Sửa
                    </button>
                  </li>
                );
              })}
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


        {/* 🧩 Cột phải - Giỏ hàng */}
        <div className="bg-white shadow-md rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            🛍️ Giỏ hàng của bạn
          </h2>


          {/* Sau khi người dùng chọn địa chỉ */}
          <ShippingFeeCalculator
            key={`${selectedAddress}-${addresses.length}-${selectedAddr?.province_district_ward || ""}`}
            customerAddress={selectedAddr?.province_district_ward || ""}
            weight={totalWeight}
            onFeeChange={(fee) => setShippingFee(fee)}
          />


          {/* 🛒 Danh sách sản phẩm */}

          <ul className="divide-y">
            {cart.map((item) => (
              <li
                key={item.product_id}
                className="flex justify-between py-3 text-gray-700"
              >
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

          {/* 🎟️ Nhập mã giảm giá */}
          <CouponInput onApply={handleApplyCoupon} loading={couponLoading} />

          {/* 🧮 Tổng tiền */}
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

          {/* 💳 Chọn phương thức thanh toán */}
          <PaymentMethodSelector
            selectedMethod={paymentMethod}
            onChange={setPaymentMethod}
          />

          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="w-full mt-6 bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition text-lg font-medium disabled:opacity-50"
          >
            {loading ? "⏳ Đang xử lý..." : "Xác nhận đặt hàng"}
          </button>

          {/* 🧾 Hiển thị modal phiếu bán hàng */}
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
