export interface ZaloPayCreateOrderRequest {
  app_id: number;                // ID app Zalopay
  app_user: string;              // ID hoặc username người dùng
  app_trans_id: string;          // Mã giao dịch: yymmdd_OrderID
  app_time: number;              // timestamp milisecond
  amount: number;                // tổng tiền
  description: string;           // mô tả đơn hàng
  callback_url?: string;         // URL callback server-to-server
  sub_app_id?: string;           // ID dịch vụ/nhóm dịch vụ
  item: string;                  // JSON string danh sách sản phẩm
  embed_data: string;            // JSON string thông tin đặc biệt
  bank_code?: string;            // Mã ngân hàng / cổng thanh toán
  expire_duration_seconds?: number; // thời gian hết hạn (giây)
  mac: string;                   // HMAC chứng thực
}
