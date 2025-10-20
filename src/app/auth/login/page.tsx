"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Cookies from "js-cookie";
import { useCart } from "@/context/CartContext";

// ✅ Schema validation bằng Zod
const loginSchema = z.object({
  email: z.string().nonempty("Vui lòng nhập email").email("Email không hợp lệ"),
  password: z
    .string()
    .nonempty("Vui lòng nhập mật khẩu")
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams?.get("redirect") ?? "/customer/home";
  const { setCartFromServer } = useCart();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include", // để nhận cookie
      });

      if (!res.ok) {
        // nếu sai email hoặc mật khẩu
        setError("root", { message: "Email hoặc mật khẩu không đúng!" });
        return;
      }

      const loginData = await res.json();
      console.log("JWT Token:", loginData.token);

      // ✅ Lưu token hoặc chỉ cần role từ server
      const role = loginData?.user?.role;
      console.log("Role:", role);

      // Merge giỏ hàng từ cookie (nếu có)
      const tempCart = Cookies.get("cart_temp")
        ? JSON.parse(Cookies.get("cart_temp")!)
        : [];

      if (tempCart.length > 0) {
        await fetch("/api/cart/merge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ items: tempCart }),
        });
        Cookies.remove("cart_temp");
      }

      // Lấy giỏ hàng từ server
      const cartRes = await fetch("/api/cart", { credentials: "include" });
      if (cartRes.ok) {
        const cartData = await cartRes.json();
        if (cartData?.cart) {
          setCartFromServer(cartData.cart);
        }
      }

      // ✅ Chuyển hướng theo role
      if (role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push(redirect || "/customer/home");
      }
    } catch (err) {
      console.error(err);
      setError("root", { message: "Lỗi server. Vui lòng thử lại!" });
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-50 p-6">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-10 w-full max-w-md border border-gray-100">
        <h2 className="text-3xl font-bold text-center text-green-700 mb-8 drop-shadow-sm">
          Đăng nhập
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Email
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600">
                <FontAwesomeIcon icon={faEnvelope} />
              </span>
              <input
                type="email"
                {...register("email")}
                placeholder="Nhập email"
                className={`w-full border rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 shadow-sm ${errors.email
                  ? "border-red-500 focus:ring-red-400"
                  : "border-gray-300 focus:ring-green-400"
                  }`}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Mật khẩu */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Mật khẩu
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600">
                <FontAwesomeIcon icon={faLock} />
              </span>
              <input
                type="password"
                {...register("password")}
                placeholder="Nhập mật khẩu"
                className={`w-full border rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 shadow-sm ${errors.password
                  ? "border-red-500 focus:ring-red-400"
                  : "border-gray-300 focus:ring-green-400"
                  }`}
              />
            </div>
            {errors.password && (
              <p className="text-sm text-red-600 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Lỗi chung */}
          {errors.root && (
            <p className="text-red-500 text-sm text-center font-medium mt-2">
              {errors.root.message}
            </p>
          )}


          {/* Nút đăng nhập */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-600 hover:bg-green-700 active:scale-95 transition transform text-white py-3 rounded-lg font-semibold shadow-md disabled:opacity-50"
          >
            {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
          </button>

          {/* Link đăng ký */}
          <p className="text-center text-sm text-gray-600 mt-4">
            Chưa có tài khoản?{" "}
            <Link
              href={`/auth/register?redirect=${redirect}`}
              className="text-green-600 hover:text-green-700 hover:underline font-medium"
            >
              Đăng ký ngay
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}