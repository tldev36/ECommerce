// Mẫu Response trả về từ MoMo API
export interface MoMoCreatePaymentResponse {
  partnerCode: string; // Mã tích hợp
  requestId: string; // ID của request ban đầu
  orderId: string; // Mã đơn hàng
  amount: number; // Số tiền thanh toán
  responseTime: number; // timestamp
  message: string; // Thông điệp mô tả
  resultCode: number; // Mã kết quả giao dịch
  payUrl?: string; // Link thanh toán MoMo
  deeplink?: string; // Link mở app MoMo trực tiếp
  qrCodeUrl?: string; // Dữ liệu để tạo mã QR
  deeplinkMiniApp?: string; // Link mở mini app trong MoMo
  signature: string; // Chữ ký Hmac_SHA256 xác thực
  userFee?: number; // Phí người dùng (nếu có)
}
