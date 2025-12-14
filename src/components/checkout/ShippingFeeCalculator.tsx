"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Truck, Package, MapPin, AlertCircle, CheckCircle, Loader2 } from "lucide-react";

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
  const isInitialMount = useRef(true);

  // Update props when changed
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

  // Auto calculate on mount
  useEffect(() => {
    if (!customerAddress.trim() || weight <= 0) return;

    if (!hasCalculated.current) {
      hasCalculated.current = true;
      handleCalculate();
    }
  }, []);

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-orange-100 p-1.5 rounded-lg">
          <Truck className="w-4 h-4 text-orange-600" />
        </div>
        <h3 className="text-sm font-semibold text-gray-700">Phí vận chuyển</h3>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900">Đang tính phí vận chuyển...</p>
            <p className="text-xs text-blue-600 mt-0.5">Vui lòng đợi trong giây lát</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {result?.error && !loading && (
        <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-200">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-900">Không thể tính phí</p>
            <p className="text-xs text-red-600 mt-1">{result.error}</p>
          </div>
        </div>
      )}

      {/* Success State */}
      {result && !result.error && !loading && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 overflow-hidden">
          {/* Shop Info */}
          <div className="p-4 border-b border-green-200">
            <div className="flex items-start gap-3">
              <div className="bg-green-100 p-2 rounded-lg flex-shrink-0">
                <MapPin className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {result.shop?.name || "Cửa hàng"}
                </p>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                  {result.shop?.address || "Lê Hồng Phong, Thủ Dầu Một, Hồ Chí Minh"}
                </p>
              </div>
            </div>
          </div>

          {/* Shipping Details */}
          <div className="p-4 space-y-3">
            {/* Weight */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Khối lượng:</span>
              </div>
              <span className="text-sm font-medium text-gray-800">
                {weight >= 1000 ? `${(weight / 1000).toFixed(2)} kg` : `${weight} g`}
              </span>
            </div>

            {/* Destination */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 flex-shrink-0">
                <Truck className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Giao đến:</span>
              </div>
              <span className="text-sm font-medium text-gray-800 text-right line-clamp-2">
                {customerAddress || "Chưa có địa chỉ"}
              </span>
            </div>

            {/* Fee */}
            <div className="pt-3 border-t border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-green-600 p-1 rounded">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">Phí vận chuyển:</span>
                </div>
                <span className="text-lg font-bold text-green-600">
                  {Number(result.fee || 0).toLocaleString("vi-VN")} ₫
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Phí đã bao gồm bảo hiểm hàng hóa
              </p>
            </div>
          </div>
        </div>
      )}

      {/* No Address State */}
      {!customerAddress && !loading && !result && (
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <AlertCircle className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">Chưa có địa chỉ giao hàng</p>
            <p className="text-xs text-gray-500 mt-0.5">Vui lòng chọn địa chỉ để tính phí</p>
          </div>
        </div>
      )}
    </div>
  );
}