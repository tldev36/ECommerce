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

  // 2. Tính lại Subtotal (logic giữ nguyên)
  const subTotal = items.reduce((sum, item) => {
    const originalPrice = Number(item.price);
    const discountPercent = Number(item.discount || 0);
    const finalPrice = discountPercent > 0
      ? originalPrice * (1 - discountPercent / 100)
      : originalPrice;
    return sum + (finalPrice * Number(item.quantity));
  }, 0);

  // 3. Tạo HTML danh sách sản phẩm (Style Green)
  const itemsHtml = items
    .map((item) => {
      const originalPrice = Number(item.price);
      const discountPercent = Number(item.discount || 0);
      const hasDiscount = discountPercent > 0;

      const finalUnitPrice = hasDiscount
        ? originalPrice * (1 - discountPercent / 100)
        : originalPrice;

      const lineTotal = finalUnitPrice * Number(item.quantity);

      // Hiển thị giá: Giảm giá dùng màu Cam/Đỏ nhẹ để nổi bật trên nền xanh, hoặc dùng xanh đậm
      const priceDisplay = hasDiscount
        ? `<div><span style="text-decoration: line-through; color: #9e9e9e; font-size: 11px;">${originalPrice.toLocaleString('vi-VN')} đ</span></div>
           <div style="color: #2e7d32; font-weight: bold;">${finalUnitPrice.toLocaleString('vi-VN')} đ <span style="font-size: 10px; background: #e8f5e9; color: #2e7d32; padding: 1px 4px; border-radius: 3px; border: 1px solid #c8e6c9;">-${discountPercent}%</span></div>`
        : `<span style="color: #333;">${originalPrice.toLocaleString('vi-VN')} đ</span>`;

      return `
        <tr>
            <td style="padding: 12px 8px; border-bottom: 1px solid #c8e6c9;">
                <span style="color: #333; font-weight: 500;">${item.name}</span>
            </td>
            <td style="padding: 12px 8px; border-bottom: 1px solid #c8e6c9; text-align: center; color: #555;">
                ${item.quantity}
            </td>
            <td style="padding: 12px 8px; border-bottom: 1px solid #c8e6c9; text-align: right;">
                ${priceDisplay}
            </td>
            <td style="padding: 12px 8px; border-bottom: 1px solid #c8e6c9; text-align: right; font-weight: 600; color: #2e7d32;">
                ${lineTotal.toLocaleString('vi-VN')} đ
            </td>
        </tr>
        `;
    })
    .join("");

  // 4. Gửi mail với giao diện GREEN
  await transporter.sendMail({
    from: `"Nông Sản Việt" <${process.env.SMTP_USER}>`,
    to,
    subject: `[Nông Sản Store] Xác nhận đơn hàng #${orderCode}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #a5d6a7; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
        
        <div style="background-color: #2e7d32; padding: 25px; text-align: center;">
            <h2 style="color: #fff; margin: 0; font-size: 24px;">Đặt Hàng Thành Công!</h2>
            <p style="color: #e8f5e9; margin: 5px 0 0 0; font-size: 14px;">Cảm ơn bạn đã tin dùng nông sản sạch</p>
        </div>
        
        <div style="padding: 25px;">
            <p style="color: #333;">Xin chào <strong>${customerName}</strong>,</p>
            <p style="color: #555; line-height: 1.5;">Đơn hàng <strong style="color: #2e7d32;">${orderCode}</strong> của bạn đã được tiếp nhận. Chúng tôi sẽ sớm liên hệ để giao hàng.</p>
            
            <div style="margin-top: 25px; margin-bottom: 15px; border-bottom: 2px solid #2e7d32;">
                <h3 style="color: #2e7d32; margin: 0 0 5px 0; font-size: 16px; text-transform: uppercase;">Chi tiết đơn hàng</h3>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
                <tr style="background-color: #e8f5e9;">
                <th style="padding: 10px; text-align: left; color: #2e7d32; font-size: 13px; text-transform: uppercase;">Sản phẩm</th>
                <th style="padding: 10px; text-align: center; color: #2e7d32; font-size: 13px; text-transform: uppercase;">SL</th>
                <th style="padding: 10px; text-align: right; color: #2e7d32; font-size: 13px; text-transform: uppercase;">Đơn giá</th>
                <th style="padding: 10px; text-align: right; color: #2e7d32; font-size: 13px; text-transform: uppercase;">Thành tiền</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHtml}
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="3" style="padding: 10px; text-align: right; color: #666;">Tạm tính:</td>
                    <td style="padding: 10px; text-align: right; color: #333;">${subTotal.toLocaleString('vi-VN')} đ</td>
                </tr>
                <tr>
                    <td colspan="3" style="padding: 5px 10px; text-align: right; color: #666;">Phí vận chuyển:</td>
                    <td style="padding: 5px 10px; text-align: right; color: #333;">${shippingFee.toLocaleString('vi-VN')} đ</td>
                </tr>
                ${couponAmount > 0 ? `
                <tr>
                    <td colspan="3" style="padding: 5px 10px; text-align: right; color: #2e7d32; font-weight: bold;">Voucher giảm giá:</td>
                    <td style="padding: 5px 10px; text-align: right; color: #2e7d32; font-weight: bold;">-${couponAmount.toLocaleString('vi-VN')} đ</td>
                </tr>
                ` : ''}
                <tr style="background-color: #f1f8e9;">
                    <td colspan="3" style="padding: 15px; text-align: right; font-weight: bold; font-size: 16px; color: #1b5e20;">TỔNG CỘNG:</td>
                    <td style="padding: 15px; text-align: right; font-weight: bold; font-size: 20px; color: #1b5e20;">${Number(totalAmount).toLocaleString('vi-VN')} đ</td>
                </tr>
            </tfoot>
            </table>

            <div style="background-color: #f1f8e9; padding: 15px; border-radius: 6px; border: 1px dashed #2e7d32;">
                <p style="margin: 0; color: #2e7d32; font-size: 14px; text-transform: uppercase; font-weight: bold;">📍 Địa chỉ nhận hàng</p>
                <p style="margin: 8px 0 0 0; color: #333; font-size: 15px;">${address}</p>
            </div>
            
            <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
                <p style="font-size: 13px; color: #888;">
                    Mọi thắc mắc xin liên hệ Hotline: <strong style="color: #2e7d32;">1900 xxxx</strong><br/>
                    <span style="font-size: 12px; font-style: italic;">(Email này được gửi tự động từ hệ thống Nông Sản Store)</span>
                </p>
            </div>
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