"use client";

import { useState, useEffect } from "react";
import { Address } from "@/types/address";
import VietnamAddressSelector from "@/components/checkout/VietnamAddressSelector";

interface AddressFormProps {
  editingAddress: Address | null;
  handleAddAddress: (newAddress: Address) => void;
  handleUpdateAddress: (updatedAddress: Address) => void;
}

export default function AddressForm({
  editingAddress,
  handleAddAddress,
  handleUpdateAddress,
}: AddressFormProps) {
  const [recipientName, setRecipientName] = useState("");
  const [phone, setPhone] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [location, setLocation] = useState(""); // tỉnh/huyện/xã
  const [isDefault, setIsDefault] = useState(false); // ✅ Mặc định
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingAddress) {
      setRecipientName(editingAddress.recipient_name);
      setPhone(editingAddress.phone);
      setDetailAddress(editingAddress.detail_address);
      setLocation(editingAddress.province_district_ward || "");
      setIsDefault(editingAddress.default || false); // nếu có mặc định
    } else {
      setRecipientName("");
      setPhone("");
      setDetailAddress("");
      setLocation("");
      setIsDefault(false);
    }
  }, [editingAddress]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      recipient_name: recipientName,
      phone,
      detail_address: detailAddress,
      province_district_ward: location,
      default: isDefault, // gửi thông tin mặc định
    };

    try {
      const res = await fetch(
        editingAddress ? `/api/shipping-address/${editingAddress.id}` : "/api/shipping-address",
        {
          method: editingAddress ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
          credentials: "include", // gửi cookie JWT
        }
      );

      const result = await res.json();

      if (!res.ok) {
        alert("Lỗi lưu địa chỉ: " + (result.error || "Server error"));
        return;
      }

      if (editingAddress) {
        handleUpdateAddress(result.address); // cập nhật parent
        alert("Cập nhật địa chỉ thành công");
      } else {
        handleAddAddress(result.address); // thêm mới vào parent
        alert("Thêm địa chỉ thành công");
      }

      // Reset form sau khi thêm
      setRecipientName("");
      setPhone("");
      setDetailAddress("");
      setLocation("");
      setIsDefault(false);
    } catch (err) {
      console.error(err);
      alert("Lỗi lưu địa chỉ");
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
        <label className="block text-sm text-gray-700 mb-1">Họ tên người nhận</label>
        <input
          type="text"
          value={recipientName}
          onChange={(e) => setRecipientName(e.target.value)}
          required
          className="w-full border rounded-lg p-2"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-1">Số điện thoại</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className="w-full border rounded-lg p-2"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-1">Địa chỉ chi tiết</label>
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
        <label className="block text-sm text-gray-700 mb-1">Tỉnh / Quận / Xã</label>
        <VietnamAddressSelector onChange={setLocation} />
      </div>

      {/* ✅ Checkbox chọn địa chỉ mặc định */}
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

      <button
        type="submit"
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 mt-3"
      >
        {editingAddress ? "Cập nhật địa chỉ" : "Thêm địa chỉ"}
      </button>
    </form>
  );
}
