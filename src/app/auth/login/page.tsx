"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Cookies from "js-cookie";
import { useCart } from "@/context/CartContext";

// Schema validation
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
  const { setCartFromServer, fetchUser, user, isLoggedIn } = useCart();
  
  useEffect(() => {
    console.log("=== CART PAGE DEBUG ===");
    console.log("isLoggedIn:", isLoggedIn);
    console.log("user:", user);

    // Kiểm tra cookie `token` phía client (chỉ để debug)
    console.log(
      "token cookie (client):",
      document.cookie.includes("token") ? "✅ Có token" : "❌ Không có token"
    );
  }, [isLoggedIn, user]);

  // ✅ Kiểm tra nếu đã login => redirect
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      const data = await res.json();
      if (data.user) {
        if (data.user.role === "admin") router.replace("/admin/dashboard");
        else router.replace("/customer/home");
      }
    })();
  }, [router]);

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
        credentials: "include",
      });

      if (!res.ok) {
        setError("root", { message: "Email hoặc mật khẩu không đúng!" });
        return;
      }

      await fetchUser();

      const loginData = await res.json();
      const role = loginData?.user?.role;

      // 🔹 Nếu là admin → chuyển hướng ngay, không merge giỏ hàng
      if (role === "admin") {
        router.push("/admin/dashboard");
        return;
      }

      // Merge giỏ hàng...
      const tempCart = Cookies.get("cart_temp") ? JSON.parse(Cookies.get("cart_temp")!) : [];
      if (tempCart.length > 0) {
        await fetch("/api/cart/merge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ items: tempCart }),
        });
        Cookies.remove("cart_temp");
      }

      // 🔹 Lấy lại giỏ hàng sau khi merge
      const cartRes = await fetch("/api/cart", { credentials: "include" });
      if (cartRes.ok) {
        const cartData = await cartRes.json();
        if (cartData?.cart) setCartFromServer(cartData.cart);
      }

      // 🔹 Redirect user thường
      router.push(redirect || "/customer/home");
      
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
              <input
                type="email"
                {...register("email")}
                placeholder="Nhập email"
                className={`w-full border rounded-lg pl-3 pr-4 py-2 focus:outline-none focus:ring-2 shadow-sm ${errors.email ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-green-400"}`}
              />
            </div>
            {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                type="password"
                {...register("password")}
                placeholder="Nhập mật khẩu"
                className={`w-full border rounded-lg pl-3 pr-4 py-2 focus:outline-none focus:ring-2 shadow-sm ${errors.password ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-green-400"}`}
              />
            </div>
            {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>}
          </div>

          {/* Lỗi chung */}
          {errors.root && <p className="text-red-500 text-sm text-center font-medium mt-2">{errors.root.message}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-600 hover:bg-green-700 active:scale-95 transition transform text-white py-3 rounded-lg font-semibold shadow-md disabled:opacity-50"
          >
            {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
}
