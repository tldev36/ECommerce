"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import CouponForm from "@/components/admin/CouponForm";
import { Coupon } from "@/types/coupon";
import Modal from "@/components/common/Modal";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);

  // 🟢 Lấy danh sách từ API bằng axios
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await axios.get<Coupon[]>("/api/coupons");
        // đảm bảo luôn là mảng (dù API trả về null, undefined, hoặc object)
        setCoupons(Array.isArray(res.data) ? res.data : []);
      } catch (err: any) {
        console.error("❌ Lỗi khi tải coupons:", err);
        setCoupons([]); // luôn gán mảng trống để không lỗi render
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  // 🟢 Thêm coupon (tạm thời client-only)
  const handleAddCoupon = (coupon: Omit<Coupon, "id">) => {
    const newCoupon: Coupon = { ...coupon, id: Date.now() };
    setCoupons((prev) => [...prev, newCoupon]);
    setShowModal(false);
  };

  // 🟢 Cập nhật coupon
  const handleUpdateCoupon = (updated: Coupon) => {
    setCoupons((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setEditing(null);
    setShowModal(false);
  };

  // 🟢 Xóa coupon
  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa mã này?")) return;
    try {
      // await axios.delete(`/api/coupons/${id}`);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("❌ Xóa thất bại:", err);
      alert("Không thể xóa mã giảm giá!");
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-16 px-6 py-10 bg-white rounded-2xl shadow-lg border border-gray-100">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          🎟️ Mã giảm giá
        </h1>

        <button
          onClick={() => {
            setEditing(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 shadow transition"
        >
          <FontAwesomeIcon icon={faPlus} />
          Thêm mã mới
        </button>
      </div>

      {/* Loading / Empty / Table */}
      {loading ? (
        <p className="text-center text-gray-500">Đang tải dữ liệu...</p>
      ) : coupons.length === 0 ? (
        <p className="text-center text-gray-500 py-8">
          🚫 Không có mã giảm giá nào được tìm thấy.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-gray-50 text-gray-800 uppercase text-xs">
              <tr>
                <th className="p-3 border-b font-semibold">Mã</th>
                <th className="p-3 border-b font-semibold">Mô tả</th>
                <th className="p-3 border-b font-semibold">Giảm (%)</th>
                <th className="p-3 border-b font-semibold">Giảm (₫)</th>
                <th className="p-3 border-b font-semibold">Giới hạn</th>
                <th className="p-3 border-b font-semibold">Bắt đầu</th>
                <th className="p-3 border-b font-semibold">Kết thúc</th>
                <th className="p-3 border-b font-semibold">Trạng thái</th>
                <th className="p-3 border-b font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr
                  key={c.id}
                  className="text-center border-b hover:bg-gray-50 transition"
                >
                  <td className="p-3 font-semibold text-gray-800">{c.code}</td>
                  <td className="p-3">{c.description || "-"}</td>
                  <td className="p-3 text-green-700 font-medium">
                    {c.discount_percent ?? 0}%
                  </td>
                  {/* 🆕 Giảm tiền */}
                  <td className="p-3 text-blue-700 font-medium">
                    {c.discount_amount
                      ? c.discount_amount.toLocaleString("vi-VN") + " ₫"
                      : "-"}
                  </td>
                  <td className="p-3">{c.usage_limit ?? "-"}</td>
                  <td className="p-3">
                    {c.valid_from
                      ? new Date(c.valid_from).toLocaleDateString("vi-VN")
                      : "-"}
                  </td>
                  <td className="p-3">
                    {c.valid_until
                      ? new Date(c.valid_until).toLocaleDateString("vi-VN")
                      : "-"}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${c.status
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                        }`}
                    >
                      {c.status ? "Hoạt động" : "Tạm tắt"}
                    </span>
                  </td>
                  <td className="p-3 flex justify-center gap-3">
                    <button
                      onClick={() => {
                        setEditing(c);
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 transition"
                      title="Sửa mã"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id!)}
                      className="text-red-600 hover:text-red-800 transition"
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
      )}

      {/* Modal thêm/sửa */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? "Cập nhật mã giảm giá" : "Thêm mã giảm giá mới"}
        width="max-w-xl"
      >
        <div className="p-2">
          <CouponForm
            editing={editing}
            onAdd={handleAddCoupon}
            onUpdate={handleUpdateCoupon}
          />
        </div>
      </Modal>
    </div>
  );
}
