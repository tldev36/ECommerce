export interface ZaloPayCreateOrderResponse {
  return_code: number;            // 1 = thành công
  return_message: string;         // mô tả kết quả
  sub_return_code?: number;
  sub_return_message?: string;
  zp_trans_token?: string;        // token giao dịch
  order_url?: string;             // link QR thanh toán
  order_token?: string;
  app_trans_id?: string;          // mã giao dịch app
  amount?: number;
  embed_data?: string;
  item?: string;
  description?: string;
}
