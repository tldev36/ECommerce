"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faPlus, faTicket, faPercentage, faCoins, faCalendar, faToggleOn, faToggleOff } from "@fortawesome/free-solid-svg-icons";
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

  // 🟢 Thêm coupon
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

  // 🟢 Toggle trạng thái
  const toggleStatus = (id: number) => {
    setCoupons((prev) => 
      prev.map((c) => c.id === id ? { ...c, status: !c.status } : c)
    );
  };

  // 🟢 Kiểm tra hết hạn
  const isExpired = (validUntil?: string | null) => {
    if (!validUntil) return false;
    return new Date(validUntil) < new Date();
  };

  // 🟢 Thống kê
  const stats = {
    total: coupons.length,
    active: coupons.filter(c => c.status).length,
    expired: coupons.filter(c => isExpired(c.valid_until)).length
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-indigo-600 rounded-3xl shadow-xl p-8 mb-8 text-white">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <FontAwesomeIcon icon={faTicket} />
                Quản lý mã giảm giá
              </h1>
              <p className="text-indigo-100 text-lg">Tạo và quản lý các chương trình khuyến mãi</p>
            </div>
            
            <button
              onClick={() => {
                setEditing(null);
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold transform hover:scale-105"
            >
              <FontAwesomeIcon icon={faPlus} />
              Tạo mã mới
            </button>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
              <div className="text-3xl font-bold">{stats.total}</div>
              <div className="text-indigo-100">Tổng số mã</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
              <div className="text-3xl font-bold text-emerald-300">{stats.active}</div>
              <div className="text-indigo-100">Đang hoạt động</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
              <div className="text-3xl font-bold text-rose-300">{stats.expired}</div>
              <div className="text-indigo-100">Đã hết hạn</div>
            </div>
          </div>
        </div>

        {/* Coupons Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
            <p className="text-gray-600 mt-4">Đang tải dữ liệu...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <FontAwesomeIcon icon={faTicket} className="text-6xl text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">Chưa có mã giảm giá nào. Hãy tạo mã đầu tiên!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {coupons.map((c) => {
              const expired = isExpired(c.valid_until);
              return (
                <div
                  key={c.id}
                  className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 ${
                    expired ? 'border-gray-300 opacity-75' : 
                    c.status ? 'border-emerald-400' : 'border-rose-400'
                  } transform hover:-translate-y-1`}
                >
                  {/* Card Header */}
                  <div className={`p-6 ${
                    expired ? 'bg-gray-500' :
                    c.status ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-white text-2xl font-bold font-mono tracking-wider mb-1">
                          {c.code}
                        </div>
                        <div className="text-white/90 text-sm">
                          {c.description || "Không có mô tả"}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleStatus(c.id!)}
                        className={`p-2 rounded-lg ${
                          c.status ? 'bg-white/20' : 'bg-white/30'
                        } hover:bg-white/40 transition`}
                        title={c.status ? "Tắt mã" : "Bật mã"}
                      >
                        <FontAwesomeIcon 
                          icon={c.status ? faToggleOn : faToggleOff} 
                          className="text-white text-xl"
                        />
                      </button>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-4">
                    {/* Discount Info */}
                    <div className="flex gap-4">
                      {c.discount_percent! > 0 && (
                        <div className="flex-1 bg-indigo-50 rounded-xl p-4 border-2 border-indigo-200">
                          <FontAwesomeIcon icon={faPercentage} className="text-indigo-600 mb-2" />
                          <div className="text-3xl font-bold text-indigo-700">
                            {c.discount_percent}%
                          </div>
                          <div className="text-indigo-600 text-sm">Giảm giá</div>
                        </div>
                      )}
                      {c.discount_amount! > 0 && (
                        <div className="flex-1 bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                          <FontAwesomeIcon icon={faCoins} className="text-gray-600 mb-2" />
                          <div className="text-2xl font-bold text-gray-700">
                            {c.discount_amount!.toLocaleString("vi-VN")}₫
                          </div>
                          <div className="text-gray-600 text-sm">Giảm tiền</div>
                        </div>
                      )}
                    </div>

                    {/* Usage Limit */}
                    {c.usage_limit && (
                      <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-200">
                        <div className="text-indigo-800 text-sm font-semibold">
                          Giới hạn: {c.usage_limit} lượt sử dụng
                        </div>
                      </div>
                    )}

                    {/* Date Range */}
                    <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                      <div className="flex items-center gap-2 text-gray-700">
                        <FontAwesomeIcon icon={faCalendar} className="text-gray-500" />
                        <span className="text-sm">
                          {c.valid_from ? new Date(c.valid_from).toLocaleDateString("vi-VN") : "N/A"}
                          {" → "}
                          {c.valid_until ? new Date(c.valid_until).toLocaleDateString("vi-VN") : "N/A"}
                        </span>
                      </div>
                      {expired && (
                        <div className="text-rose-600 text-xs font-semibold bg-rose-50 px-2 py-1 rounded">
                          ⚠️ Đã hết hạn
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => {
                          setEditing(c);
                          setShowModal(true);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors font-medium shadow-md hover:shadow-lg"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(c.id!)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-colors font-medium shadow-md hover:shadow-lg"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
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
    </div>
  );
}