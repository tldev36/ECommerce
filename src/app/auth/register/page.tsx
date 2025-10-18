"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// ✅ Schema với Zod
export const registerSchema = z.object({
  username: z
    .string()
    .nonempty("Vui lòng nhập tên đăng nhập"),

  name: z
    .string()
    .nonempty("Vui lòng nhập họ tên"),

  email: z
    .string()
    .nonempty("Vui lòng nhập email")
    .email("Email không hợp lệ"),

  password: z
    .string()
    .nonempty("Vui lòng nhập mật khẩu")
    .min(6, "Mật khẩu ít nhất 6 ký tự"),

  phone: z
    .string()
    .nonempty("Vui lòng nhập số điện thoại")
    .regex(/^\d{9,11}$/, "Số điện thoại phải có 9–11 chữ số"),

  gender: z.enum(["male", "female"], {
    error: "Vui lòng chọn giới tính",
  }),

  birthday: z
    .string()
    .nonempty("Vui lòng nhập ngày sinh"),
});

export type RegisterForm = z.infer<typeof registerSchema>;

// ✅ Hàm sinh className cho input
const inputClass = (hasError?: boolean) =>
  `w-full p-2.5 border rounded-lg shadow-sm transition ${hasError
    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
    : "border-gray-300 focus:ring-green-500 focus:border-green-500"
  }`;

export default function RegisterPage() {
  const router = useRouter();
  const [success, setSuccess] = useState("");
  const [serverError, setServerError] = useState("");
  const [gender, setGender] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
  });

  const onSubmit = async (data: RegisterForm) => {
    setServerError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        setServerError(result.error || "Đăng ký thất bại");
      } else {
        setSuccess("🎉 Đăng ký thành công! Đang chuyển hướng...");
        reset();
        setTimeout(() => router.push("/auth/login"), 1500);
      }
    } catch (err) {
      setServerError("Có lỗi xảy ra, vui lòng thử lại");
    }
  };

  return (
    <div className="pt-20 min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-200">
        <h2 className="text-3xl font-bold text-center text-green-700 mb-6">
          Đăng ký tài khoản
        </h2>

        {/* Thông báo lỗi / thành công */}
        {serverError && (
          <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded-md text-center">
            {serverError}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 text-sm text-green-700 bg-green-100 border border-green-300 rounded-md text-center">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Username */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên đăng nhập
            </label>
            <input
              type="text"
              {...register("username")}
              className={inputClass(!!errors.username)}
            />
            {errors.username && (
              <p className="text-red-600 text-sm mt-1">
                {errors.username.message}
              </p>
            )}
          </div>


          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Họ và tên
            </label>
            <input
              type="text"
              {...register("name")}
              className={inputClass(!!errors.name)}
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              {...register("email")}
              className={inputClass(!!errors.email)}
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu
            </label>
            <input
              type="password"
              {...register("password")}
              className={inputClass(!!errors.password)}
            />
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số điện thoại
            </label>
            <input
              type="text"
              {...register("phone")}
              className={inputClass(!!errors.phone)}
            />
            {errors.phone && (
              <p className="text-red-600 text-sm mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Giới tính
            </label>
            <select
              {...register("gender")}
              className={inputClass(!!errors.gender)}
              value={gender} // điều khiển value bằng state
              onChange={(e) => setGender(e.target.value)}
              
            >
              <option value="" disabled>-- Chọn giới tính --</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
            </select>
            {errors.gender && (
              <p className="text-red-600 text-sm mt-1">
                {errors.gender.message}
              </p>
            )}
          </div>

          {/* Birthday */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ngày sinh
            </label>
            <input
              type="date"
              {...register("birthday")}
              className={inputClass(!!errors.birthday)}
            />
            {errors.birthday && (
              <p className="text-red-600 text-sm mt-1">
                {errors.birthday.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 shadow-md transition"
          >
            {isSubmitting ? "Đang xử lý..." : "Đăng ký"}
          </button>

          {/* Link sang login */}
          <p className="text-center text-sm text-gray-600 mt-4">
            Đã có tài khoản?{" "}
            <a
              href="/auth/login"
              className="text-green-600 hover:underline font-medium"
            >
              Đăng nhập
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
