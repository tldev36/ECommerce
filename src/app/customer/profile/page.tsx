"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faPhone,
  faCamera,
  faVenusMars,
  faCake,
  faPen,
  faSave,
  faTimes,
  faLock,
  faPaperPlane,
  faCheckCircle
} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";

// 🔹 Định nghĩa Type chặt chẽ
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

  // 🔹 State Management
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // Toggle chế độ Xem/Sửa
  const [emailSent, setEmailSent] = useState(false); // Trạng thái gửi mail reset
  const [sendingEmail, setSendingEmail] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 🟢 Fetch Profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data = await res.json();
          setProfile(data.user);
        } else {
          router.push("/auth/login");
        }
      } catch (err) {
        console.error("Fetch profile error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  // 🟢 Handle Input Change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  

  // 🟢 Handle Save Profile
  // const handleSave = async () => {
  //   if (!profile?.id) return;
  //   setSaving(true);
  //   try {
  //     const res = await fetch(`/api/user/profile/${profile.id}`, {
  //       method: "PUT",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(profile),
  //     });

  //     if (res.ok) {
  //       const updated = await res.json();
  //       setProfile(updated);
  //       setIsEditing(false); // Tắt chế độ sửa sau khi lưu
  //       alert("Cập nhật thành công!");
  //     } else {
  //       const err = await res.json();
  //       alert(err.error || "Lỗi khi lưu!");
  //     }
  //   } catch {
  //     alert("Lỗi kết nối!");
  //   } finally {
  //     setSaving(false);
  //   }
  // };

  const handleSave = async () => {
  if (!profile?.id) return;
  setSaving(true);

  try {
    // Tạo FormData để chứa text + file
    const formData = new FormData();
    
    // Đẩy các thông tin text vào formData
    formData.append("name", profile.name);
    formData.append("email", profile.email); // Thường email dùng để check, ít khi cho sửa ở đây nếu là khóa chính
    if (profile.phone) formData.append("phone", profile.phone);
    if (profile.gender) formData.append("gender", profile.gender);
    if (profile.birthday) formData.append("birthday", new Date(profile.birthday).toISOString());
    
    // Nếu có file ảnh mới thì append vào, đặt key là "file"
    if (avatarFile) {
      formData.append("file", avatarFile);
    } else {
        // Nếu không đổi ảnh, gửi lại avatar cũ (URL chuỗi) để backend biết
        // Hoặc backend tự xử lý logic giữ nguyên
        if (profile.avatar) formData.append("avatarUrl", profile.avatar);
    }

    // Gửi request
    const res = await fetch(`/api/user/profile/${profile.id}`, {
      method: "PUT",
      body: formData, 
      // ❌ LƯU Ý: KHÔNG thêm header "Content-Type": "application/json"
      // Trình duyệt sẽ tự động set "multipart/form-data" kèm boundary
    });

    if (res.ok) {
      const updated = await res.json();
      setProfile(updated);
      setAvatarFile(null); // Reset file upload
      setIsEditing(false);
      alert("Cập nhật thành công!");
    } else {
      const err = await res.json();
      alert(err.error || "Lỗi khi lưu!");
    }
  } catch (error) {
    console.error(error);
    alert("Lỗi kết nối!");
  } finally {
    setSaving(false);
  }
};

  // 🟢 Handle Avatar Upload
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setProfile((prev) => (prev ? { ...prev, avatar: previewUrl } : prev));
    setAvatarFile(file); // Quan trọng: Lưu file gốc để gửi đi
  };

  // 🟢 Handle Reset Password via Email
  const handleRequestPasswordReset = async () => {
    if (!profile?.email) return;
    setSendingEmail(true);
    try {
      // Giả lập API call gửi mail
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: profile.email }),
      });

      if (res.ok) {
        setEmailSent(true);
        setTimeout(() => setEmailSent(false), 5000); // Reset status sau 5s
      } else {
        alert("Không thể gửi email. Vui lòng thử lại sau.");
      }
    } catch (error) {
      console.error("Reset password error", error);
      alert("Lỗi hệ thống.");
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans mt-20">
      <div className="max-w-6xl mx-auto">

        {/* Title Section */}
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Hồ sơ cá nhân</h1>
            <p className="text-gray-500 mt-1 text-sm">Quản lý thông tin định danh và bảo mật tài khoản</p>
          </div>

          {/* Action Button: Edit / Save / Cancel */}
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2 font-medium"
                >
                  <FontAwesomeIcon icon={faTimes} /> Hủy
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-medium"
                >
                  {saving ? (
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <FontAwesomeIcon icon={faSave} />
                  )}
                  Lưu thay đổi
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm flex items-center gap-2 font-medium"
              >
                <FontAwesomeIcon icon={faPen} className="text-sm" /> Chỉnh sửa
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* 🟢 LEFT COLUMN: Identity Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white ring-2 ring-indigo-50 shadow-lg">
                  <Image
                    src={profile.avatar || "/images/default.jpg"}
                    alt="Avatar"
                    width={128}
                    height={128}
                    className="object-cover w-full h-full"
                  />
                </div>
                {isEditing && (
                  <>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-1 right-1 bg-indigo-600 text-white p-2.5 rounded-full shadow-lg hover:bg-indigo-700 transition-all z-10"
                      title="Đổi ảnh đại diện"
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
                  </>
                )}
              </div>

              <h2 className="mt-4 text-xl font-bold text-gray-800">{profile.name}</h2>
              <p className="text-gray-500 text-sm mt-1">{profile.username || "Thành viên"}</p>

              <div className="mt-6 w-full space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-xs text-gray-500 font-semibold uppercase">Trạng thái</span>
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-md">Hoạt động</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-xs text-gray-500 font-semibold uppercase">Tham gia</span>
                  <span className="text-gray-700 text-sm font-medium">12/2023</span>
                </div>
              </div>
            </div>

            {/* Security Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                <FontAwesomeIcon icon={faLock} className="text-indigo-500" /> Bảo mật
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Bạn muốn thay đổi mật khẩu? Chúng tôi sẽ gửi hướng dẫn đến email của bạn.
              </p>

              {emailSent ? (
                <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg flex items-center gap-2 animate-pulse">
                  <FontAwesomeIcon icon={faCheckCircle} />
                  Đã gửi email thành công!
                </div>
              ) : (
                <button
                  onClick={handleRequestPasswordReset}
                  disabled={sendingEmail}
                  className="w-full py-2.5 border border-indigo-200 text-indigo-700 rounded-xl hover:bg-indigo-50 hover:border-indigo-300 transition-all font-medium text-sm flex items-center justify-center gap-2"
                >
                  {sendingEmail ? "Đang gửi..." : (
                    <>
                      <FontAwesomeIcon icon={faPaperPlane} /> Gửi email đặt lại mật khẩu
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* 🟢 RIGHT COLUMN: Details Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h3 className="text-lg font-bold text-gray-800 mb-6 border-b pb-4">Thông tin chi tiết</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Họ và tên</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      disabled={!isEditing}
                      value={profile.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl border transition-all outline-none ${isEditing
                          ? "border-gray-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 bg-white"
                          : "border-transparent bg-gray-50 text-gray-600 cursor-not-allowed"
                        }`}
                    />
                    <FontAwesomeIcon icon={faUser} className="absolute right-4 top-3.5 text-gray-400 text-sm" />
                  </div>
                </div>

                {/* Email (Read only always) */}
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Email (Định danh)</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="w-full px-4 py-3 rounded-xl border border-transparent bg-gray-100 text-gray-500 cursor-not-allowed opacity-70"
                    />
                    <FontAwesomeIcon icon={faEnvelope} className="absolute right-4 top-3.5 text-gray-400 text-sm" />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Số điện thoại</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="phone"
                      disabled={!isEditing}
                      value={profile.phone || ""}
                      onChange={handleChange}
                      placeholder={isEditing ? "Nhập số điện thoại" : "Chưa cập nhật"}
                      className={`w-full px-4 py-3 rounded-xl border transition-all outline-none ${isEditing
                          ? "border-gray-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 bg-white"
                          : "border-transparent bg-gray-50 text-gray-600 cursor-not-allowed"
                        }`}
                    />
                    <FontAwesomeIcon icon={faPhone} className="absolute right-4 top-3.5 text-gray-400 text-sm" />
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Giới tính</label>
                  <div className="relative">
                    <select
                      name="gender"
                      disabled={!isEditing}
                      value={profile.gender || ""}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl border transition-all outline-none appearance-none ${isEditing
                          ? "border-gray-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 bg-white"
                          : "border-transparent bg-gray-50 text-gray-600 cursor-not-allowed"
                        }`}
                    >
                      <option value="">Chưa cập nhật</option>
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                      <option value="other">Khác</option>
                    </select>
                    <FontAwesomeIcon icon={faVenusMars} className="absolute right-4 top-3.5 text-gray-400 text-sm" />
                  </div>
                </div>

                {/* Birthday */}
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Ngày sinh</label>
                  <div className="relative">
                    <input
                      type="date"
                      name="birthday"
                      disabled={!isEditing}
                      value={profile.birthday ? new Date(profile.birthday).toISOString().split('T')[0] : ""}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl border transition-all outline-none ${isEditing
                          ? "border-gray-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 bg-white"
                          : "border-transparent bg-gray-50 text-gray-600 cursor-not-allowed"
                        }`}
                    />
                    <FontAwesomeIcon icon={faCake} className="absolute right-4 top-3.5 text-gray-400 text-sm" />
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}