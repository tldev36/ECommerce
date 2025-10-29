"use client";

import { useState } from "react";

export type PaymentMethod = "cod" | "zalopay" | "momo";

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}

export default function PaymentMethodSelector({
  selectedMethod,
  onChange,
}: PaymentMethodSelectorProps) {
  const [expanded, setExpanded] = useState(false);

  const methods = [
    { id: "cod", label: "💵 Thanh toán khi nhận hàng (COD)" },
    { id: "zalopay", label: "🏦 Ví ZaloPay" },
    { id: "momo", label: "📱 Ví MoMo" },
  ];

  return (
    <div className="mt-8 bg-white shadow-md rounded-2xl p-6">
      {/* Header */}
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

      {/* Danh sách phương thức */}
      <div className={`${expanded ? "block" : "hidden"} space-y-3`}>
        {methods.map((m) => (
          <label
            key={m.id}
            className={`flex items-center gap-3 border rounded-xl px-4 py-3 cursor-pointer transition ${
              selectedMethod === m.id
                ? "border-green-600 bg-green-50"
                : "border-gray-200 hover:border-green-400"
            }`}
          >
            <input
              type="radio"
              name="payment"
              checked={selectedMethod === m.id}
              onChange={() => onChange(m.id as PaymentMethod)}
              className="accent-green-600"
            />
            <span className="text-gray-800 font-medium">{m.label}</span>
          </label>
        ))}
      </div>

      {/* Hiển thị phương thức đã chọn */}
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
