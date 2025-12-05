// lib/mail.ts
import nodemailer from "nodemailer";
import { ORDER_STATUS, OrderStatusType } from "@/config/order-status.config";

// Định nghĩa kiểu dữ liệu
interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  discount?: number; // ✅ Bạn đã thêm dòng này
}

interface SendMailParams {
  to: string;
  orderCode: string;
  customerName: string;
  items: OrderItem[];
  totalAmount: number;
  address: string;
  shippingFee?: number;
  couponAmount?: number;
}

export const sendOrderConfirmationEmail = async ({
  to,
  orderCode,
  customerName,
  items,
  totalAmount,
  address,
  shippingFee = 0,
  couponAmount = 0,
}: SendMailParams) => {

  // 1. Cấu hình transporter
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // 2. 🔥 CẬP NHẬT: Tính lại Subtotal dựa trên giá thực tế (sau khi trừ giảm giá từng món)
  const subTotal = items.reduce((sum, item) => {
    const originalPrice = Number(item.price);
    const discountPercent = Number(item.discount || 0);
    // Tính giá sau giảm của 1 sản phẩm
    const finalPrice = discountPercent > 0
      ? originalPrice * (1 - discountPercent / 100)
      : originalPrice;

    return sum + (finalPrice * Number(item.quantity));
  }, 0);

  // 3. 🔥 CẬP NHẬT: Hiển thị giá cũ/mới trong bảng HTML
  const itemsHtml = items
    .map((item) => {
      const originalPrice = Number(item.price);
      const discountPercent = Number(item.discount || 0);
      const hasDiscount = discountPercent > 0;

      // Tính giá sau giảm để hiển thị cột Thành tiền
      const finalUnitPrice = hasDiscount
        ? originalPrice * (1 - discountPercent / 100)
        : originalPrice;

      const lineTotal = finalUnitPrice * Number(item.quantity);

      // Logic hiển thị cột Đơn giá: Nếu có giảm thì hiện 2 dòng (Cũ gạch ngang, Mới màu đỏ)
      const priceDisplay = hasDiscount
        ? `<div><span style="text-decoration: line-through; color: #999; font-size: 11px;">${originalPrice.toLocaleString('vi-VN')} đ</span></div>
               <div style="color: #d32f2f; font-weight: bold;">${finalUnitPrice.toLocaleString('vi-VN')} đ <span style="font-size: 10px; background: #ffebee; padding: 1px 3px; border-radius: 3px;">-${discountPercent}%</span></div>`
        : `${originalPrice.toLocaleString('vi-VN')} đ`;

      return `
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">
                ${item.name}
            </td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">
                ${item.quantity}
            </td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">
                ${priceDisplay}
            </td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right; font-weight: 500;">
                ${lineTotal.toLocaleString('vi-VN')} đ
            </td>
        </tr>
        `;
    })
    .join("");

  // 4. Gửi mail
  await transporter.sendMail({
    from: `"Nông Sản Việt" <${process.env.SMTP_USER}>`,
    to,
    subject: `Xác nhận đơn hàng #${orderCode}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #2e7d32; padding: 20px; text-align: center;">
            <h2 style="color: #fff; margin: 0;">Cảm ơn bạn đã đặt hàng!</h2>
        </div>
        
        <div style="padding: 20px;">
            <p>Xin chào <strong>${customerName}</strong>,</p>
            <p>Đơn hàng <strong>${orderCode}</strong> của bạn đã được tiếp nhận và đang trong quá trình xử lý.</p>
            
            <h3 style="color: #333; border-bottom: 2px solid #2e7d32; padding-bottom: 5px; margin-top: 20px;">Chi tiết đơn hàng</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
                <tr style="background-color: #f9f9f9; color: #333;">
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Sản phẩm</th>
                <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">SL</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Đơn giá</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Thành tiền</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHtml}
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="3" style="padding: 8px; text-align: right; font-weight: bold; color: #666;">Tạm tính:</td>
                    <td style="padding: 8px; text-align: right;">${subTotal.toLocaleString('vi-VN')} đ</td>
                </tr>
                <tr>
                    <td colspan="3" style="padding: 8px; text-align: right; color: #666;">Phí vận chuyển:</td>
                    <td style="padding: 8px; text-align: right;">${shippingFee.toLocaleString('vi-VN')} đ</td>
                </tr>
                ${couponAmount > 0 ? `
                <tr>
                    <td colspan="3" style="padding: 8px; text-align: right; color: #2e7d32;">Voucher giảm giá:</td>
                    <td style="padding: 8px; text-align: right; color: #2e7d32;">-${couponAmount.toLocaleString('vi-VN')} đ</td>
                </tr>
                ` : ''}
                <tr style="background-color: #f2f2f2;">
                    <td colspan="3" style="padding: 12px; text-align: right; font-weight: bold; font-size: 16px;">TỔNG CỘNG:</td>
                    <td style="padding: 12px; text-align: right; font-weight: bold; font-size: 18px; color: #d32f2f;">${Number(totalAmount).toLocaleString('vi-VN')} đ</td>
                </tr>
            </tfoot>
            </table>

            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
                <p style="margin: 0;"><strong>Địa chỉ giao hàng:</strong></p>
                <p style="margin: 5px 0 0 0; color: #555;">${address}</p>
            </div>
            
            <p style="margin-top: 30px; font-size: 13px; color: #888; text-align: center;">
                Nếu có thắc mắc, vui lòng liên hệ hotline 1900 xxxx.<br/>
                Đây là email tự động, vui lòng không trả lời.
            </p>
        </div>
      </div>
    `,
  });
};

// mail update status order
export const sendOrderStatusUpdateEmail = async ({
  to,
  orderCode,
  customerName,
  newStatus,
  note,
}: {
  to: string;
  orderCode: string;
  customerName: string;
  newStatus: string;
  note?: string;
}) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // 1. Tìm thông tin trạng thái từ file config
  // Chuyển newStatus về chữ hoa để khớp với key trong ORDER_STATUS (ví dụ: "pending" -> "PENDING")
  const statusKey = newStatus.toUpperCase() as OrderStatusType;
  const statusConfig = ORDER_STATUS[statusKey];

  // 2. Lấy dữ liệu hiển thị (có Fallback nếu không tìm thấy)
  const statusLabel = statusConfig ? statusConfig.label : newStatus;
  const statusColor = statusConfig ? statusConfig.color : '#2e7d32'; // Mặc định xanh nếu lỗi
  const statusDescription = statusConfig ? statusConfig.description : '';

  await transporter.sendMail({
    from: `"Nông Sản Việt" <${process.env.SMTP_USER}>`,
    to,
    subject: `Cập nhật trạng thái đơn hàng #${orderCode}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; padding: 20px;">
        <h2 style="color: #2e7d32; margin-top: 0; text-align: center;">Thông báo đơn hàng</h2>
        
        <p>Xin chào <strong>${customerName}</strong>,</p>
        <p>Đơn hàng <strong>#${orderCode}</strong> của bạn vừa được cập nhật trạng thái:</p>
        
        <div style="
            background-color: ${statusColor}1A; /* Thêm độ trong suốt 10% */
            border-left: 5px solid ${statusColor};
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        ">
            <div style="font-size: 20px; font-weight: bold; color: ${statusColor}; margin-bottom: 5px;">
                ${statusLabel.toUpperCase()}
            </div>
            ${statusDescription ? `<div style="font-size: 13px; color: #555;">${statusDescription}</div>` : ''}
        </div>

        ${note ? `
        <div style="background-color: #fff3cd; color: #856404; padding: 10px; border-radius: 4px; font-size: 14px;">
            <strong>Ghi chú từ cửa hàng:</strong> ${note}
        </div>
        ` : ''}
        
        <p style="margin-top: 20px;">Cảm ơn bạn đã mua sắm tại Nông Sản Việt!</p>
        
        

        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="font-size: 12px; color: #888; text-align: center;">Email này được gửi tự động.</p>
      </div>
    `,
  });
};

// <div style="text-align: center; margin-top: 30px;">
//             <a href="${process.env.NEXT_PUBLIC_BASE_URL}/customer/orders" style="background-color: #2e7d32; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Xem chi tiết đơn hàng</a>
//         </div>