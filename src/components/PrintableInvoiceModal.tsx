import React, { useRef } from 'react';
import { X, Printer } from 'lucide-react';
import { Order } from "@/types/order";

// Helper format tiền tệ (hoặc import từ utils của bạn)
const fmt = (v: number) => Number(v).toLocaleString("vi-VN") + "₫";

interface PrintableInvoiceModalProps {
  order: Order;
  onClose: () => void;
}

const PrintableInvoiceModal = ({ order, onClose }: PrintableInvoiceModalProps) => {
  const printRef = useRef<HTMLDivElement>(null);

  // 1. Xử lý logic dữ liệu
  // Tách địa chỉ (Sử dụng lại logic của bạn)
  const parseAddress = (fullStr: string) => {
    const parts = fullStr?.split('-') || [];
    return {
       name: parts[0] || "Khách lẻ",
       phone: parts[1] || "",
       detail: parts.slice(2).join('-') || fullStr
    };
  };
  const receiver = parseAddress(order.shipping_address || "");

  const namecus = receiver.name;
  const phonecus = receiver.phone;
  const addresscus = receiver.detail;

  
  // Logic tiền thu hộ (COD): Nếu đã thanh toán online thì thu 0đ, nếu chưa thì thu tổng bill
  const codAmount = order.payment_method === 'cod' ? order.amount : 0;

  // 2. Hàm in
  const handlePrint = () => {
    if (!printRef.current) return;
    const printContent = printRef.current.innerHTML;
    const originalContent = document.body.innerHTML;

    // Thay thế body để in
    document.body.innerHTML = printContent;
    window.print();
    
    // Khôi phục lại trang web sau khi in
    document.body.innerHTML = originalContent;
    window.location.reload(); // Reload để khôi phục event listeners
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative flex flex-col">
        
        {/* Header Actions */}
        <div className="flex justify-between items-center p-4 border-b bg-gray-50 sticky top-0 z-10">
          <div>
             <h3 className="font-bold text-lg text-gray-800">Xem trước bản in</h3>
             <p className="text-xs text-gray-500">Khổ giấy A6 / A7 (Máy in nhiệt)</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium shadow-sm transition-colors"
            >
              <Printer size={18} /> In ngay
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* --- VÙNG HIỂN THỊ HÓA ĐƠN (PREVIEW) --- */}
        <div className="p-8 bg-gray-200 overflow-auto flex justify-center min-h-[500px]">
          
          {/* Đây là phần sẽ được IN ra */}
          <div ref={printRef} className="bg-white w-[100mm] min-h-[150mm] p-0 text-black font-sans leading-tight relative shadow-lg box-border">
            {/* CSS inline để đảm bảo khi in giữ nguyên style */}
            <style>
              {`
                @media print {
                  @page { size: 100mm 150mm; margin: 0; }
                  body { margin: 0; }
                }
                .dashed-line { border-top: 2px dashed #000; margin: 0 8px; }
                .solid-line { border-top: 2px solid #000; margin: 0 8px; }
              `}
            </style>

            <div className="border border-black m-[1px] h-full flex flex-col">
                {/* 1. Logo & Header */}
                <div className="p-3 pb-1 flex justify-between items-start">
                    <div className="w-1/2">
                      <div className="text-green-500 font-bold text-2xl flex items-center gap-1 mb-1">
                        {/* <span className="bg-[#ee4d2d] text-white p-0.5 rounded text-xs px-1">F</span>  */}
                        <p>Farm</p>
                      </div>
                      {/* <div className="flex items-center gap-1">
                         <div className="bg-blue-900 text-yellow-400 font-bold italic px-1 text-lg">GHN</div>
                         <div className="text-blue-900 font-bold italic text-xs">Express</div>
                      </div> */}
                    </div>
                    <div className="w-1/2 text-right">
                       {/* Barcode giả lập */}
                       <div className="h-10 w-full bg-[repeating-linear-gradient(90deg,black,black_2px,white_2px,white_4px)] mb-1"></div>
                       <p className="font-bold text-[10px]">Mã vận đơn: <span className="text-sm">GHN-{order.id}</span></p>
                       <p className="font-bold text-[10px]">Mã đơn: <span className="font-normal">{order.order_code}</span></p>
                    </div>
                </div>

                <div className="dashed-line"></div>

                {/* 2. Người gửi - Người nhận */}
                <div className="grid grid-cols-2 p-2 gap-2 text-xs">
                  <div className="pr-1 border-r border-dashed border-black">
                    <p className="font-bold uppercase">Từ:</p>
                    <p className="font-bold">Cửa Hàng Nông Sản</p> {/* Thay tên shop bạn */}
                    <p>Kho Bình Dương</p>
                    <p className="font-bold mt-1">SĐT: 0909.888.888</p>
                  </div>
                  <div>
                    <p className="font-bold uppercase">Đến:</p>
                    <p className="font-bold text-sm">{namecus}</p>
                    <p className="break-words">{addresscus}</p>
                    <p className="font-bold mt-1">SĐT: {phonecus}</p>
                  </div>
                </div>

                <div className="dashed-line"></div>

                {/* 3. Nội dung hàng */}
                <div className="flex text-xs flex-1">
                  <div className="w-2/3 p-2 border-r border-dashed border-black">
                    <p className="font-bold mb-1">Nội dung hàng (SL: {order.order_items?.length})</p>
                    <div className="space-y-1">
                      {order.order_items?.map((item, index) => (
                        <p key={index}>
                          {index + 1}) {item.product?.name} 
                          <span className="font-bold ml-1">(x{item.quantity})</span>
                        </p>
                      ))}
                    </div>
                    {/* Note nếu danh sách quá dài */}
                    {(order.order_items?.length || 0) > 5 && (
                        <p className="mt-4 italic text-[9px] text-gray-500">...và các sản phẩm khác</p>
                    )}
                  </div>
                  <div className="w-1/3 p-2 flex flex-col items-center text-center justify-start pt-4">
                    <div className="w-16 h-16 border-2 border-black p-0.5 mb-1">
                      {/* QR Code giả lập */}
                      <div className="w-full h-full bg-[repeating-linear-gradient(45deg,black,black_3px,white_3px,white_6px)]"></div>
                    </div>
                    <p className="text-[10px]">Ngày đặt hàng</p>
                    <p className="font-bold">{new Date(order.created_at).toLocaleDateString("vi-VN")}</p>
                  </div>
                </div>

                <div className="solid-line"></div>

                {/* 4. Footer tiền thu */}
                <div className="flex p-2 items-end">
                  <div className="w-1/2 pr-1">
                    <p className="text-xs font-bold">Tiền thu Người nhận:</p>
                    <p className="text-2xl font-bold my-1">{fmt(Number(codAmount))}</p>
                    <div className="text-[10px] mt-1">
                      <p className="font-bold">Chỉ dẫn giao hàng:</p>
                      <ul className="list-disc pl-3 m-0">
                        <li>Không đồng kiểm</li>
                        <li>Chuyển hoàn sau 3 lần phát</li>
                      </ul>
                    </div>
                  </div>
                  <div className="w-1/2 pl-1">
                    <div className="border-[3px] border-gray-400 p-1 text-center">
                       <p className="font-bold text-[10px] leading-3 uppercase">Quý khách vui lòng quay video mở hàng</p>
                       <p className="text-[9px] italic mt-1">Để đối chiếu nếu có sai sót</p>
                    </div>
                    <div className="text-center mt-1">
                        <p className="font-bold text-lg">Chữ ký người nhận</p>
                        <p className="text-[9px] text-gray-400 italic mt-4">(Xác nhận hàng nguyên vẹn)</p>
                    </div>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintableInvoiceModal;