"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faCamera,
} from "@fortawesome/free-solid-svg-icons";

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    phone: "0123456789",
    address: "Hà Nội, Việt Nam",
    avatar: "/images/user1.jpg",
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    alert("Thông tin đã được lưu!");
    // Gọi API lưu thông tin ở đây
  };

  // Xử lý chọn ảnh mới
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfile((prev) => ({ ...prev, avatar: imageUrl }));
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 mt-16">
      <h1 className="text-3xl font-extrabold mb-8 text-center text-green-700">
        Thông tin cá nhân
      </h1>

      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-8 border border-gray-200">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <Image
              src={profile.avatar}
              alt="Avatar"
              width={120}
              height={120}
              className="rounded-full border-4 border-green-500 shadow-lg object-cover"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-green-500 text-white p-2 rounded-full shadow-md hover:bg-green-600 transition"
            >
              <FontAwesomeIcon icon={faCamera} className="w-4 h-4"/>
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              hidden
            />
          </div>
          <p className="mt-4 text-lg font-semibold">{profile.name}</p>
        </div>

        {/* Form */}
        <div className="space-y-5">
          <div>
            <label className="block font-medium mb-1 flex">
              <FontAwesomeIcon icon={faUser} className="text-green-600 mr-2 w-4 h-4" />
              Họ và tên
            </label>
            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
            />
          </div>

          <div>
            <label className="block font-medium mb-1 flex">
              <FontAwesomeIcon icon={faEnvelope} className="text-green-600 mr-2 w-4 h-4" />
              Email
            </label>
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
            />
          </div>

          <div>
            <label className="block font-medium mb-1 flex">
              <FontAwesomeIcon icon={faPhone} className="text-green-600 mr-2 w-4 h-4" />
              Số điện thoại
            </label>
            <input
              type="text"
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
            />
          </div>

          <div>
            <label className="block font-medium mb-1 flex">
              <FontAwesomeIcon
                icon={faMapMarkerAlt}
                className="text-green-600 mr-2 w-4 h-4"
              />
              Địa chỉ
            </label>
            <input
              type="text"
              name="address"
              value={profile.address}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
            />
          </div>
        </div>

        {/* Nút lưu */}
        <button
          onClick={handleSave}
          className="mt-8 w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-lg font-medium shadow-md transition"
        >
          Lưu thông tin
        </button>
      </div>
    </div>
  );
}
