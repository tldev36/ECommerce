"use client";

import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import AddressForm from "@/components/checkout/AddressForm";
import { Address } from "@/types/address";

export default function CheckoutPage() {
  const { cart, clearCart, isLoggedIn } = useCart();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await fetch("/api/shipping-address", {
          method: "GET",
          credentials: "include", // gửi cookie JWT nếu cần
        });
        const result = await res.json();

        if (!res.ok) {
          console.error("Lỗi fetch địa chỉ:", result.error);
          return;
        }

        setAddresses(result.addresses || []);
      } catch (err) {
        console.error("Lỗi fetch địa chỉ:", err);
      }
    };

    fetchAddresses();
  }, []);



  // 🟢 Chọn địa chỉ mặc định lần đầu
  useEffect(() => {
    if (addresses.length > 0 && selectedAddress === null) {
      const defaultAddr = addresses.find(a => a.default === true);
      setSelectedAddress(defaultAddr?.id ?? addresses[0].id ?? null);
    }
  }, [addresses, selectedAddress]);

  // 🟢 Thêm địa chỉ mới
  const handleAddAddress = (newAddress: Address) => {
    const newId = addresses.length > 0 ? Math.max(...addresses.map(a => a.id || 0)) + 1 : 1;
    const added = { ...newAddress, id: newId };
    setAddresses([...addresses, added]);
    setShowForm(false);
  };

  // 🟢 Cập nhật địa chỉ
  const handleUpdateAddress = (updatedAddress: Address) => {
    setAddresses(prev =>
      prev.map(a => (a.id === updatedAddress.id ? updatedAddress : a))
    );
    setEditingAddress(null);
    setShowForm(false);
  };


  // 🟢 Đặt hàng
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


  // 🧱 UI
  return (
    <div className="mt-20 max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
        🛒 Thanh toán
      </h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Cột trái - Địa chỉ */}
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
                className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-xl cursor-pointer transition ${selectedAddress === addr.id
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
                      {" "}
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

                {/* 📝 Nút sửa */}
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

          {/* Nút mở form */}
          <button
            className="mt-4 text-green-600 font-medium hover:underline"
            onClick={() => {
              setEditingAddress(null);
              setShowForm(!showForm);
            }}
          >
            ➕ {showForm ? "Đóng form" : "Thêm địa chỉ mới"}
          </button>

          {/* Form thêm/sửa */}
          {showForm && (
            <AddressForm
              editingAddress={editingAddress}
              handleAddAddress={handleAddAddress}
              handleUpdateAddress={handleUpdateAddress}
            />
          )}
        </div>


        {/* Cột phải - Giỏ hàng */}
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

          <div className="mt-6 border-t pt-4 flex justify-between font-bold text-lg">
            <span>Tổng cộng:</span>
            <span className="text-green-600">
              {cart
                .reduce((sum, item) => sum + item.price * item.quantity, 0)
                .toLocaleString()}{" "}
              ₫
            </span>
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
