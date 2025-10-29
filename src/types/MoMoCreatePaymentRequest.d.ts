// Mẫu Request gửi tới MoMo API
export interface MoMoItem {
  id: string; // SKU number
  name: string; // Tên sản phẩm
  description?: string; // Miêu tả sản phẩm
  category?: string; // Phân loại ngành hàng
  imageUrl?: string; // Link hình ảnh
  manufacturer?: string; // Tên nhà sản xuất
  price: number; // Đơn giá
  currency: "VND"; // Đơn vị tiền tệ
  quantity: number; // Số lượng > 0
  unit?: string; // Đơn vị đo lường
  totalPrice: number; // Tổng giá = price * quantity
  taxAmount?: number; // Tổng thuế
}

export interface MoMoDeliveryInfo {
  deliveryAddress: string; // Địa chỉ giao hàng
  deliveryFee?: string; // Phí giao hàng
  quantity?: string; // Tổng số lượng sản phẩm
}

export interface MoMoUserInfo {
  name: string; // Tên người dùng
  phoneNumber: string; // Số điện thoại
  email?: string; // Email người dùng
}

export interface MoMoCreatePaymentRequest {
  partnerCode: string; // Mã tích hợp
  subPartnerCode?: string; // Chỉ dùng cho Master Merchant hoặc 3PSP
  storeName?: string; // Tên cửa hàng
  storeId?: string; // Mã cửa hàng
  requestId: string; // Định danh duy nhất cho mỗi yêu cầu
  amount: number; // Số tiền cần thanh toán
  orderId: string; // Mã đơn hàng của đối tác
  orderInfo: string; // Thông tin đơn hàng hiển thị
  orderGroupId?: number; // Nhóm đơn hàng (MoMo cung cấp)
  redirectUrl: string; // URL redirect sau khi thanh toán
  ipnUrl: string; // URL nhận callback từ MoMo
  requestType: "captureWallet"; // Loại yêu cầu (thường là captureWallet)
  extraData?: string; // Base64(JSON) dữ liệu bổ sung
  items?: MoMoItem[]; // Danh sách sản phẩm
  deliveryInfo?: MoMoDeliveryInfo; // Thông tin giao hàng
  userInfo?: MoMoUserInfo; // Thông tin khách hàng
  referenceId?: string; // Mã tham chiếu phụ (VD: mã khách hàng)
  autoCapture?: boolean; // Mặc định: true
  lang?: "vi" | "en"; // Ngôn ngữ phản hồi
  signature: string; // Chữ ký Hmac_SHA256
}
