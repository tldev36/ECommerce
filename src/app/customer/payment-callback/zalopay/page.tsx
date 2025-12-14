"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import axios from "axios";

export default function ZaloPayCallbackPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"pending" | "success" | "failed">("pending");
  const { clearCart } = useCart();
  const router = useRouter();
  useEffect(() => {
    const handleCallback = async () => {
      if (!searchParams) {
        setStatus("failed");
        return;
      }

      const appTransId = searchParams.get("apptransid");
      const paymentStatus = searchParams.get("status"); // 1 = thành công

      if (!appTransId) {
        setStatus("failed");
        return;
      }

      if (paymentStatus === "1") {
        setStatus("success");

        // tạo hóa đơn giao hàng nhanh
        await axios.get("/api/zalopay/callback", {
          params: {
            apptransid: appTransId,
          }
        });

        // ✅ Xóa giỏ hàng
        clearCart();

        // ⏩ Redirect sau 1s để tránh loop
        setTimeout(() => {
          router.push("/customer/home");
        }, 500);
      } else {
        setStatus("failed");
      }
    };

    handleCallback();
  }, []); // ❌ KHÔNG để searchParams trong dependency


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-8 bg-white rounded shadow-md text-center max-w-md">
        {status === "pending" && <p>⏳ Đang xử lý thanh toán...</p>}
        {status === "success" && (
          <>
            <p className="text-green-600 font-bold text-xl mb-2">🎉 Thanh toán thành công!</p>
            <p className="text-gray-600">Đơn hàng của bạn đã được xác nhận.</p>
          </>
        )}
        {status === "failed" && (
          <>
            <p className="text-red-600 font-bold text-xl mb-2">❌ Thanh toán thất bại!</p>
            <p className="text-gray-600">Vui lòng thử lại hoặc chọn phương thức khác.</p>
          </>
        )}
      </div>
    </div>
  );
}
