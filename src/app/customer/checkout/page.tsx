"use client";

import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import AddressForm from "@/components/checkout/AddressForm";
import { Address } from "@/types/address";
import CouponInput from "@/components/checkout/CouponInput"; // 🟢 import component

export default function CheckoutPage() {
  const { cart, clearCart, isLoggedIn } = useCart();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const router = useRouter();
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

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

  useEffect(() => {
    if (addresses.length > 0 && selectedAddress === null) {
      const defaultAddr = addresses.find(a => a.default === true);
      setSelectedAddress(defaultAddr?.id ?? addresses[0].id ?? null);
    }
  }, [addresses, selectedAddress]);

  const handleAddAddress = (newAddress: Address) => {
    const newId = addresses.length > 0 ? Math.max(...addresses.map(a => a.id || 0)) + 1 : 1;
    const added = { ...newAddress, id: newId };
    setAddresses([...addresses, added]);
    setShowForm(false);
  };

  const handleUpdateAddress = (updatedAddress: Address) => {
    setAddresses(prev =>
      prev.map(a => (a.id === updatedAddress.id ? updatedAddress : a))
    );
    setEditingAddress(null);
    setShowForm(false);
  };

  // 🟢 Hàm áp dụng mã giảm giá
  const handleApplyCoupon = async (code: string) => {
    try {
      setCouponLoading(true);
      // Giả lập API kiểm tra mã giảm giá
      await new Promise(res => setTimeout(res, 800));

      // 🔹 Demo: mã "GIAM10" giảm 10%, "FREESHIP" giảm 30000₫
      if (code === "GIAM10") {
        setDiscount(total * 0.1);
        setCouponCode(code);
        alert("🎉 Áp dụng mã GIAM10: giảm 10%");
      } else if (code === "FREESHIP") {
        setDiscount(30000);
        setCouponCode(code);
        alert("🚚 Áp dụng mã FREESHIP: giảm 30.000₫");
      } else {
        alert("❌ Mã không hợp lệ hoặc đã hết hạn!");
      }
    } catch (err) {
      alert("Đã có lỗi xảy ra khi áp dụng mã!");
    } finally {
      setCouponLoading(false);
    }
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const finalTotal = Math.max(total - discount, 0);

  const handlePlaceOrder = () => {
    if (!selectedAddress) {
      alert("❌ Vui lòng chọn địa chỉ giao hàng!");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      alert("🎉 Đặt hàng thành công (mô phỏng)!");
      clearCart();
      router.push("/orders");
    }, 1000);
  };

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

          {addresses.length === 0 && (
            <p className="text-gray-500 italic mb-3">
              Chưa có địa chỉ. Hãy thêm mới!
            </p>
          )}

          <ul className="space-y-4">
            {addresses.map((addr) => (
              <li
                key={addr.id}
                className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-xl cursor-pointer transition ${
                  selectedAddress === addr.id
                    ? "border-green-600 bg-green-50"
                    : "border-gray-200 hover:border-green-400"
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="address"
                    className="mt-1"
                    checked={selectedAddress === addr.id}
                    onChange={() => setSelectedAddress(addr.id ?? null)}
                  />
                  <div>
                    <p className="font-medium text-gray-800">
                      {addr.recipient_name} - {addr.phone}
                    </p>
                    <p className="text-sm text-gray-600">
                      {addr.detail_address}, {addr.province_district_ward}{" "}
                      {addr.default === true && (
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
                    e.stopPropagation();
                    setEditingAddress(addr);
                    setShowForm(true);
                  }}
                  className="text-blue-600 text-sm hover:underline font-medium"
                >
                  📝 Sửa
                </button>
              </li>
            ))}
          </ul>

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
            />
          )}
        </div>

        {/* 🧩 Cột phải - Giỏ hàng */}
        <div className="bg-white shadow-md rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            🛍️ Giỏ hàng của bạn
          </h2>

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

          {/* 🧾 Nhập mã giảm giá */}
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

          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="w-full mt-6 bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition text-lg font-medium disabled:opacity-50"
          >
            {loading ? "⏳ Đang xử lý..." : "Xác nhận đặt hàng"}
          </button>
        </div>
      </div>
    </div>
  );
}
