"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faEnvelope, faPhone, faMapMarkerAlt, faCamera, faCake, faVenusMars, faIdCard } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";

type Profile = {
  id: number;
  username?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  gender?: string | null;
  birthday?: string | null | Date;
  avatar?: string | null;
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/user/profile", {
          credentials: "include",
        });
        
        if (res.ok) {
          const data = await res.json();
          setProfile(data.user);
        } else {
          router.push("/auth/login");
        }
      } catch (err) {
        console.error("Fetch profile error:", err);
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600 mb-4"></div>
          <p className="text-lg text-gray-600 font-medium">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleSave = async () => {
    if (!profile?.id) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/user/profile/${profile.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      const data = await res.json();
      console.log("Profile API trả về:", data);

      if (res.ok) {
        const updated = (await res.json()) as Profile;
        setProfile(updated);
        localStorage.setItem("user", JSON.stringify(updated));
        alert("Thông tin đã được lưu!");
      } else {
        const err = await res.json();
        alert(err.error || "Có lỗi xảy ra khi lưu!");
      }
    } catch {
      alert("Có lỗi xảy ra khi lưu!");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setProfile((prev) => (prev ? { ...prev, avatar: previewUrl } : prev));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
            Thông tin cá nhân
          </h1>
          <p className="text-gray-600">Quản lý và cập nhật thông tin của bạn</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Cover Background */}
          <div className="h-32 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 relative">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-4 left-4 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
              <div className="absolute bottom-4 right-4 w-40 h-40 bg-white/20 rounded-full blur-3xl"></div>
            </div>
          </div>

          {/* Avatar Section */}
          <div className="relative px-8 pb-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 mb-8">
              <div className="relative group">
                <div className="relative">
                  <Image
                    src={profile.avatar || "/images/default.jpg"}
                    alt="Avatar"
                    width={160}
                    height={160}
                    className="rounded-full border-8 border-white shadow-2xl object-cover w-40 h-40"
                  />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-600/40 to-emerald-600/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <FontAwesomeIcon icon={faCamera} className="text-white text-2xl" />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2 right-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all"
                >
                  <FontAwesomeIcon icon={faCamera} className="w-4 h-4" />
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  hidden
                />
              </div>
              <div className="sm:ml-6 mt-4 sm:mt-0 text-center sm:text-left">
                <h2 className="text-2xl font-bold text-gray-800">{profile.name}</h2>
                <p className="text-gray-500 flex items-center justify-center sm:justify-start gap-2 mt-1">
                  <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4" />
                  {profile.email}
                </p>
              </div>
            </div>

            {/* Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Username */}
              {profile.username && (
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-md">
                      <FontAwesomeIcon icon={faIdCard} className="text-white w-4 h-4" />
                    </div>
                    Tên đăng nhập
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={profile.username || ""}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all outline-none hover:border-green-300"
                    placeholder="Nhập tên đăng nhập"
                  />
                </div>
              )}

              {/* Name */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-md">
                    <FontAwesomeIcon icon={faUser} className="text-white w-4 h-4" />
                  </div>
                  Họ và tên
                </label>
                <input
                  type="text"
                  name="name"
                  value={profile.name || ""}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none hover:border-emerald-300"
                  placeholder="Nhập họ và tên"
                />
              </div>

              {/* Email */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-md">
                    <FontAwesomeIcon icon={faEnvelope} className="text-white w-4 h-4" />
                  </div>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={profile.email || ""}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all outline-none hover:border-teal-300"
                  placeholder="example@email.com"
                />
              </div>

              {/* Phone */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md">
                    <FontAwesomeIcon icon={faPhone} className="text-white w-4 h-4" />
                  </div>
                  Số điện thoại
                </label>
                <input
                  type="text"
                  name="phone"
                  value={profile.phone || ""}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all outline-none hover:border-green-300"
                  placeholder="Nhập số điện thoại"
                />
              </div>

              {/* Gender */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                    <FontAwesomeIcon icon={faVenusMars} className="text-white w-4 h-4" />
                  </div>
                  Giới tính
                </label>
                <select
                  name="gender"
                  value={profile.gender || ""}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none hover:border-emerald-300"
                >
                  <option value="">Chọn giới tính</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              {/* Birthday */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-green-600 flex items-center justify-center shadow-md">
                    <FontAwesomeIcon icon={faCake} className="text-white w-4 h-4" />
                  </div>
                  Ngày sinh
                </label>
                <input
                  type="date"
                  name="birthday"
                  value={profile.birthday ? new Date(profile.birthday).toISOString().split('T')[0] : ""}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all outline-none hover:border-teal-300"
                />
              </div>

              {/* Address - Full Width */}
              <div className="group md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center shadow-md">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-white w-4 h-4" />
                  </div>
                  Địa chỉ
                </label>
                <input
                  type="text"
                  name="address"
                  value={(profile as any).address || ""}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all outline-none hover:border-green-300"
                  placeholder="Nhập địa chỉ của bạn"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="mt-8 flex gap-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Lưu thông tin</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-green-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <FontAwesomeIcon icon={faUser} className="text-green-600 w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tên hiển thị</p>
                <p className="font-semibold text-gray-800">{profile.name}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-emerald-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <FontAwesomeIcon icon={faEnvelope} className="text-emerald-600 w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold text-gray-800 truncate">{profile.email}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-teal-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                <FontAwesomeIcon icon={faPhone} className="text-teal-600 w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Điện thoại</p>
                <p className="font-semibold text-gray-800">{profile.phone || "Chưa cập nhật"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}