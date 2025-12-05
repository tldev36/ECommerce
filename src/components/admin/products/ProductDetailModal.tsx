"use client";

import { Product } from "@/types/product";
import Image from "next/image";
import {
  X, Package, Tag, DollarSign, Layers, Calendar, 
  Archive, CheckCircle2, Star, Flame, Trophy, AlertCircle, Ban
} from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  product: Product;
}

export default function ProductDetailModal({ open, onClose, product }: Props) {
  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* 🔹 Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
             <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                <Package className="w-6 h-6" />
             </div>
             <div>
                <h2 className="text-xl font-bold text-gray-800">Chi tiết sản phẩm</h2>
                <p className="text-xs text-gray-500 font-mono mt-0.5">ID: {product.id}</p>
             </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        {/* 🔹 Nội dung (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
           <div className="flex flex-col md:flex-row gap-8">
              
              {/* Cột trái: Ảnh & Badge */}
              <div className="w-full md:w-1/3 flex flex-col items-center gap-4">
                 <div className="relative w-full aspect-square bg-gray-50 rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    {product.image ? (
                       <Image
                          src={`/images/products/${product.image}`}
                          alt={product.name}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-500"
                       />
                    ) : (
                       <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Package size={48} strokeWidth={1.5} />
                       </div>
                    )}
                 </div>

                 {/* Badges */}
                 <div className="flex flex-wrap justify-center gap-2 w-full">
                    {product.is_active ? (
                       <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-200">
                          <CheckCircle2 size={14} /> Đang bán
                       </span>
                    ) : (
                       <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-bold border border-red-200">
                          <Ban size={14} /> Ngừng bán
                       </span>
                    )}

                    {product.is_new && (
                       <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-200">
                          <Star size={14} /> Mới
                       </span>
                    )}
                    {product.is_best_seller && (
                       <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-bold border border-purple-200">
                          <Flame size={14} /> Bán chạy
                       </span>
                    )}
                    {product.featured && (
                       <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-200">
                          <Trophy size={14} /> Nổi bật
                       </span>
                    )}
                 </div>
              </div>

              {/* Cột phải: Thông tin chi tiết */}
              <div className="w-full md:w-2/3 space-y-6">
                 
                 {/* Thông tin cơ bản */}
                 <div>
                    <h3 className="text-2xl font-bold text-gray-900 leading-tight">{product.name}</h3>
                    <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">
                       <Tag size={14} />
                       <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700 font-mono text-xs">{product.slug}</span>
                    </p>
                    {product.short && (
                       <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600 italic border border-gray-100">
                          “{product.short}”
                       </div>
                    )}
                 </div>

                 <hr className="border-gray-100" />

                 {/* Grid thông tin */}
                 <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                    <InfoItem icon={Layers} label="Danh mục" value={product.categories?.name || "Chưa phân loại"} />
                    <InfoItem icon={Package} label="Đơn vị tính" value={product.unit} />
                    
                    <div className="col-span-2 grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                       <div className="space-y-1">
                          <p className="text-xs text-gray-500 uppercase font-semibold flex items-center gap-1"><DollarSign size={14} /> Giá bán</p>
                          <p className="text-xl font-bold text-green-600">{Number(product.price).toLocaleString("vi-VN")}₫</p>
                       </div>
                       <div className="space-y-1 border-l border-gray-200 pl-4">
                          <p className="text-xs text-gray-500 uppercase font-semibold flex items-center gap-1"><DollarSign size={14} /> Giá vốn</p>
                          <p className="text-lg font-medium text-gray-700">{Number(product.cost_price).toLocaleString("vi-VN")}₫</p>
                       </div>
                    </div>

                    <div className="col-span-2 grid grid-cols-2 gap-4">
                        <InfoItem 
                           icon={Archive} 
                           label="Tồn kho" 
                           value={
                              <span className={`font-bold ${product.stock_quantity ?? 0 > 0 ? 'text-blue-600' : 'text-red-500'}`}>
                                 {product.stock_quantity ?? 0}
                              </span>
                           } 
                        />
                        <InfoItem icon={AlertCircle} label="Tồn tối thiểu" value={product.min_stock_level ?? 0} />
                    </div>

                    <InfoItem icon={Calendar} label="Ngày tạo" value={product.created_at?.toLocaleDateString("vi-VN")} />
                    <InfoItem icon={Calendar} label="Cập nhật" value={product.updated_at?.toLocaleDateString("vi-VN")} />
                 </div>

              </div>
           </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
           <button 
              onClick={onClose}
              className="px-6 py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium rounded-lg transition-colors shadow-sm"
           >
              Đóng
           </button>
        </div>

      </div>
    </div>
  );
}

/** Component con hiển thị 1 dòng thông tin */
function InfoItem({ icon: Icon, label, value }: { icon: any, label: string, value: React.ReactNode }) {
   return (
      <div className="flex flex-col">
         <span className="text-xs text-gray-400 font-medium uppercase mb-1 flex items-center gap-1.5">
            <Icon size={14} /> {label}
         </span>
         <span className="text-sm font-medium text-gray-800 truncate">{value ?? "-"}</span>
      </div>
   );
}