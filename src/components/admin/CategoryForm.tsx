"use client";

import { useState, useEffect } from "react";
import { Category } from "@/types/category";
import axios from "axios";
import {
  Save, X, Type, Activity, Loader2, AlertCircle
} from "lucide-react";

interface CategoryFormProps {
  editing: Category | null;
  onSuccess: (category: Category) => void;
  onCancel: () => void;
}

// 🔹 KHAI BÁO HẰNG SỐ: Sửa số này để áp dụng cho toàn bộ form
const MAX_LENGTH = 30; 

export default function CategoryForm({
  editing,
  onSuccess,
  onCancel,
}: CategoryFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    status: true,
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editing) {
      setFormData({
        name: editing.name,
        status: editing.status,
      });
    } else {
      setFormData({
        name: "",
        status: true,
      });
    }
    setError("");
  }, [editing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedName = formData.name.trim();

    // 1. Validate: Kiểm tra rỗng
    if (!trimmedName) {
      setError("Vui lòng nhập tên danh mục");
      return;
    }

    // 2. Validate: Kiểm tra độ dài (Đã đồng bộ với biến MAX_LENGTH)
    if (trimmedName.length > MAX_LENGTH) {
      setError(`Tên loại không được vượt quá ${MAX_LENGTH} ký tự`);
      return;
    }

    setIsSubmitting(true);

    try {
      let res;
      if (editing) {
        // API Sửa
        res = await axios.put(`/api/admin/categories/${editing.id}`, formData);
      } else {
        // API Thêm mới
        res = await axios.post(`/api/admin/categories`, formData);
      }

      onSuccess(res.data as Category);
      
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error); 
      } else if (err.response?.status === 409) {
        setError("Tên loại sản phẩm đã được sử dụng");
      } else {
        setError("Có lỗi xảy ra, vui lòng thử lại sau.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      
      {/* KHU VỰC HIỂN THỊ LỖI */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 animate-in fade-in slide-in-from-top-2 duration-200">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-sm">Không thể lưu</span>
            <span className="text-sm opacity-90">{error}</span>
          </div>
        </div>
      )}

      {/* 🔹 Tên danh mục */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Type className="w-4 h-4 text-blue-600" />
          Tên danh mục <span className="text-red-500">*</span>
        </label>
        
        <div className="relative">
          <input
            type="text"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              if (error) setError("");
            }}
            placeholder="Ví dụ: Điện thoại, Laptop..."
            // Đồng bộ giới hạn nhập liệu HTML
            maxLength={MAX_LENGTH} 
            className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 transition-all ${
              error ? "border-red-300 focus:ring-red-200 bg-red-50/30" : "border-gray-300 focus:ring-blue-500"
            }`}
            autoFocus
            required
          />
        </div>

        {/* Hiển thị đếm ký tự (Đã đồng bộ UI) */}
        <div className="flex justify-end">
           <span className={`text-xs ${formData.name.length >= MAX_LENGTH ? 'text-red-600 font-bold' : 'text-gray-400'}`}>
             {formData.name.length}/{MAX_LENGTH} ký tự
           </span>
        </div>
      </div>

      {/* 🔹 Trạng thái (Giữ nguyên) */}
      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${formData.status ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <p className="font-medium text-gray-800">Trạng thái hoạt động</p>
            <p className="text-xs text-gray-500">
              {formData.status ? "Đang hiển thị trên hệ thống" : "Đang bị ẩn tạm thời"}
            </p>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
          />
          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {/* 🔹 Footer Actions (Giữ nguyên) */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Hủy bỏ
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-5 py-2.5 text-white rounded-xl font-medium transition-all shadow-md flex items-center gap-2 ${
             error ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
          } disabled:opacity-70 disabled:cursor-not-allowed`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Đang xử lý...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {editing ? "Cập nhật" : "Thêm mới"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}