"use client";

import React from "react";

export default function InvoiceModal({ isOpen, onClose, order }: any) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-[420px] p-6 relative text-gray-800">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-red-600 text-xl"
        >
          ✕
        </button>

        {/* Tiêu đề */}
        <h2 className="text-xl font-bold text-center mb-2 text-green-700">
          🧾 HÓA ĐƠN BÁN HÀNG
        </h2>
        <p className="text-center text-sm text-gray-500 border-b pb-2">
          Cảm ơn quý khách đã mua hàng 💚
        </p>

        {/* Thông tin đơn */}
        <div className="text-sm mt-3 space-y-1">
          <p>
            <strong>Mã đơn:</strong> {order.orderCode}
          </p>
          <p>
            <strong>Ngày:</strong> {order.date}
          </p>
          <p>
            <strong>Khách hàng:</strong> {order.recipient}
          </p>
          <p>
            <strong>Địa chỉ:</strong> {order.address}
          </p>
        </div>

        {/* Danh sách sản phẩm */}
        <div className="mt-4 border-t border-b py-2 text-sm">
          {order.items.map((item: any, i: number) => (
            <div key={i} className="flex justify-between py-1">
              <div className="flex-1">
                <p>{item.name}</p>
                <p className="text-xs text-gray-500">
                  SL: {item.quantity} × {item.price.toLocaleString()} ₫
                </p>
              </div>
              <div className="text-right font-medium">
                {(item.price * item.quantity).toLocaleString()} ₫
              </div>
            </div>
          ))}
        </div>

        {/* Tổng cộng */}
        <div className="mt-3 space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Tạm tính:</span>
            <span>{order.total.toLocaleString()} ₫</span>
          </div>

          {order.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Giảm giá:</span>
              <span>-{order.discount.toLocaleString()} ₫</span>
            </div>
          )}

          <div className="flex justify-between border-t pt-2 mt-2 text-base font-semibold text-green-700">
            <span>Tổng cộng:</span>
            <span className="text-red-600">
              {order.finalTotal.toLocaleString()} ₫
            </span>
          </div>
        </div>

        {/* Ghi chú */}
        <p className="text-center text-xs text-gray-400 mt-4">
          Phiếu này chỉ có giá trị tham khảo – không thay thế hóa đơn VAT.
        </p>
      </div>
    </div>
  );
}
