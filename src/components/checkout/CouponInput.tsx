"use client";

import { useState } from "react";

interface CouponInputProps {
  onApply: (code: string) => void;
  loading?: boolean;
}

export default function CouponInput({ onApply, loading = false }: CouponInputProps) {
  const [code, setCode] = useState("");

  const handleApply = () => {
    if (!code.trim()) {
      alert("Vui lòng nhập mã giảm giá!");
      return;
    }
    onApply(code.trim());
  };

  return (
    <div className="flex gap-2 mt-4">
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Nhập mã giảm giá"
        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
      />
      <button
        type="button"
        onClick={handleApply}
        disabled={loading}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
      >
        Áp dụng
      </button>
    </div>
  );
}
