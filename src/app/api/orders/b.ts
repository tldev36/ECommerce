import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Order_Item } from "@/types/order_item";

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

    const orderCode = `OD${Date.now().toString().slice(-6)}`;
    const address_detail = `${address.recipient_name}-${address.phone}-${address.detail_address},${address.ward_name},${address.district_name},${address.province_name}`;

    // 🛡️ BẮT ĐẦU TRANSACTION
    // Dùng biến `tx` thay cho `prisma` bên trong này
    await prisma.$transaction(async (tx) => {
      
      // 1️⃣ KIỂM TRA TỒN KHO TRƯỚC (Quan trọng)
      for (const item of items) {
        const product = await tx.products.findUnique({
          where: { id: Number(item.product_id) },
        });

        if (!product) {
          throw new Error(`Sản phẩm ID ${item.product_id} không tồn tại.`);
        }

        // Kiểm tra xem trường trong DB là stock_quantity hay quantity nhé
        const currentStock = product.stock_quantity ?? 0; 
        
        if (currentStock < Number(item.quantity)) {
          throw new Error(`Sản phẩm "${product.name}" không đủ hàng (Còn: ${currentStock}).`);
        }
      }

      // 2️⃣ TẠO ĐƠN HÀNG
      const order = await tx.orders.create({
        data: {
          order_code: orderCode,
          user_id: Number(user_id),
          coupon_amount,
          ship_amount,
          amount: Number(total_amount),
          payment_method,
          status: payment_method === "cod" ? "pending" : "waiting_payment",
          shipping_address: address_detail,
          ward_address: address.ward_name,
          district_address: address.district_name,
        },
      });

      // 3️⃣ TẠO ORDER ITEMS VÀ TRỪ KHO (Atomic Update)
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

        // Trừ kho an toàn bằng decrement
        await tx.products.update({
          where: { id: Number(item.product_id) },
          data: {
            // Dùng decrement để tránh Race Condition
            stock_quantity: { decrement: Number(item.quantity) },
            
            // Nếu có trường sold (đã bán) thì tăng lên
            // sold: { increment: Number(item.quantity) } 
          },
        });
      }
      
      // Nếu chạy đến đây mà không lỗi thì Transaction sẽ Commit (Lưu)
      return order;
    });

    return NextResponse.json({ success: true, message: "Đặt hàng thành công" });

  } catch (error: any) {
    console.error("❌ Lỗi Transaction:", error);
    // Nếu lỗi (ví dụ không đủ hàng), Transaction tự động Rollback (Hoàn tác) mọi thứ
    return NextResponse.json(
      { error: error.message || "Lỗi server khi tạo đơn hàng." },
      { status: 500 }
    );
  }
}