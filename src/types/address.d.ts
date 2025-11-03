export interface Address {
  id?: number;                     // ID tự tăng
  user_id?: number;                // Khóa ngoại đến user
  recipient_name: string;          // Tên người nhận
  phone: string;                   // Số điện thoại
  detail_address: string;          // Số nhà, tên đường
  ward_name: string;               // Xã / Phường
  district_name?: string;          // Quận / Huyện
  province_name?: string;          // Tỉnh / Thành phố
  default?: boolean;               // Có phải địa chỉ mặc định không
  create_at?: string;              // Ngày tạo (ISO string khi trả từ API)
  update_at?: string;              // Ngày cập nhật (ISO string)
}
