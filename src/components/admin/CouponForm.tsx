"use client";

import { useEffect, useState } from "react";
import { Coupon } from "@/types/coupon";

interface Props {
  editing?: Coupon | null;
  onAdd: (coupon: Coupon) => void;
  onUpdate: (coupon: Coupon) => void;
}

// 🛠️ Helper: Chuyển ISO String (2025-12-01T00:00:00Z) -> YYYY-MM-DD để input date hiểu
const formatDateForInput = (dateString?: string | Date | null) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
};

export default function CouponForm({ editing, onAdd, onUpdate }: Props) {
  const [form, setForm] = useState<Omit<Coupon, "id">>({
    code: "",
    description: "",
    discount_percent: null,
    discount_amount: null,
    usage_limit: undefined,
    valid_from: "",
    valid_until: "",
    status: true,
  });

  const [loading, setLoading] = useState(false);

  // 🟡 Load form khi bấm sửa
  useEffect(() => {
    if (editing) {
      setForm({
        code: editing.code,
        description: editing.description || "",
        discount_percent: editing.discount_percent ?? null,
        discount_amount: editing.discount_amount ?? null,
        usage_limit: editing.usage_limit,
        // ✅ Fix lỗi ngày tháng không hiện lên input
        valid_from: formatDateForInput(editing.valid_from),
        valid_until: formatDateForInput(editing.valid_until),
        // ✅ Xử lý status: database có thể trả về "1", 1, true...
        status: editing.status === true,
      });
    } else {
      handleReset();
    }
  }, [editing]);

  const handleReset = () => {
    setForm({
        code: "",
        description: "",
        discount_percent: null,
        discount_amount: null,
        usage_limit: undefined,
        valid_from: "",
        valid_until: "",
        status: true,
      });
  }

  // 🟢 Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) {
      alert("❌ Mã giảm giá không được để trống!");
      return;
    }

    // Validation: Không nên nhập cả 2 loại giảm giá
    if (form.discount_percent && form.discount_amount) {
        alert("⚠️ Chỉ nên nhập một trong hai: % Giảm giá hoặc Tiền giảm cố định.");
        return;
    }

    setLoading(true);

    try {
      const url = editing ? `/api/admin/coupons/${editing.id}` : "/api/coupons";
      const method = editing ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("API Error");

      const savedCoupon = await res.json();

      if (editing) {
        onUpdate(savedCoupon);
      } else {
        onAdd(savedCoupon);
        handleReset(); // Reset form sau khi thêm mới thành công
      }
      
    } catch (err) {
      console.error("❌ Lỗi khi lưu coupon:", err);
      alert("Không thể lưu mã giảm giá. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-gray-200 p-6 rounded-lg shadow-sm bg-gray-50 mb-6"
    >
      <h2 className="text-xl font-semibold mb-4 text-gray-700">
        {editing ? "✏️ Cập nhật mã giảm giá" : "➕ Thêm mã giảm giá mới"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CODE */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Mã giảm giá <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} // Tự động viết hoa
            className="mt-1 w-full border rounded-md p-2 uppercase font-bold tracking-wider"
            placeholder="VD: SALE10"
            required
          />
        </div>

        {/* LIMIT */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Giới hạn số lần dùng
          </label>
          <input
            type="number"
            value={form.usage_limit ?? ""}
            onChange={(e) =>
              setForm({ ...form, usage_limit: e.target.value ? Number(e.target.value) : undefined })
            }
            className="mt-1 w-full border rounded-md p-2"
            min={1}
            placeholder="Không giới hạn nếu để trống"
          />
        </div>

        {/* DISCOUNT (%) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Giảm giá (%)
          </label>
          <input
            type="number"
            value={form.discount_percent ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                discount_percent: e.target.value === "" ? null : Number(e.target.value),
                discount_amount: e.target.value !== "" ? null : form.discount_amount // Reset amount nếu nhập percent
              })
            }
            className="mt-1 w-full border rounded-md p-2"
            min={0}
            max={100}
            disabled={!!form.discount_amount} // Disable nếu đang nhập amount
            placeholder={!!form.discount_amount ? "Đang nhập tiền giảm" : "VD: 10"}
          />
        </div>

        {/* DISCOUNT AMOUNT */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Giảm tiền cố định (₫)
          </label>
          <input
            type="number"
            value={form.discount_amount ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                discount_amount: e.target.value === "" ? null : Number(e.target.value),
                discount_percent: e.target.value !== "" ? null : form.discount_percent // Reset percent nếu nhập amount
              })
            }
            className="mt-1 w-full border rounded-md p-2"
            min={0}
            disabled={!!form.discount_percent} // Disable nếu đang nhập percent
             placeholder={!!form.discount_percent ? "Đang nhập % giảm" : "VD: 50000"}
          />
        </div>

        {/* DESCRIPTION */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Mô tả
          </label>
          <textarea
            value={form.description ?? ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="mt-1 w-full border rounded-md p-2 h-20"
            placeholder="Ví dụ: Giảm 10% cho đơn hàng từ 200k..."
          />
        </div>

        {/* VALID FROM */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Ngày bắt đầu
          </label>
          <input
            type="date"
            // Giá trị ở đây phải là YYYY-MM-DD
            value={String(form.valid_from)} 
            onChange={(e) => setForm({ ...form, valid_from: e.target.value })}
            className="mt-1 w-full border rounded-md p-2"
          />
        </div>

        {/* VALID UNTIL */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Ngày kết thúc
          </label>
          <input
            type="date"
             // Giá trị ở đây phải là YYYY-MM-DD
            value={String(form.valid_until)}
            onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
            className="mt-1 w-full border rounded-md p-2"
          />
        </div>

        {/* STATUS */}
        <div className="col-span-2 flex items-center gap-2 mt-2 bg-white p-3 rounded border">
          <input
            type="checkbox"
            id="status"
            checked={!!form.status}
            onChange={(e) => setForm({ ...form, status: e.target.checked })}
            className="h-5 w-5 text-green-600 rounded focus:ring-green-500"
          />
          <label htmlFor="status" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
            Kích hoạt mã giảm giá này ngay lập tức
          </label>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          disabled={loading}
          onClick={handleReset}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
        >
          Làm mới
        </button>

        <button
          type="submit"
          disabled={loading}
          className={`px-6 py-2 text-white font-medium rounded-md transition shadow-sm ${loading
              ? "bg-green-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
            }`}
        >
          {loading ? "Đang xử lý..." : editing ? "Lưu thay đổi" : "Thêm mới"}
        </button>
      </div>
    </form>
  );
}