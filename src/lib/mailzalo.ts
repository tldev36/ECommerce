// /lib/mailzalo.ts
import nodemailer from "nodemailer";

// Cập nhật interface để hỗ trợ hiển thị giảm giá giống mail.ts
interface CartItem {
  name: string;
  price: number;
  quantity: number;
  discount?: number; 
}

interface MailParams {
  to: string;
  orderCode: string;
  customerName: string;
  items: CartItem[];
  totalAmount: number;
  address: string;
  shippingFee: number;
  couponAmount: number;
}

export const sendOrderSuccessEmail = async (params: MailParams) => {
  const { to, orderCode, customerName, items, totalAmount, address, shippingFee, couponAmount } = params;

  // 1. Cấu hình transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465, 
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // 2. Tính lại Subtotal (Logic đồng bộ với mail.ts)
  const subTotal = items.reduce((sum, item) => {
    const originalPrice = Number(item.price);
    const discountPercent = Number(item.discount || 0);
    const finalPrice = discountPercent > 0
      ? originalPrice * (1 - discountPercent / 100)
      : originalPrice;
    return sum + (finalPrice * Number(item.quantity));
  }, 0);

  // 3. Tạo HTML danh sách sản phẩm (Style Green)
  const itemsHtml = items.map((item) => {
    const originalPrice = Number(item.price);
    const discountPercent = Number(item.discount || 0);
    const hasDiscount = discountPercent > 0;

    const finalUnitPrice = hasDiscount
      ? originalPrice * (1 - discountPercent / 100)
      : originalPrice;

    const lineTotal = finalUnitPrice * Number(item.quantity);

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
  }).join("");

  // 4. Nội dung HTML (Green Theme + ZaloPay Content)
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #a5d6a7; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
      
      <div style="background-color: #2e7d32; padding: 25px; text-align: center;">
        <h2 style="color: #fff; margin: 0; font-size: 24px;">Thanh Toán Thành Công!</h2>
        <p style="color: #e8f5e9; margin: 5px 0 0 0; font-size: 14px;">Đơn hàng đã được thanh toán qua <strong>ZaloPay</strong></p>
      </div>
      
      <div style="padding: 25px;">
        <p style="color: #333;">Xin chào <strong>${customerName}</strong>,</p>
        <p style="color: #555; line-height: 1.5;">Hệ thống đã nhận được thanh toán cho đơn hàng <strong style="color: #2e7d32;">${orderCode}</strong>. Chúng tôi đang tiến hành đóng gói và sẽ giao hàng sớm nhất.</p>
        
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
          <tbody>${itemsHtml}</tbody>
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
                <td colspan="3" style="padding: 15px; text-align: right; font-weight: bold; font-size: 16px; color: #1b5e20;">TỔNG THANH TOÁN:</td>
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
                Cảm ơn bạn đã thanh toán qua ZaloPay.<br/>
                Mọi thắc mắc xin liên hệ Hotline: <strong style="color: #2e7d32;">1900 xxxx</strong>
            </p>
        </div>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Nông Sản Store" <${process.env.SMTP_USER}>`,
      to,
      subject: `[Đã Thanh Toán] Xác nhận đơn hàng #${orderCode}`,
      html: htmlContent,
    });
    console.log(`✅ Mail ZaloPay sent to ${to}`);
  } catch (error) {
    console.error("❌ Send mail error:", error);
  }
};