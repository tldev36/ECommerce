"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export type PaymentMethod = "cod" | "zalopay" | "momo";

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
  totalAmount: number;
  orderData?: {
    user_id: number;
    shipping_address_id: number;
    items: any[];
    total_amount: number;
    payment_method: string;
  } | null;
}

export default function PaymentMethodSelector({
  selectedMethod,
  onChange,
  totalAmount,
  orderData,
}: PaymentMethodSelectorProps) {
  const [expanded, setExpanded] = useState(false);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  // 🔹 Khi chọn ZaloPay và có orderData => tự động tạo QR
  // useEffect(() => {
  //   if (selectedMethod === "zalopay" && orderData && orderData.items?.length) {
  //     console.log("📦 Nhận orderData từ CheckoutPage:", orderData);
  //     handleZaloPay(orderData);
  //   }
  // }, [selectedMethod, orderData]);

  const methods = [
    { id: "cod", label: "💵 Thanh toán khi nhận hàng (COD)" },
    { id: "zalopay", label: "🏦 Ví ZaloPay" },
    { id: "momo", label: "📱 Ví MoMo" },
  ];

  // 🚀 Hàm xử lý thanh toán ZaloPay
  // async function handleZaloPay(orderData: any) {
  //   try {
  //     setLoading(true);
  //     setQrUrl(null);

  //     console.log("📤 Gửi orderData sang /api/zalopay/create:", orderData);

  //     // Gửi toàn bộ dữ liệu đơn hàng sang API backend
  //     const res = await axios.post<ZaloPayCreateOrderResponse>("/api/zalopay/create", orderData, {
  //       headers: { "Content-Type": "application/json" },
  //     });

  //     const data = res.data;

  //     console.log("💳 Phản hồi từ API ZaloPay:", data);

  //     if (data?.return_code === 1 && data.order_url) {
  //       // Chuyển hướng sang ZaloPay
  //       window.location.href = data.order_url;
  //     } else {
  //       alert(data.return_message || "Không thể tạo QR thanh toán ZaloPay");
  //     }



  //   } catch (error) {
  //     console.error("❌ Lỗi tạo đơn ZaloPay:", error);
  //     alert("Đã xảy ra lỗi khi tạo đơn thanh toán ZaloPay");
  //   } finally {
  //     setLoading(false);
  //   }


  // }

  return (
    <div className="mt-8 bg-white shadow-md rounded-2xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-700">
          💳 Phương thức thanh toán
        </h2>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-blue-600 hover:underline"
        >
          {expanded ? "Ẩn bớt" : "Hiển thị"}
        </button>
      </div>

      <div className={`${expanded ? "block" : "hidden"} space-y-3`}>
        {methods.map((m) => (
          <label
            key={m.id}
            className={`flex items-center gap-3 border rounded-xl px-4 py-3 cursor-pointer transition ${selectedMethod === m.id
              ? "border-green-600 bg-green-50"
              : "border-gray-200 hover:border-green-400"
              }`}
          >
            <input
              type="radio"
              name="payment"
              checked={selectedMethod === m.id}
              onChange={() => onChange(m.id as PaymentMethod)} // ✅ chỉ đổi phương thức, không gọi API ngay
              className="accent-green-600"
            />
            <span className="text-gray-800 font-medium">{m.label}</span>
          </label>
        ))}

        {selectedMethod === "zalopay" && (
          <div className="mt-4 text-center">
            {loading && <p>⏳ Đang tạo đơn ZaloPay...</p>}

            {qrUrl && (
              <>
                <p className="text-gray-600 mb-2">
                  ⬇️ Nhấn nút bên dưới để thanh toán qua ZaloPay:
                </p>
                <a
                  href={qrUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition"
                >
                  Thanh toán ZaloPay
                </a>
                <p className="mt-3 text-lg font-semibold text-green-700">
                  💰 Tổng tiền: {totalAmount.toLocaleString("vi-VN")} ₫
                </p>
              </>
            )}
          </div>
        )}

      </div>

      {!expanded && (
        <p className="text-gray-500 text-sm italic">
          Đang chọn:{" "}
          <span className="text-green-700 font-medium">
            {methods.find((m) => m.id === selectedMethod)?.label ||
              "Chưa chọn phương thức"}
          </span>
        </p>
      )}
    </div>


  );
}