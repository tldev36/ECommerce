"use client";

import { useEffect, useState } from "react";

interface Province {
  ProvinceID: number;
  ProvinceName: string;
}

interface District {
  DistrictID: number;
  DistrictName: string;
}

interface Ward {
  WardCode: string;
  WardName: string;
}

interface GHNAddressSelectorProps {
  onChange: (values: {
    province_name: string;
    district_name: string;
    ward_name: string;
  }) => void;
}

export default function GHNAddressSelector({ onChange }: GHNAddressSelectorProps) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [selectedProvince, setSelectedProvince] = useState<number | "">("");
  const [selectedDistrict, setSelectedDistrict] = useState<number | "">("");
  const [selectedWard, setSelectedWard] = useState<string>("");

  // 🔹 1️⃣ Lấy danh sách tỉnh (qua API /api/ghn/provinces)
  useEffect(() => {
    fetch("/api/ghn/provinces")
      .then((res) => res.json())
      .then((data) => setProvinces(data.data || []))
      .catch((err) => console.error("❌ Lỗi tải tỉnh:", err));
  }, []);

  // 🔹 2️⃣ Lấy danh sách huyện khi chọn tỉnh
  useEffect(() => {
    if (!selectedProvince) return;
    fetch("/api/ghn/districts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provinceId: selectedProvince }),
    })
      .then((res) => res.json())
      .then((data) => {
        setDistricts(data.data || []);
        setSelectedDistrict("");
        setWards([]);
      })
      .catch((err) => console.error("❌ Lỗi tải huyện:", err));
  }, [selectedProvince]);

  // 🔹 3️⃣ Lấy danh sách xã khi chọn huyện
  useEffect(() => {
    if (!selectedDistrict) return;
    fetch("/api/ghn/wards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ districtId: selectedDistrict }),
    })
      .then((res) => res.json())
      .then((data) => {
        setWards(data.data || []);
        setSelectedWard("");
      })
      .catch((err) => console.error("❌ Lỗi tải xã:", err));
  }, [selectedDistrict]);

  // 🔹 4️⃣ Gửi địa chỉ đầy đủ ra ngoài khi người dùng chọn đủ 3 cấp
  // useEffect(() => {
  //   const provinceName =
  //     provinces.find((p) => p.ProvinceID === selectedProvince)?.ProvinceName ||
  //     "";
  //   const districtName =
  //     districts.find((d) => d.DistrictID === selectedDistrict)?.DistrictName ||
  //     "";
  //   const wardName =
  //     wards.find((w) => w.WardCode === selectedWard)?.WardName || "";

  //   onChange({
  //     province_name: provinceName,
  //     district_name: districtName,
  //     ward_name: wardName,
  //   });
  // }, [selectedProvince, selectedDistrict, selectedWard]);
  useEffect(() => {
    const provinceName =
      provinces.find((p) => p.ProvinceID === selectedProvince)?.ProvinceName ||
      "";
    const districtName =
      districts.find((d) => d.DistrictID === selectedDistrict)?.DistrictName ||
      "";
    const wardName =
      wards.find((w) => w.WardCode === selectedWard)?.WardName || "";

    // ✅ Chỉ gọi khi có ít nhất 1 giá trị thay đổi
    if (provinceName || districtName || wardName) {
      onChange({
        province_name: provinceName,
        district_name: districtName,
        ward_name: wardName,
      });
    }
  }, [selectedProvince, selectedDistrict, selectedWard, provinces, districts, wards, onChange]);


  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {/* Chọn tỉnh */}
      <select
        className="border p-2 rounded w-full"
        value={selectedProvince}
        onChange={(e) => setSelectedProvince(Number(e.target.value))}
      >
        <option value="">Tỉnh / Thành phố</option>
        {provinces.map((p) => (
          <option key={p.ProvinceID} value={p.ProvinceID}>
            {p.ProvinceName}
          </option>
        ))}
      </select>

      {/* Chọn huyện */}
      <select
        className="border p-2 rounded w-full"
        value={selectedDistrict}
        onChange={(e) => setSelectedDistrict(Number(e.target.value))}
        disabled={!selectedProvince}
      >
        <option value="">Quận / Huyện</option>
        {districts.map((d) => (
          <option key={d.DistrictID} value={d.DistrictID}>
            {d.DistrictName}
          </option>
        ))}
      </select>

      {/* Chọn xã */}
      <select
        className="border p-2 rounded w-full"
        value={selectedWard}
        onChange={(e) => setSelectedWard(e.target.value)}
        disabled={!selectedDistrict}
      >
        <option value="">Xã / Phường</option>
        {wards.map((w) => (
          <option key={w.WardCode} value={w.WardCode}>
            {w.WardName}
          </option>
        ))}
      </select>
    </div>
  );
}
