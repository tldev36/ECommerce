"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import CouponForm from "@/components/admin/CouponForm";
import { Coupon } from "@/types/coupon";
import Modal from "@/components/common/Modal";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([
    {
      id: 1,
      code: "SALE10",
      description: "Giảm 10% cho đơn hàng đầu tiên",
      discount_percent: 10,
      usage_limit: 100,
      valid_from: "2025-10-01",
      valid_until: "2025-12-31",
      active: true,
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);

  const handleAddCoupon = (coupon: Omit<Coupon, "id">) => {
    const newCoupon: Coupon = {
      ...coupon,
      id: Date.now(),
    };
    setCoupons((prev) => [...prev, newCoupon]);
    setShowModal(false);
  };

  const handleUpdateCoupon = (updated: Coupon) => {
    setCoupons((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setEditing(null);
    setShowModal(false);
  };

  const handleDelete = (id: number) => {
    if (confirm("Bạn có chắc muốn xóa mã này?")) {
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-16 px-6 py-10 bg-white rounded-2xl shadow">
      {/* 🔹 Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          🎟️ Quản lý mã giảm giá
        </h1>

        <button
          onClick={() => {
            setEditing(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          <FontAwesomeIcon icon={faPlus} />
          Thêm mã mới
        </button>
      </div>

      {/* 🧾 Danh sách mã */}
      <div className="overflow-x-auto mt-6">
        <table className="w-full border border-gray-200 text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-2 border">Mã</th>
              <th className="p-2 border">Mô tả</th>
              <th className="p-2 border">Giảm (%)</th>
              <th className="p-2 border">Giới hạn</th>
              <th className="p-2 border">Bắt đầu</th>
              <th className="p-2 border">Kết thúc</th>
              <th className="p-2 border">Trạng thái</th>
              <th className="p-2 border">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr
                key={c.id}
                className="text-center hover:bg-gray-50 transition"
              >
                <td className="border p-2 font-semibold">{c.code}</td>
                <td className="border p-2">{c.description || "-"}</td>
                <td className="border p-2">{c.discount_percent ?? 0}%</td>
                <td className="border p-2">{c.usage_limit ?? "-"}</td>
                <td className="border p-2">
                  {c.valid_from
                    ? new Date(c.valid_from).toLocaleDateString("vi-VN")
                    : "-"}
                </td>
                <td className="border p-2">
                  {c.valid_until
                    ? new Date(c.valid_until).toLocaleDateString("vi-VN")
                    : "-"}
                </td>
                <td className="border p-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      c.active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {c.active ? "Hoạt động" : "Tắt"}
                  </span>
                </td>
                <td className="border p-2 space-x-3">
                  <button
                    onClick={() => {
                      setEditing(c);
                      setShowModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                    title="Sửa mã"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id!)}
                    className="text-red-600 hover:text-red-800"
                    title="Xóa mã"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🌟 Modal hiển thị form thêm/sửa */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? "Cập nhật mã giảm giá" : "Thêm mã giảm giá mới"}
        width="max-w-2xl"
      >
        <CouponForm
          editing={editing}
          onAdd={handleAddCoupon}
          onUpdate={handleUpdateCoupon}
        />
      </Modal>
    </div>
  );
}
