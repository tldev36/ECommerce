"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";

export default function CheckoutPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const [cartItems] = useState([
    {
      id: 1,
      name: "Gạo ST25 - Thơm ngon đặc sản",
      price: 32000,
      quantity: 2,
      image: "/images/apple.jpg",
      discount: 10,
    },
    {
      id: 2,
      name: "Gạo Lài Sữa",
      price: 28000,
      quantity: 1,
      image: "/images/rice.jpg",
      discount: 0,
    },
  ]);

  const calcPrice = (item: any) => {
    if (item.discount && item.discount > 0) {
      return item.price - (item.price * item.discount) / 100;
    }
    return item.price;
  };

  const totalPrice = cartItems.reduce(
    (total, item) => total + calcPrice(item) * item.quantity,
    0
  );

  const handleOrder = () => {
    if (!name || !address || !phone) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    setShowSuccess(true);
    setTimeout(() => {
      router.push("/");
    }, 3000);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 mt-16 relative">
      <h1 className="text-2xl font-bold mb-6">Thanh toán</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form thông tin */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Thông tin giao hàng</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Họ và tên</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Số điện thoại</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                  placeholder="0123 456 789"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Địa chỉ</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ghi chú</label>
                <textarea
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                  rows={3}
                  placeholder="Yêu cầu giao hàng..."
                />
              </div>
            </form>
          </div>

          <div className="border rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Phương thức thanh toán</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                <input type="radio" name="payment" defaultChecked />
                <span>Thanh toán khi nhận hàng (COD)</span>
              </label>
              <label className="flex items-center gap-3 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                <input type="radio" name="payment" />
                <span>Chuyển khoản ngân hàng</span>
              </label>
              <label className="flex items-center gap-3 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                <input type="radio" name="payment" />
                <span>Thẻ tín dụng / Ghi nợ</span>
              </label>
            </div>
          </div>
        </div>

        {/* Tóm tắt đơn hàng */}
        <div className="border rounded-lg p-6 shadow-sm h-fit">
          <h2 className="text-lg font-semibold mb-4">Đơn hàng</h2>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={60}
                  height={60}
                  className="rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-sm font-medium">{item.name}</h3>
                  <p className="text-gray-500 text-sm">x{item.quantity}</p>
                </div>
                <span className="text-red-500 font-semibold">
                  {calcPrice(item).toLocaleString()}₫
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t pt-4">
            <div className="flex justify-between mb-2">
              <span>Tạm tính:</span>
              <span>{totalPrice.toLocaleString()}₫</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Phí vận chuyển:</span>
              <span>30,000₫</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Tổng cộng:</span>
              <span className="text-red-500">
                {(totalPrice + 30000).toLocaleString()}₫
              </span>
            </div>
            <button
              onClick={handleOrder}
              className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium">
              Đặt hàng
            </button>
          </div>
        </div>
      </div>

      {/* Popup đẹp */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-8 w-96 text-center animate-fadeIn">
            <FontAwesomeIcon
              icon={faCheckCircle}
              className="text-green-500 text-6xl mx-auto mb-4"
            />
            <h2 className="text-2xl font-bold mb-2">Đặt hàng thành công!</h2>
            <p className="text-gray-600 mb-4">
              Cảm ơn bạn đã mua hàng. Chúng tôi sẽ liên hệ sớm.
            </p>
          </div>
        </div>

      )}

      {/* Animation Tailwind */}
      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
