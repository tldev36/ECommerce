"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faPlus,
  faTicket,
  faToggleOn,
  faToggleOff,
  faSearch
} from "@fortawesome/free-solid-svg-icons";
import CouponForm from "@/components/admin/CouponForm";
import { Coupon } from "@/types/coupon";
import Modal from "@/components/common/Modal";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);

  // 🟢 Lấy danh sách từ API
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await axios.get<Coupon[]>("/api/admin/coupons");
        setCoupons(Array.isArray(res.data) ? res.data : []);
      } catch (err: any) {
        console.error("❌ Lỗi khi tải coupons:", err);
        setCoupons([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  // 🟢 Logic xử lý (Giữ nguyên)
  const handleAddCoupon = (coupon: Omit<Coupon, "id">) => {
    const newCoupon: Coupon = { ...coupon, id: Date.now() }; // Mock ID
    setCoupons((prev) => [...prev, newCoupon]);
    setShowModal(false);
  };

  const handleUpdateCoupon = (updated: Coupon) => {
    setCoupons((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setEditing(null);
    setShowModal(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa mã này? Hành động này không thể hoàn tác.")) return;

    try {
      await axios.delete(`/api/admin/coupons/${id}`);

      // Cập nhật UI ngay lập tức
      setCoupons((prev) => prev.filter((c) => c.id !== id));

      // (Tùy chọn) Thông báo nhỏ
      // toast.success("Đã xóa thành công"); 

    } catch (err: any) {
      console.error("❌ Xóa thất bại:", err);

      // Lấy thông báo lỗi từ API trả về (nếu có)
      const message = err.response?.data?.error || "Không thể xóa mã giảm giá!";
      alert(message);
    }
  };

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    // 1️⃣ OPTIMISTIC UPDATE: Cập nhật UI ngay lập tức cho mượt
    const newStatus = !currentStatus;

    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );

    // 2️⃣ BACKGROUND API CALL: Gọi API cập nhật ngầm
    try {
      await axios.patch(`/api/admin/coupons/${id}`, {
        status: newStatus,
      });
      // Thành công thì không cần làm gì thêm vì UI đã đúng rồi
    } catch (error) {
      console.error("Lỗi cập nhật status:", error);

      // 3️⃣ ROLLBACK: Nếu lỗi thì cập nhật UI quay lại trạng thái cũ và báo lỗi
      setCoupons((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: currentStatus } : c))
      );
      alert("Không thể cập nhật trạng thái. Vui lòng thử lại!");
    }
  };

  const isExpired = (validUntil?: string | null) => {
    if (!validUntil) return false;
    return new Date(validUntil) < new Date();
  };

  // Helper format tiền tệ
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // Helper format ngày
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Không thời hạn";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  // 🟢 Thống kê (Giữ nguyên vì hữu ích)
  const stats = {
    total: coupons.length,
    active: coupons.filter(c => c.status).length,
    expired: coupons.filter(c => isExpired(c.valid_until)).length
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 font-sans">
      <div className="max-w-7xl mx-auto">

        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <span className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                  <FontAwesomeIcon icon={faTicket} />
                </span>
                Quản lý mã giảm giá
              </h1>
              <p className="text-gray-500 mt-1 text-sm">Quản lý các chương trình khuyến mãi hiện có</p>
            </div>

            <button
              onClick={() => {
                setEditing(null);
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all duration-200 font-medium text-sm"
            >
              <FontAwesomeIcon icon={faPlus} />
              Tạo mã mới
            </button>
          </div>

          {/* Mini Stats Row */}
          <div className="grid grid-cols-3 gap-4 mt-6 border-t pt-4">
            <div className="px-4 py-2 border-r last:border-0">
              <span className="text-gray-500 text-xs uppercase font-semibold">Tổng mã</span>
              <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
            </div>
            <div className="px-4 py-2 border-r last:border-0">
              <span className="text-gray-500 text-xs uppercase font-semibold">Đang chạy</span>
              <div className="text-2xl font-bold text-emerald-600">{stats.active}</div>
            </div>
            <div className="px-4 py-2">
              <span className="text-gray-500 text-xs uppercase font-semibold">Hết hạn</span>
              <div className="text-2xl font-bold text-rose-500">{stats.expired}</div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
              <p className="text-gray-500 mt-2 text-sm">Đang tải dữ liệu...</p>
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faTicket} className="text-2xl text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium">Chưa có mã giảm giá nào</p>
              <p className="text-gray-400 text-sm mt-1">Hãy bắt đầu bằng cách tạo mã mới</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase tracking-wider">
                    <th className="p-4 font-semibold">Mã Code / Mô tả</th>
                    <th className="p-4 font-semibold">Giá trị giảm</th>
                    <th className="p-4 font-semibold">Giới hạn & Thời gian</th>
                    <th className="p-4 font-semibold text-center">Trạng thái</th>
                    <th className="p-4 font-semibold text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {coupons.map((c) => {
                    const expired = isExpired(c.valid_until);
                    const isActive = c.status && !expired;

                    return (
                      <tr
                        key={c.id}
                        className="hover:bg-indigo-50/30 transition-colors duration-150 group"
                      >
                        {/* Cột 1: Code & Info */}
                        <td className="p-4 align-top">
                          <div className="flex flex-col">
                            <span className="font-mono font-bold text-indigo-700 text-lg">{c.code}</span>
                            <span className="text-gray-500 text-sm truncate max-w-[200px]" title={c.description || ""}>
                              {c.description || "Không có mô tả"}
                            </span>
                          </div>
                        </td>

                        {/* Cột 2: Discount */}
                        <td className="p-4 align-middle">
                          {c.discount_percent! > 0 ? (
                            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Giảm {c.discount_percent}%
                            </div>
                          ) : (
                            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Giảm {formatCurrency(c.discount_amount || 0)}
                            </div>
                          )}
                        </td>

                        {/* Cột 3: Limits & Date */}
                        <td className="p-4 align-middle">
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>
                              <span className="font-medium text-gray-400 text-xs uppercase">Sử dụng: </span>
                              {c.usage_limit ? `${c.usage_limit} lần` : "Không giới hạn"}
                            </div>
                            <div>
                              <span className="font-medium text-gray-400 text-xs uppercase">Hạn: </span>
                              {formatDate(c.valid_until)}
                            </div>
                          </div>
                        </td>

                        {/* Cột 4: Status */}
                        <td className="p-4 align-middle text-center">
                          {expired ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                              Hết hạn
                            </span>
                          ) : c.status ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                              Đang chạy
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 border border-rose-200">
                              Đang tắt
                            </span>
                          )}
                        </td>

                        {/* Cột 5: Actions */}
                        <td className="p-4 align-middle text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Toggle Button */}
                            <button
                              onClick={() => toggleStatus(c.id, c.status ? true : false)}
                              className={`p-2 rounded-lg transition-colors ${c.status ? 'text-emerald-600 hover:bg-emerald-50' : 'text-gray-400 hover:bg-gray-100'
                                }`}
                              title={c.status ? "Tắt mã" : "Bật mã"}
                            >
                              <FontAwesomeIcon icon={c.status ? faToggleOn : faToggleOff} className="text-xl" />
                            </button>

                            {/* Edit Button */}
                            <button
                              onClick={() => {
                                setEditing(c);
                                setShowModal(true);
                              }}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Chỉnh sửa"
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => handleDelete(c.id!)}
                              className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Xóa"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal form */}
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
    </div>
  );
}