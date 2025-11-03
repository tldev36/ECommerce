"use client";

import { useEffect, useState, useCallback, useRef } from "react";

interface ShippingFeeCalculatorProps {
  customerAddress?: string;
  weight?: number;
  onFeeChange?: (fee: number) => void;
}

export default function ShippingFeeCalculator({
  customerAddress: initialAddress = "",
  weight: initialWeight = 1000,
  onFeeChange,
}: ShippingFeeCalculatorProps) {
  const [customerAddress, setCustomerAddress] = useState(initialAddress);
  const [weight, setWeight] = useState(initialWeight);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const hasCalculated = useRef(false);
  const isInitialMount = useRef(true); // 👈 flag để bỏ qua effect đầu

  // 🧩 Gộp cập nhật prop thành 1 effect — nhưng bỏ qua lần mount đầu
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setCustomerAddress(initialAddress);
    setWeight(initialWeight);
  }, [initialAddress, initialWeight]);

  const handleCalculate = useCallback(async () => {
    if (!customerAddress.trim() || weight <= 0) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/shipping/fee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toAddress: customerAddress.trim(),
          weight: Number(weight),
        }),
      });

      const data = await res.json();
      if (!res.ok || data.code !== 200) {
        throw new Error(data.message || "Không thể tính phí vận chuyển!");
      }

      setResult(data.data);
      onFeeChange?.(data.data.fee || 0);
    } catch (err: any) {
      setResult({ error: err.message || "Đã xảy ra lỗi không xác định!" });
      onFeeChange?.(0);
    } finally {
      setLoading(false);
    }
  }, [customerAddress, weight, onFeeChange]);

  // 🚀 Auto tính phí khi thay đổi (chỉ 1 lần đầu + debounce)
  useEffect(() => {
  if (!customerAddress.trim() || weight <= 0) return;

  // ✅ Chỉ tính đúng 1 lần khi component mount
  if (!hasCalculated.current) {
    hasCalculated.current = true;
    handleCalculate();
  }
}, []); // 👈 Chỉ chạy khi component mount


  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg space-y-4">
      <h2 className="text-2xl font-bold text-center text-gray-800">
        🚚 Tính phí giao hàng GHN (Tự động)
      </h2>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Địa chỉ khách hàng
        </label>
        <input
          type="text"
          value={customerAddress}
          onChange={(e) => setCustomerAddress(e.target.value)}
          className="w-full border rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Cân nặng (gram)
        </label>
        <input
          type="number"
          value={weight}
          onChange={(e) => setWeight(Number(e.target.value))}
          className="w-full border rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        onClick={handleCalculate}
        disabled={loading}
        className="w-full py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? "Đang tính phí..." : "Tính lại phí vận chuyển"}
      </button>

      {result && (
        <div className="mt-4 p-4 border rounded-xl bg-gray-50">
          {result.error ? (
            <p className="text-red-500 text-center">{result.error}</p>
          ) : (
            <>
              <p className="font-medium text-gray-700">
                🏬 Cửa hàng: {result.shop?.name || "Không rõ"}
              </p>
              <p className="text-sm text-gray-600">{result.shop?.address}</p>
              <p className="mt-2 font-bold text-green-600 text-lg">
                💰 Phí giao hàng:{" "}
                {Number(result.fee || 0).toLocaleString("vi-VN")} đ
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
