export const ORDER_STATUS = {
  PENDING: {
    code: 'PENDING',
    label: 'Chờ xác nhận',
    description: 'Khách vừa đặt đơn xong. Đơn hàng mới tinh.',
    color: '#F59E0B', // Vàng (Amber)
    systemActions: [
      'Trừ tồn kho tạm thời (hoặc chưa trừ tùy logic)',
      'Admin nhận thông báo có đơn mới'
    ]
  },
  // CONFIRMED: {
  //   code: 'CONFIRMED',
  //   label: 'Đã xác nhận',
  //   description: 'Admin đã gọi điện xác nhận thông tin với khách.',
  //   color: '#3B82F6', // Xanh dương (Blue)
  //   systemActions: [
  //     'Xác nhận thông tin địa chỉ/SĐT hợp lệ',
  //     'Chuẩn bị chuyển sang bộ phận kho'
  //   ]
  // },
  // ✨ MỚI THÊM VÀO ĐÂY
  PROCESSING: {
    code: 'PROCESSING',
    label: 'Xác nhận',
    description: 'Admin/Kho đã xác nhận. Nhân viên đang nhặt hàng, đóng hộp. Khách không thể hủy.',
    color: '#0EA5E9', // Xanh da trời (Sky Blue) - Màu của sự hoạt động tích cực
    systemActions: [
      'Trừ tồn kho thực tế (Hard Commit)',
      'Chặn quyền Hủy của user trên App/Web',
      'Gọi API vận chuyển (GHN/GHTK) để lấy mã vận đơn',
      'Gửi email báo "Đơn hàng đang được chuẩn bị"'
    ]
  },
  SHIPPING: {
    code: 'SHIPPING',
    label: 'Đang giao hàng',
    description: 'Shipper đã lấy hàng ra khỏi kho và đang trên đường đi.',
    color: '#8B5CF6', // Tím (Violet)
    systemActions: [
      'Hàng đã rời kho nhưng Tiền chưa về (Rủi ro cần theo dõi)'
    ]
  },
  COMPLETED: {
    code: 'COMPLETED',
    label: 'Hoàn thành',
    description: 'Giao thành công + Đã thu tiền (Cash).',
    color: '#10B981', // Xanh lá (Emerald)
    systemActions: [
      'Cộng doanh thu vào báo cáo',
      'Ghi nhận dòng tiền đã về két',
      'Hoàn lại tồn kho (nếu đã trừ - logic check lại)'
    ]
  },
  CANCELLED: {
    code: 'CANCELLED',
    label: 'Đã hủy',
    description: 'Đơn hàng thất bại.',
    color: '#EF4444', // Đỏ (Red)
    systemActions: [
      'Hoàn lại tồn kho (nếu đã trừ)',
      'Gồm 2 trường hợp: Khách hủy trước khi giao hoặc Bom hàng'
    ]
  }
} as const;

// Tạo type để dùng cho TypeScript
export type OrderStatusType = keyof typeof ORDER_STATUS;
export const ORDER_STATUS_LIST = Object.values(ORDER_STATUS);