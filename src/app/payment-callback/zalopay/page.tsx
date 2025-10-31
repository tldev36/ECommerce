"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { useCart } from "@/context/CartContext";

export default function ZaloPayCallbackPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"pending" | "success" | "failed">("pending");
  const { clearCart } = useCart();

  useEffect(() => {
    // Lấy giá trị `apptransid` từ URL
    if (!searchParams) {
      console.error("Thiếu searchParams trong URL callback");
      setStatus("failed");
      return;
    }

    const appTransId = searchParams.get("apptransid");
    const paymentStatus = searchParams.get("status"); // ZaloPay trả về 1 nếu thành công

    if (!appTransId) {
      console.error("Thiếu apptransid trong URL callback");
      setStatus("failed");
      return;
    }

    // ✅ Gửi về backend để xác nhận & cập nhật DB
    axios
      .post("/api/zalopay/callback", { app_trans_id: appTransId, status: paymentStatus })
      .then((res) => {
        const data = res.data as { success?: boolean };
        console.log("✅ Callback cập nhật DB:", data);
        if (data.success) {
          setStatus("success");
          // tạo đơn hành cho giao hàng nhanh

          // ✅ Xóa giỏ hàng khi thanh toán thành công
          clearCart();
        } else {
          setStatus("failed");
        }
      })
      .catch((err) => {
        console.error("❌ Callback thất bại:", err);
        setStatus("failed");
      });
  }, [searchParams]);

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
