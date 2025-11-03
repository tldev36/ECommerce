// Interface cho danh mục sản phẩm
export interface GHNCategory {
  level1?: string; // Danh mục cấp 1
  level2?: string; // Danh mục cấp 2
  level3?: string; // Danh mục cấp 3
}

// Interface cho từng sản phẩm trong đơn hàng
export interface GHNItem {
  name: string; // Tên sản phẩm
  code?: string; // Mã sản phẩm
  quantity: number; // Số lượng sản phẩm
  price: number; // Giá sản phẩm (đơn vị: VND)
  length?: number; // Chiều dài (cm) - bắt buộc nếu hàng nặng
  width?: number; // Chiều rộng (cm)
  height?: number; // Chiều cao (cm)
  weight?: number; // Khối lượng (gram)
  category?: GHNCategory; // Danh mục sản phẩm (3 cấp)
}

// Interface chính gửi request tạo đơn hàng GHN
export interface GHNCreateOrderRequest {
  // ======= Thông tin bắt buộc =======
  token: string; // Định danh tài khoản GHN (API Token)
  shop_id: number; // Mã shop GHN

  // ======= Thông tin người gửi =======
  from_name?: string; // Tên người gửi - nếu không truyền sẽ lấy theo ShopID
  from_phone?: string; // Số điện thoại người gửi
  from_address?: string; // Địa chỉ người gửi
  from_ward_name?: string; // Phường/Xã người gửi
  from_district_name?: string; // Quận/Huyện người gửi
  from_province_name?: string; // Tỉnh/Thành người gửi

  // ======= Thông tin người nhận =======
  to_name: string; // Tên người nhận (bắt buộc)
  to_phone: string; // SĐT người nhận (bắt buộc)
  to_address: string; // Địa chỉ giao hàng (bắt buộc)
  to_ward_name: string; // Phường/Xã người nhận (bắt buộc)
  to_district_name: string; // Quận/Huyện người nhận (bắt buộc)
  to_province_name: string; // Tỉnh/Thành người nhận (bắt buộc)

  // ======= Thông tin trả hàng (nếu có) =======
  return_phone?: string; // SĐT trả hàng
  return_address?: string; // Địa chỉ trả hàng
  return_district_name?: string; // Quận/Huyện trả hàng
  return_ward_name?: string; // Phường/Xã trả hàng
  return_province_name?: string; // Tỉnh trả hàng

  // ======= Thông tin đơn hàng =======
  client_order_code?: string | null; // Mã đơn hàng riêng của khách hàng (nếu có)
  cod_amount?: number; // Tiền thu hộ (VND) - tối đa 50.000.000
  content?: string; // Nội dung đơn hàng / mô tả hàng hóa
  weight?: number; // Khối lượng (gram) - bắt buộc nếu service_type_id = 2
  length?: number; // Dài (cm) - bắt buộc nếu service_type_id = 2
  width?: number; // Rộng (cm) - bắt buộc nếu service_type_id = 2
  height?: number; // Cao (cm) - bắt buộc nếu service_type_id = 2
  pick_station_id?: number | null; // Mã bưu cục gửi hàng (nếu gửi tại điểm)
  insurance_value?: number; // Giá trị bảo hiểm đơn hàng (<= 5.000.000)
  coupon?: string; // Mã giảm giá (nếu có)

  // ======= Dịch vụ và thanh toán =======
  service_type_id: number; // Loại dịch vụ: 2 = hàng nhẹ, 5 = hàng nặng
  payment_type_id: number; // 1 = người gửi trả, 2 = người nhận trả
  required_note: "CHOTHUHANG" | "CHOXEMHANGKHONGTHU" | "KHONGCHOXEMHANG"; // Ghi chú bắt buộc
  note?: string; // Ghi chú thêm cho tài xế

  // ======= Ca lấy hàng / thời gian =======
  pick_shift?: number[]; // Mảng ca lấy hàng (theo API GHN)
  pickup_time?: number; // Thời gian mong muốn lấy hàng (Unix timestamp)

  // ======= Thông tin sản phẩm =======
  items?: GHNItem[]; // Danh sách sản phẩm (bắt buộc nếu hàng nặng)

  // ======= Khác =======
  cod_failed_amount?: number; // Thu thêm tiền nếu giao hàng thất bại
}
