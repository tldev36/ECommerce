"use client";

import { useEffect, useState } from "react";
import { Coupon } from "@/types/coupon";


interface Props {
  editing?: Coupon | null;
  onAdd: (coupon: Omit<Coupon, "id">) => void;
  onUpdate: (coupon: Coupon) => void;
}

export default function CouponForm({ editing, onAdd, onUpdate }: Props) {
  const [form, setForm] = useState<Omit<Coupon, "id">>({
    code: "",
    description: "",
    discount_percent: 0,
    usage_limit: undefined,
    valid_from: "",
    valid_until: "",
    active: true,
  });

  // Khi bấm "Sửa", load dữ liệu vào form
  useEffect(() => {
    if (editing) {
      setForm({
        code: editing.code || "",
        description: editing.description || "",
        discount_percent: editing.discount_percent || 0,
        usage_limit: editing.usage_limit,
        valid_from: editing.valid_from || "",
        valid_until: editing.valid_until || "",
        active: editing.active ?? true,
      });
    } else {
      setForm({
        code: "",
        description: "",
        discount_percent: 0,
        usage_limit: undefined,
        valid_from: "",
        valid_until: "",
        active: true,
      });
    }
  }, [editing]);

  // 🟢 Submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) {
      alert("Mã giảm giá không được để trống!");
      return;
    }

    if (editing) {
      onUpdate({ ...form, id: editing.id! });
    } else {
      onAdd(form);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-gray-200 p-6 rounded-lg shadow-sm bg-gray-50 mb-6"
    >
      <h2 className="text-xl font-semibold mb-4 text-gray-700">
        {editing ? "✏️ Chỉnh sửa mã giảm giá" : "➕ Thêm mã giảm giá mới"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mã giảm giá */}
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

        {/* Phần trăm giảm */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Giảm giá (%)
          </label>
          <input
            type="number"
            value={form.discount_percent ?? ""}
            onChange={(e) =>
              setForm({ ...form, discount_percent: Number(e.target.value) })
            }
            className="mt-1 w-full border rounded-md p-2"
            min={0}
            max={100}
          />
        </div>

        {/* Giới hạn sử dụng */}
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

        {/* Mô tả */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Mô tả
          </label>
          <input
            type="text"
            value={form.description ?? ""}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            className="mt-1 w-full border rounded-md p-2"
            placeholder="Ví dụ: Giảm 10% cho đơn đầu tiên"
          />
        </div>

        {/* Ngày bắt đầu */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Bắt đầu
          </label>
          <input
            type="date"
            value={form.valid_from ?? ""}
            onChange={(e) =>
              setForm({ ...form, valid_from: e.target.value })
            }
            className="mt-1 w-full border rounded-md p-2"
          />
        </div>

        {/* Ngày kết thúc */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Kết thúc
          </label>
          <input
            type="date"
            value={form.valid_until ?? ""}
            onChange={(e) =>
              setForm({ ...form, valid_until: e.target.value })
            }
            className="mt-1 w-full border rounded-md p-2"
          />
        </div>

        {/* Trạng thái */}
        <div className="col-span-2 flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
            className="h-4 w-4"
          />
          <label className="text-sm text-gray-700">
            Mã giảm giá đang hoạt động
          </label>
        </div>
      </div>

      {/* Nút hành động */}
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={() =>
            setForm({
              code: "",
              description: "",
              discount_percent: 0,
              usage_limit: undefined,
              valid_from: "",
              valid_until: "",
              active: true,
            })
          }
          className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
        >
          Reset
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
        >
          {editing ? "Lưu thay đổi" : "Thêm mới"}
        </button>
      </div>
    </form>
  );
}
