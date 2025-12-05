import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      user_id,
      shipping_address_id,
      items,
      total_amount,
      payment_method,
      coupon_amount,
      ship_amount,
    } = body;

    // Validate cơ bản
    if (!user_id || !shipping_address_id || !items?.length) {
      return NextResponse.json(
        { error: "Thiếu dữ liệu đầu vào." },
        { status: 400 }
      );
    }

    const address = await prisma.shipping_addresses.findUnique({
      where: { id: Number(shipping_address_id) },
    });
    if (!address) return NextResponse.json({ error: "Không tìm thấy địa chỉ." }, { status: 404 });

    // ✅ Lấy thông tin User để gửi mail
    const user = await prisma.users.findUnique({
      where: { id: Number(user_id) },
      select: { email: true, name: true } // Chỉ cần lấy email và tên
    });

    if (!user || !user.email) {
      // Tùy logic: có thể return lỗi hoặc vẫn cho tạo đơn nhưng không gửi mail
      // Ở đây mình vẫn cho chạy tiếp
    }

    const orderCode = `OD${Date.now().toString().slice(-6)}`;
    const address_detail = `${address.recipient_name}-${address.phone}-${address.detail_address},${address.ward_name},${address.district_name},${address.province_name}`;

    let emailItemsData: any[] = [];

    // 🛡️ BẮT ĐẦU TRANSACTION
    const newOrder = await prisma.$transaction(async (tx) => {

      // 1️⃣ KIỂM TRA TỒN KHO
      for (const item of items) {
        const product = await tx.products.findUnique({
          where: { id: Number(item.product_id) },
        });

        if (!product) {
          throw new Error(`Sản phẩm ID ${item.product_id} không tồn tại.`);
        }

        const currentStock = product.stock_quantity ?? 0;

        if (currentStock < Number(item.quantity)) {
          throw new Error(`Sản phẩm "${product.name}" không đủ hàng (Còn: ${currentStock}).`);
        }

        // ✅ Lưu thông tin sản phẩm vào mảng tạm để lát gửi mail
        emailItemsData.push({
          name: product.name,
          quantity: item.quantity,
          price: item.price,
          discount: product.discount || 0, // Lấy thông tin giảm giá nếu có
        });
      }

      // 2️⃣ TẠO ĐƠN HÀNG (HEADER)
      const order = await tx.orders.create({
        data: {
          order_code: orderCode,
          user_id: Number(user_id),
          coupon_amount: Number(coupon_amount || 0),
          ship_amount: Number(ship_amount || 0),
          amount: Number(total_amount),
          payment_method, // "cod"
          // Logic COD nằm ở đây:
          status: payment_method === "cod" ? "pending" : "waiting_payment",
          shipping_address: address_detail,
          ward_address: address.ward_name,
          district_address: address.district_name,
          payment_status: "UNPAID",
        },
      });

      // 3️⃣ TẠO ORDER ITEMS VÀ TRỪ KHO
      for (const item of items) {
        // Tạo item
        await tx.order_items.create({
          data: {
            order_id: order.id,
            product_id: Number(item.product_id),
            quantity: Number(item.quantity),
            price: Number(item.price),
            total_price: Number(item.price) * Number(item.quantity),
          },
        });

        // Trừ kho & Tăng số lượng đã bán
        await tx.products.update({
          where: { id: Number(item.product_id) },
          data: {
            stock_quantity: { decrement: Number(item.quantity) },
            // ✅ Đã thêm logic tăng số lượng bán
            // sold: { increment: Number(item.quantity) } 
          },
        });
      }

      return order; // Trả về order để biến newOrder hứng lấy
    });

    // ---------------------------------------------------------
    // ✅ GỬI EMAIL SAU KHI TRANSACTION THÀNH CÔNG
    // ---------------------------------------------------------
    // Để trong try-catch riêng để nếu lỗi gửi mail thì KHÔNG làm lỗi API tạo đơn
    if (user?.email) {
      try {
        await sendOrderConfirmationEmail({
          to: user.email,
          orderCode: orderCode,
          customerName: user.name || "Khách hàng", // Fallback nếu user không có tên
          items: emailItemsData, // Mảng item đã có tên sản phẩm
          totalAmount: Number(total_amount),
          address: address_detail.split('-').join(', '), // Format lại địa chỉ cho đẹp
          shippingFee: Number(ship_amount || 0),
          couponAmount: Number(coupon_amount || 0),
        });
        console.log(`📧 Đã gửi email xác nhận cho đơn ${orderCode}`);
      } catch (mailError) {
        console.error("❌ Lỗi gửi email:", mailError);
        // Không return error ở đây để Client vẫn nhận được "Đặt hàng thành công"
      }
    }


    // ✅ Trả về thông tin đơn hàng cho Frontend (để redirect hoặc hiển thị)
    return NextResponse.json({
      success: true,
      message: "Đặt hàng thành công",
      order: newOrder
    });

  } catch (error: any) {
    console.error("❌ Lỗi Transaction:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Lỗi server khi tạo đơn hàng." }, // Sửa key error thành message cho đồng bộ
      { status: 500 }
    );
  }
}


