"use client";

import { useEffect, useState } from "react";
import { Coupon } from "@/types/coupon";

interface Props {
  editing?: Coupon | null;
  onAdd: (coupon: Coupon) => void;
  onUpdate: (coupon: Coupon) => void;
}

export default function CouponForm({ editing, onAdd, onUpdate }: Props) {
  const [form, setForm] = useState<Omit<Coupon, "id">>({
    code: "",
    description: "",
    discount_percent: null,
    discount_amount: null, // 🆕 thêm trường
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
        discount_amount: editing.discount_amount ?? null, // 🆕 load thêm giá trị
        usage_limit: editing.usage_limit,
        valid_from: editing.valid_from || "",
        valid_until: editing.valid_until || "",
        status: editing.status ?? true,
      });
    } else {
      setForm({
        code: "",
        description: "",
        discount_percent: null,
        discount_amount: null, // 🆕 reset luôn
        usage_limit: undefined,
        valid_from: "",
        valid_until: "",
        status: true,
      });
    }
  }, [editing]);

  // 🟢 Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) {
      alert("❌ Mã giảm giá không được để trống!");
      return;
    }

    setLoading(true);

    try {
      if (editing) {
        const res = await fetch(`/api/coupons/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const updated = await res.json();
        onUpdate(updated);
      } else {
        const res = await fetch("/api/coupons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const newCoupon = await res.json();
    
        console.log("📦 Dữ liệu nhận từ frontend:", newCoupon);
        onAdd(newCoupon);
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
            Mã giảm giá
          </label>
          <input
            type="text"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            className="mt-1 w-full border rounded-md p-2"
            placeholder="VD: SALE10"
            required
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
                discount_percent:
                  e.target.value === "" ? null : Number(e.target.value),
              })
            }
            className="mt-1 w-full border rounded-md p-2"
            min={0}
            max={100}
            placeholder="Nhập phần trăm giảm giá (vd: 10)"
          />
        </div>

        {/* 🆕 DISCOUNT AMOUNT */}
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
                discount_amount:
                  e.target.value === "" ? null : Number(e.target.value),
              })
            }
            className="mt-1 w-full border rounded-md p-2"
            min={0}
            placeholder="Nhập số tiền giảm (vd: 50000)"
          />
        </div>

        {/* LIMIT */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Giới hạn sử dụng
          </label>
          <input
            type="number"
            value={form.usage_limit ?? ""}
            onChange={(e) =>
              setForm({ ...form, usage_limit: Number(e.target.value) })
            }
            className="mt-1 w-full border rounded-md p-2"
            min={1}
          />
        </div>

        {/* DESCRIPTION */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Mô tả
          </label>
          <input
            type="text"
            value={form.description ?? ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="mt-1 w-full border rounded-md p-2"
            placeholder="Ví dụ: Giảm 10% hoặc 50.000₫ cho đơn đầu tiên"
          />
        </div>

        {/* VALID FROM */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Ngày bắt đầu
          </label>
          <input
            type="date"
            value={form.valid_from ?? ""}
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
            value={form.valid_until ?? ""}
            onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
            className="mt-1 w-full border rounded-md p-2"
          />
        </div>

        {/* STATUS */}
        <div className="col-span-2 flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            checked={!!form.status}
            onChange={(e) => setForm({ ...form, status: e.target.checked })}
            className="h-4 w-4"
          />
          <label className="text-sm text-gray-700">
            Mã giảm giá đang hoạt động
          </label>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="reset"
          disabled={loading}
          onClick={() =>
            setForm({
              code: "",
              description: "",
              discount_percent: null,
              discount_amount: null, // 🆕 reset thêm trường này
              usage_limit: undefined,
              valid_from: "",
              valid_until: "",
              status: true,
            })
          }
          className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
        >
          Reset
        </button>

        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 text-white rounded-md transition ${loading
              ? "bg-green-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
            }`}
        >
          {loading ? "Đang lưu..." : editing ? "Lưu thay đổi" : "Thêm mới"}
        </button>
      </div>
    </form>
  );
}
