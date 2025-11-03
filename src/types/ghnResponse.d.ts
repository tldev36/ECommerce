// Interface chi tiết phản hồi GHN khi tạo đơn hàng
export interface GHNCreateOrderResponse {
    expected_delivery_time?: string; // ⏰ Thời gian giao dự kiến (ISO string hoặc timestamp)
    fee?: number;                    // 💰 Tổng phí vận chuyển (đơn vị: VND)
    coupon?: number;                 // 🎟️ Giá trị khuyến mãi (nếu có)
    insurance?: number;              // 🛡️ Phí khai giá hàng hóa (bảo hiểm)
    main_service?: number;           // 🚚 Phí vận chuyển chính
    r2s?: number;                    // 🔁 Phí giao lại hàng (Re-delivery fee)
    return?: number;                 // 📦 Phí hoàn hàng (Return fee)
    station_do?: number;             // 🏣 Phí gửi hàng tại bưu cục (Drop-off fee)
    station_pu?: number;             // 🏠 Phí lấy hàng tại bưu cục (Pick-up fee)
    order_code?: string;             // 🧾 Mã đơn hàng do GHN cấp (định danh duy nhất)
    sort_code?: string;              // 🧮 Mã phân loại tuyến giao hàng
    total_fee?: number;              // 💵 Tổng phí dịch vụ phải trả (tổng cộng)
    trans_type?: string;             // 🚛 Loại vận chuyển (VD: "truck", "bike")
}
// {
//     "expected_delivery_time": "2025-11-03T18:00:00Z",
//         "fee": 28000,
//             "coupon": 0,
//                 "insurance": 2000,
//                     "main_service": 25000,
//                         "r2s": 0,
//                             "return": 0,
//                                 "station_do": 0,
//                                     "station_pu": 0,
//                                         "order_code": "GHN123456789VN",
//                                             "sort_code": "HCM01A",
//                                                 "total_fee": 30000,
//                                                     "trans_type": "bike"
// }
