"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Address } from "@/types/address";
import VietnamAddressSelector from "@/components/checkout/VietnamAddressSelector";

interface AddressFormProps {
  editingAddress: Address | null;
  handleAddAddress: (newAddress: Address) => void;
  handleUpdateAddress: (updatedAddress: Address) => void;
  handleDeleteAddress?: (deletedId: number) => void;
}

export default function AddressForm({
  editingAddress,
  handleAddAddress,
  handleUpdateAddress,
  handleDeleteAddress,
}: AddressFormProps) {
  const [recipientName, setRecipientName] = useState("");
  const [phone, setPhone] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingAddress) {
      setRecipientName(editingAddress.recipient_name);
      setPhone(editingAddress.phone);
      setDetailAddress(editingAddress.detail_address);
      setProvince(editingAddress.province_name || "");
      setDistrict(editingAddress.district_name || "");
      setWard(editingAddress.ward_name || "");
      setIsDefault(editingAddress.default || false);
    } else {
      setRecipientName("");
      setPhone("");
      setDetailAddress("");
      setProvince("");
      setDistrict("");
      setWard("");
      setIsDefault(false);
    }
  }, [editingAddress]);

  const data = {
    recipient_name: recipientName,
    phone,
    detail_address: detailAddress,
    province_name: province,
    district_name: district,
    ward_name: ward,
    default: isDefault,
  };

  const addAddress = async () => {
    const res = await axios.post<any>("/api/shipping-address", data, {
      withCredentials: true,
    });
    console.log("dia chi :", res);
    return res.data.address;
  };

  const updateAddress = async () => {
    const res = await axios.put<any>(
      `/api/shipping-address/${editingAddress?.id}`,
      data,
      { withCredentials: true }
    );
    return res.data.address;
  };

  const deleteAddress = async () => {
    if (!editingAddress?.id) return;
    if (!confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;

    await axios.delete(`/api/shipping-address/${editingAddress.id}`, {
      withCredentials: true,
    });

    handleDeleteAddress?.(editingAddress.id);
    alert("🗑️ Đã xóa địa chỉ thành công!");
    setRecipientName("");
    setPhone("");
    setDetailAddress("");
    setProvince("");
    setDistrict("");
    setWard("");
    setIsDefault(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let savedAddress;
      if (editingAddress) {
        savedAddress = await updateAddress();
        handleUpdateAddress(savedAddress);
        alert("✅ Cập nhật địa chỉ thành công!");
      } else {
        savedAddress = await addAddress();
        handleAddAddress(savedAddress);
        alert("✅ Thêm địa chỉ thành công!");
      }

      setRecipientName("");
      setPhone("");
      setDetailAddress("");
      setIsDefault(false);
    } catch (err: any) {
      console.log("dddd :", data);
      console.error("💥 Lỗi lưu địa chỉ:", err.response?.data || err.message);
      alert(
        "Lỗi lưu địa chỉ: " +
        (err.response?.data?.error || err.message || "Không xác định")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {editingAddress ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
        </h3>
      </div>

      {/* Form Content */}
      <div className="p-6 space-y-5">
        {/* Recipient Name */}
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Họ tên người nhận
          </label>
          <input
            type="text"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            required
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
            placeholder="Nhập họ tên đầy đủ"
          />
        </div>

        {/* Phone */}
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Số điện thoại
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all outline-none"
            placeholder="Nhập số điện thoại"
          />
        </div>

        {/* Detail Address */}
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Địa chỉ chi tiết
          </label>
          <input
            type="text"
            value={detailAddress}
            onChange={(e) => setDetailAddress(e.target.value)}
            required
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none"
            placeholder="Số nhà, tên đường..."
          />
        </div>

        {/* Address Selector */}
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Tỉnh / Quận / Xã
          </label>
          <VietnamAddressSelector
            onChange={(values) => {
              setProvince(values.province_name);
              setDistrict(values.district_name);
              setWard(values.ward_name);
            }}
          />
        </div>

        {/* Default Address Checkbox */}
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-4">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                id="defaultAddress"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="peer w-5 h-5 rounded border-2 border-amber-300 text-amber-600 focus:ring-4 focus:ring-amber-200 transition-all cursor-pointer"
              />
              <svg
                className="absolute top-0.5 left-0.5 w-4 h-4 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <span className="text-sm font-semibold text-amber-900">Đặt làm địa chỉ mặc định</span>
              <p className="text-xs text-amber-700 mt-0.5">Địa chỉ này sẽ được sử dụng cho các đơn hàng tiếp theo</p>
            </div>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-3.5 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{editingAddress ? "Cập nhật địa chỉ" : "Thêm địa chỉ"}</span>
              </>
            )}
          </button>

          {editingAddress && (
            <button
              type="button"
              onClick={deleteAddress}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-semibold px-6 py-3.5 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Xóa địa chỉ</span>
            </button>
          )}
        </div>
      </div>
    </form>
  );
}