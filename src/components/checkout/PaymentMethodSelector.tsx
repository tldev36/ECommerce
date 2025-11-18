"use client";

import { useState } from "react";
import { CreditCard, Wallet, Banknote, ChevronDown, ChevronUp, Check } from "lucide-react";

export type PaymentMethod = "cod" | "zalopay" | "momo";

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}

export default function PaymentMethodSelector({
  selectedMethod,
  onChange,
}: PaymentMethodSelectorProps) {
  const methods = [
    {
      id: "cod" as PaymentMethod,
      label: "Thanh toán khi nhận hàng",
      description: "Thanh toán bằng tiền mặt khi nhận hàng",
      icon: Banknote,
      iconColor: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-600",
      badge: "Phổ biến",
      badgeColor: "bg-green-100 text-green-700",
    },
    {
      id: "zalopay" as PaymentMethod,
      label: "Ví ZaloPay",
      description: "Thanh toán nhanh qua ví điện tử ZaloPay",
      icon: Wallet,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-600",
      // badge: "Giảm 5%",
      badgeColor: "bg-blue-100 text-blue-700",
    },
    // {
    //   id: "momo" as PaymentMethod,
    //   label: "Ví MoMo",
    //   description: "Thanh toán an toàn với MoMo",
    //   icon: Wallet,
    //   iconColor: "text-pink-600",
    //   bgColor: "bg-pink-50",
    //   borderColor: "border-pink-600",
    //   badge: null,
    //   badgeColor: "",
    // },
  ];

  const selectedMethodData = methods.find((m) => m.id === selectedMethod);

  return (
    <div className="space-y-3">
      {methods.map((method) => {
        const Icon = method.icon;
        const isSelected = selectedMethod === method.id;

        return (
          <button
            key={method.id}
            type="button"
            onClick={() => onChange(method.id)}
            className={`w-full text-left transition-all duration-200 ${
              isSelected
                ? `border-2 ${method.borderColor} ${method.bgColor} shadow-md`
                : "border-2 border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
            } rounded-xl p-4 relative group`}
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div
                className={`p-3 rounded-xl transition-colors ${
                  isSelected
                    ? method.bgColor
                    : "bg-gray-50 group-hover:bg-gray-100"
                }`}
              >
                <Icon
                  className={`w-6 h-6 ${
                    isSelected ? method.iconColor : "text-gray-400"
                  }`}
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3
                    className={`font-semibold ${
                      isSelected ? "text-gray-900" : "text-gray-700"
                    }`}
                  >
                    {method.label}
                  </h3>
                  {method.badge && (
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${method.badgeColor}`}
                    >
                      {method.badge}
                    </span>
                  )}
                </div>
                <p
                  className={`text-sm ${
                    isSelected ? "text-gray-600" : "text-gray-500"
                  }`}
                >
                  {method.description}
                </p>
              </div>

              {/* Check Icon */}
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  isSelected
                    ? `${method.borderColor} ${method.bgColor}`
                    : "border-gray-300 bg-white"
                }`}
              >
                {isSelected && (
                  <Check className={`w-4 h-4 ${method.iconColor}`} />
                )}
              </div>
            </div>

            {/* Additional Info for Selected */}
            {isSelected && method.id === "cod" && (
              <div className="mt-3 pt-3 border-t border-green-200">
                <div className="flex items-start gap-2">
                  <div className="bg-green-100 p-1 rounded mt-0.5">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  <div className="text-xs text-gray-600">
                    <p className="font-medium text-gray-700">Lưu ý:</p>
                    <ul className="list-disc list-inside mt-1 space-y-0.5">
                      <li>Vui lòng chuẩn bị tiền mặt vừa đủ</li>
                      <li>Kiểm tra hàng trước khi thanh toán</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {isSelected && method.id === "zalopay" && (
              <div className="mt-3 pt-3 border-t border-blue-200">
                <div className="flex items-start gap-2">
                  <div className="bg-blue-100 p-1 rounded mt-0.5">
                    <Check className="w-3 h-3 text-blue-600" />
                  </div>
                  <div className="text-xs text-gray-600">
                    <p className="font-medium text-gray-700">Ưu đãi:</p>
                    <ul className="list-disc list-inside mt-1 space-y-0.5">
                      {/* <li>Giảm ngay 5% cho đơn hàng đầu tiên</li> */}
                      <li>Thanh toán an toàn & bảo mật</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </button>
        );
      })}

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-2 pt-2">
        <div className="bg-gray-100 p-1.5 rounded-lg">
          <CreditCard className="w-4 h-4 text-gray-600" />
        </div>
        <p className="text-xs text-gray-500">
          Tất cả giao dịch được mã hóa và bảo mật
        </p>
      </div>
    </div>
  );
}