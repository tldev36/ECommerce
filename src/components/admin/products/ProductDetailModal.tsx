"use client";

import { Product } from "@/types/product";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFire,
  faStar,
  faCircleXmark,
  faBoxOpen,
  faTag,
  faBoxes,
  faCheckCircle,
  faTimesCircle,
  faDollarSign,
  faCalendarAlt,
  faList,
  faFont,
  faScaleBalanced,
} from "@fortawesome/free-solid-svg-icons";

interface Props {
  open: boolean;
  onClose: () => void;
  product: Product;
}

export default function ProductDetailModal({ open, onClose, product }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl p-6 relative">
        {/* 🔹 Header */}
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FontAwesomeIcon icon={faBoxOpen} className="text-blue-600" />
            Chi tiết sản phẩm
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-xl"
          >
            ×
          </button>
        </div>

        {/* 🔹 Nội dung */}
        <div className="space-y-5">
          {/* Ảnh */}
          <div className="flex justify-center">
            <img
              src={`/images/products/${product.image}`}
              alt={product.name}
              className="w-40 h-40 object-cover rounded-lg border"
            />
          </div>

          {/* Thông tin chi tiết */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <InfoRow icon={faFont} label="Tên sản phẩm" value={product.name} />
            <InfoRow
              icon={faList}
              label="Danh mục"
              value={product.categories?.name || "Chưa có danh mục"}
            />
            <InfoRow icon={faTag} label="Slug" value={product.slug} />
            <InfoRow icon={faScaleBalanced} label="Unit" value={product.unit} />
            <InfoRow
              icon={faDollarSign}
              label="Giá bán"
              value={`${product.price?.toLocaleString("vi-VN")} đ`}
            />
            <InfoRow
              icon={faDollarSign}
              label="Giá vốn"
              value={`${product.cost_price?.toLocaleString("vi-VN")} đ`}
            />
            <InfoRow
              icon={faBoxes}
              label="Tồn kho"
              value={`${product.stock_quantity ?? 0}`}
            />
            <InfoRow
              icon={faBoxes}
              label="Tồn tối thiểu"
              value={`${product.min_stock_level ?? 0}`}
            />
            <InfoRow
              icon={faCheckCircle}
              label="Trạng thái"
              value={product.is_active ? "Đang bán" : "Ngừng bán"}
            />
            <InfoRow
              icon={faCalendarAlt}
              label="Ngày tạo"
              value={product.created_at?.toLocaleDateString("vi-VN") || "-"}
            />
            <InfoRow
              icon={faCalendarAlt}
              label="Cập nhật"
              value={product.updated_at?.toLocaleDateString("vi-VN") || "-"}
            />
          </div>

          {/* Cờ trạng thái */}
          <div className="flex justify-center gap-3 mt-4 flex-wrap">
            {product.featured && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                <FontAwesomeIcon icon={faBoxOpen} /> Nổi bật
              </span>
            )}
            {product.is_new && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                <FontAwesomeIcon icon={faStar} /> Mới
              </span>
            )}
            {product.is_best_seller && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                <FontAwesomeIcon icon={faFire} /> Bán chạy
              </span>
            )}
            {!product.featured && !product.is_new && !product.is_best_seller && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                <FontAwesomeIcon icon={faCircleXmark} /> Bình thường
              </span>
            )}
          </div>

          {/* Mô tả ngắn */}
          {product.short && (
            <div className="mt-4">
              <p className="text-gray-600 text-sm italic border-t pt-2">
                “{product.short}”
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Component hiển thị 1 hàng thông tin */
function InfoRow({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="flex items-center gap-2">
      <FontAwesomeIcon icon={icon} className="text-gray-500 w-4" />
      <span className="text-gray-600 font-medium">{label}:</span>
      <span className="text-gray-800 truncate">{value ?? "-"}</span>
    </div>
  );
}
