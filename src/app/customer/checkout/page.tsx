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
import type { PaymentMethod } from "@/types/order";
import { formatFullAddress } from "@/lib/formatFullAddress";
import { 
  MapPin, 
  ShoppingCart, 
  Plus, 
  Edit2, 
  Trash2,
  Package,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Loader2,
  ChevronRight
} from "lucide-react";

interface OrderResponse {
  success: boolean;
  message?: string;
  order?: any;
}

export default function CheckoutPage() {
  const { cart, clearCart, isLoggedIn, loadingUser } = useCart();
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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [addressLoading, setAddressLoading] = useState(true);

  const selectedAddr = addresses.find((a) => a.id === selectedAddress);

  // Tính tổng tiền
  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const finalTotal = useMemo(
    () => Math.max(total - discount + shippingFee, 0),
    [total, discount, shippingFee]
  );

  // Tổng trọng lượng (gram)
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

  // Fetch user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        setUser(data.user || null);
      } catch (err) {
        console.error("Error fetching user:", err);
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  // Fetch addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      setAddressLoading(true);
      try {
        const res = await fetch("/api/shipping-address", {
          method: "GET",
          credentials: "include",
        });
        const result = await res.json();
        if (res.ok) setAddresses(result.addresses || []);
      } catch (err) {
        console.error("Error fetching addresses:", err);
      } finally {
        setAddressLoading(false);
      }
    };
    fetchAddresses();
  }, []);

  // Auto select default address
  useEffect(() => {
    if (addresses.length > 0 && selectedAddress === null) {
      const defaultAddr = addresses.find((a) => a.default === true);
      setSelectedAddress(defaultAddr?.id ?? addresses[0].id ?? null);
    }
  }, [addresses, selectedAddress]);

  // Address handlers
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

  // Apply coupon
  const handleApplyCoupon = async (code: string) => {
    try {
      setCouponLoading(true);
      const res = await axios.post<{ 
        valid: boolean; 
        message?: string; 
        discount_percent?: number; 
        discount_amount?: number 
      }>("/api/coupons/validate", { code });
      
      const result = res.data;

      if (!result.valid) {
        alert(result.message || "Mã không hợp lệ hoặc đã hết hạn!");
        return;
      }

      if (result.discount_percent) {
        setDiscount((total * result.discount_percent) / 100);
      } else if (result.discount_amount) {
        setDiscount(result.discount_amount);
      }
      setCouponCode(code);
    } catch (err) {
      console.error("Error applying coupon:", err);
      alert("Không thể áp dụng mã giảm giá!");
    } finally {
      setCouponLoading(false);
    }
  };

  // Place order
  const handlePlaceOrder = async () => {
    if (!user) {
      alert("⚠️ Bạn cần đăng nhập trước khi đặt hàng!");
      return;
    }
    if (!selectedAddr) {
      alert("⚠️ Vui lòng chọn địa chỉ giao hàng!");
      return;
    }

    setLoading(true);

    const orderInfo = {
      user_id: user.id,
      shipping_address_id: selectedAddr.id,
      items: cart,
      total_amount: finalTotal,
      payment_method: paymentMethod,
      ship_amount: shippingFee,
      coupon_amount: discount,
      total_weight: totalWeight,
    };

    try {
      // ZaloPay payment
      if (paymentMethod === "zalopay") {
        const res = await axios.post<ZaloPayCreateOrderResponse>(
          "/api/zalopay/create",
          orderInfo
        );
        const data = res.data;
        if (data.return_code === 1 && data.order_url) {
          window.location.href = data.order_url;
        } else {
          alert("❌ Không thể tạo QR thanh toán ZaloPay");
        }
        return;
      }

      // COD payment
      const res = await axios.post<OrderResponse>("/api/orders", orderInfo, {
        withCredentials: true,
      });

      if (res.data.success) {
        setOrderData(res.data.order);
        setShowConfirmDialog(false);
        alert("🎉 Đặt hàng thành công!");
        clearCart();
        router.push("/customer/home");
      } else {
        alert(res.data.message || "❌ Lỗi khi tạo đơn hàng!");
      }
    } catch (err: any) {
      console.error("Error placing order:", err.response?.data || err.message);
      alert("⚠️ Không thể kết nối đến server! Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 px-4">
        <div className="text-center max-w-md">
          <div className="bg-white rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-lg">
            <ShoppingCart className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Giỏ hàng trống</h2>
          <p className="text-gray-600 mb-6">Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm!</p>
          <button
            onClick={() => router.push("/customer/home")}
            className="bg-green-600 text-white px-8 py-3 rounded-xl hover:bg-green-700 transition font-medium inline-flex items-center gap-2"
          >
            Tiếp tục mua sắm <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8 px-4 mt-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Thanh toán</h1>
          <p className="text-gray-600">Hoàn tất đơn hàng của bạn</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-10 gap-4">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
              <CheckCircle className="w-6 h-6" />
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700">Giỏ hàng</span>
          </div>
          <div className="w-16 h-1 bg-green-600"></div>
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
              2
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700">Thanh toán</span>
          </div>
          <div className="w-16 h-1 bg-gray-300"></div>
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-bold">
              3
            </div>
            <span className="ml-2 text-sm font-medium text-gray-500">Hoàn tất</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Address & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-green-100 p-2 rounded-lg">
                  <MapPin className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Địa chỉ giao hàng</h2>
              </div>

              {addressLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-24 bg-gray-200 rounded-xl"></div>
                    </div>
                  ))}
                </div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">Chưa có địa chỉ giao hàng</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="text-green-600 font-medium hover:underline inline-flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Thêm địa chỉ mới
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddress(addr.id!)}
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                        selectedAddress === addr.id
                          ? "border-green-600 bg-green-50 shadow-md"
                          : "border-gray-200 hover:border-green-400 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-800">{addr.recipient_name}</p>
                            {addr.default && (
                              <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">
                                Mặc định
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{addr.phone}</p>
                          <p className="text-sm text-gray-600">
                            {addr.detail_address}, {addr.ward_name}, {addr.district_name}, {addr.province_name}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingAddress(addr);
                            setShowForm(true);
                          }}
                          className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!showForm && (
                <button
                  onClick={() => {
                    setEditingAddress(null);
                    setShowForm(true);
                  }}
                  className="mt-4 text-green-600 font-medium hover:text-green-700 inline-flex items-center gap-2 hover:underline"
                >
                  <Plus className="w-5 h-5" />
                  Thêm địa chỉ mới
                </button>
              )}

              {showForm && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <AddressForm
                    editingAddress={editingAddress}
                    handleAddAddress={handleAddAddress}
                    handleUpdateAddress={handleUpdateAddress}
                    handleDeleteAddress={handleDeleteAddress}
                  />
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingAddress(null);
                    }}
                    className="mt-4 text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Đóng
                  </button>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Phương thức thanh toán</h2>
              </div>
              <PaymentMethodSelector 
                selectedMethod={paymentMethod} 
                onChange={setPaymentMethod} 
              />
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100 sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Đơn hàng</h2>
              </div>

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

              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.product_id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">Số lượng: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-800 text-sm">
                      {(item.price * item.quantity).toLocaleString()} ₫
                    </p>
                  </div>
                ))}
              </div>

              <CouponInput onApply={handleApplyCoupon} loading={couponLoading} />

              <div className="border-t border-gray-200 pt-4 mt-4 space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>Tạm tính:</span>
                  <span className="font-medium">{total.toLocaleString()} ₫</span>
                </div>

                <div className="flex justify-between text-gray-700">
                  <span>Phí vận chuyển:</span>
                  <span className="font-medium">{shippingFee.toLocaleString()} ₫</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá ({couponCode}):</span>
                    <span className="font-medium">-{discount.toLocaleString()} ₫</span>
                  </div>
                )}

                <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t border-gray-200">
                  <span>Tổng cộng:</span>
                  <span className="text-green-600">{finalTotal.toLocaleString()} ₫</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading || !selectedAddr}
                className="w-full mt-6 bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Xác nhận đặt hàng
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Bằng việc đặt hàng, bạn đồng ý với điều khoản sử dụng
              </p>
            </div>
          </div>
        </div>
      </div>

      <InvoiceModal
        isOpen={showInvoice}
        onClose={() => setShowInvoice(false)}
        order={orderData}
      />
    </div>
  );
}