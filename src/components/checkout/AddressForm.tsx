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

  // ⚙️ Khi bấm "Sửa", đổ dữ liệu lên form
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

  // 🔹 Hàm thêm địa chỉ mới
  const addAddress = async () => {
    // const data = {
    //   recipient_name: recipientName,
    //   phone,
    //   detail_address: detailAddress,
    //   province_name: province,
    //   district_name: district,
    //   ward_name: ward,
    //   default: isDefault,
    // };

    const res = await axios.post<any>("/api/shipping-address", data, {
      withCredentials: true,
    });
    console.log("dia chi :", res)

    return res.data.address;
  };

  // 🔹 Hàm cập nhật địa chỉ cũ
  const updateAddress = async () => {
    // const data = {
    //   recipient_name: recipientName,
    //   phone,
    //   detail_address: detailAddress,
    //   province_name: province,
    //   district_name: district,
    //   ward_name: ward,
    //   default: isDefault,
    // };

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


  // 🧾 Hàm submit form
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

      // Reset form
      setRecipientName("");
      setPhone("");
      setDetailAddress("");

      setIsDefault(false);
    } catch (err: any) {
      console.log("dddd :", data)
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
      className="mt-4 space-y-3 bg-gray-50 p-4 rounded-xl border"
    >
      <div>
        <label className="block text-sm text-gray-700 mb-1">
          Họ tên người nhận
        </label>
        <input
          type="text"
          value={recipientName}
          onChange={(e) => setRecipientName(e.target.value)}
          required
          className="w-full border rounded-lg p-2"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-1">
          Số điện thoại
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className="w-full border rounded-lg p-2"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-1">
          Địa chỉ chi tiết
        </label>
        <input
          type="text"
          value={detailAddress}
          onChange={(e) => setDetailAddress(e.target.value)}
          required
          className="w-full border rounded-lg p-2"
          placeholder="Số nhà, tên đường..."
        />
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-1">
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

      {/* ✅ Checkbox địa chỉ mặc định */}
      <div className="flex items-center gap-2 mt-2">
        <input
          type="checkbox"
          id="defaultAddress"
          checked={isDefault}
          onChange={(e) => setIsDefault(e.target.checked)}
          className="w-4 h-4"
        />
        <label htmlFor="defaultAddress" className="text-sm text-gray-700">
          Đặt làm địa chỉ mặc định
        </label>
      </div>

      {/* 🛎️ Nút Xóa / Lưu */}
      <div className="flex items-center justify-between gap-3 mt-4">


        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex-1"
        >
          {loading
            ? "Đang lưu..."
            : editingAddress
              ? "Cập nhật địa chỉ"
              : "Thêm địa chỉ"}
        </button>

        {editingAddress && (
          <button
            type="button"
            onClick={deleteAddress}
            disabled={loading}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex-1"
          >
            🗑️ Xóa địa chỉ
          </button>
        )}
      </div>

    </form>
  );
}
