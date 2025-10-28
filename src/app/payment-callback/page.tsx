"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function PaymentCallbackPage() {
  const [status, setStatus] = useState<"success" | "failed" | "pending">("pending");
  const searchParams = useSearchParams();
  const router = useRouter();

  // Xác định trạng thái thanh toán
  useEffect(() => {
    const returnCode = searchParams?.get("status");
    if (returnCode === "1") {
      setStatus("success");
    } else {
      setStatus("failed");
    }
  }, [searchParams]);

  // Chuyển hướng về trang chủ sau 5 giây
  useEffect(() => {
    if (status !== "pending") {
      const timer = setTimeout(() => {
        router.push("/");
      }, 5000);
      return () => clearTimeout(timer); // cleanup nếu component unmount
    }
  }, [status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-8 bg-white rounded shadow-md text-center">
        {status === "pending" && <p>Đang xử lý thanh toán...</p>}
        {status === "success" && <p className="text-green-600 font-bold text-xl">🎉 Bạn đã thanh toán thành công!</p>}
        {status === "failed" && <p className="text-red-600 font-bold text-xl">❌ Thanh toán thất bại!</p>}
        {status !== "pending" && <p className="mt-4 text-gray-500">Bạn sẽ được chuyển hướng về trang chủ sau 5 giây...</p>}
      </div>
    </div>
  );
}
