"use client";

import { useEffect, useState } from "react";

interface Ward {
  Id: string;
  Name: string;
  Level: string;
}

interface District {
  Id: string;
  Name: string;
  Wards: Ward[];
}

interface Province {
  Id: string;
  Name: string;
  Districts: District[];
}

interface VietnamAddressSelectorProps {
  onChange: (fullAddress: string) => void;
}

export default function VietnamAddressSelector({ onChange }: VietnamAddressSelectorProps) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedWard, setSelectedWard] = useState<string>("");

  useEffect(() => {
    fetch("/data/vietnam.json")
      .then((res) => res.json())
      .then((data: Province[]) => setProvinces(data))
      .catch((err) => console.error("❌ Lỗi tải dữ liệu địa giới:", err));
  }, []);

  useEffect(() => {
    const province = provinces.find((p) => p.Id === selectedProvince);
    setDistricts(province ? province.Districts : []);
    setSelectedDistrict("");
    setWards([]);
    setSelectedWard("");
  }, [selectedProvince]);

  useEffect(() => {
    const district = districts.find((d) => d.Id === selectedDistrict);
    setWards(district ? district.Wards : []);
    setSelectedWard("");
  }, [selectedDistrict]);

  // Gửi địa chỉ đầy đủ ra ngoài
  useEffect(() => {
    const provinceName = provinces.find((p) => p.Id === selectedProvince)?.Name || "";
    const districtName = districts.find((d) => d.Id === selectedDistrict)?.Name || "";
    const wardName = wards.find((w) => w.Id === selectedWard)?.Name || "";
    const full = [wardName, districtName, provinceName].filter(Boolean).join(", ");
    onChange(full);
  }, [selectedProvince, selectedDistrict, selectedWard]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <select
        className="border p-2 rounded w-full"
        value={selectedProvince}
        onChange={(e) => setSelectedProvince(e.target.value)}
      >
        <option value="">Tỉnh / Thành phố</option>
        {provinces.map((p) => (
          <option key={`province-${p.Id}`} value={p.Id}>
            {p.Name}
          </option>
        ))}
      </select>

      <select
        className="border p-2 rounded w-full"
        value={selectedDistrict}
        onChange={(e) => setSelectedDistrict(e.target.value)}
        disabled={!selectedProvince}
      >
        <option value="">Quận / Huyện</option>
        {districts.map((d) => (
          <option key={`district-${d.Id}`} value={d.Id}>
            {d.Name}
          </option>
        ))}
      </select>

      <select
        className="border p-2 rounded w-full"
        value={selectedWard}
        onChange={(e) => setSelectedWard(e.target.value)}
        disabled={!selectedDistrict}
      >
        <option value="">Xã / Phường</option>
        {wards.map((w) => (
          <option key={`ward-${w.Id}`} value={w.Id}>
            {w.Name}
          </option>
        ))}
      </select>
    </div>
  );
}
