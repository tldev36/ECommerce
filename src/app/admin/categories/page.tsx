"use client";

import { useEffect, useState, useMemo, useCallback } from "react"; // 1. Thêm useCallback
import axios from "axios";
import {
  Plus, Edit, Trash2, CheckCircle2, XCircle,
  Search, Layers, ChevronLeft, ChevronRight, Filter
} from "lucide-react";
import { Category } from "@/types/category";
import Modal from "@/components/common/Modal";
import CategoryForm from "@/components/admin/CategoryForm";

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // 2. TÁCH HÀM FETCH RA NGOÀI (để tái sử dụng)
  const fetchCategories = useCallback(async () => {
    try {
      // Không set loading=true ở đây để tránh nháy trang khi reload ngầm
      const res = await axios.get<Category[]>("/api/admin/categories");
      setCategories(res.data);
    } catch (error) {
      console.error("Lỗi fetch categories:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 3. Gọi hàm fetch khi mới vào trang
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Reset trang về 1 khi tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleOpenAdd = () => {
    setEditing(null);
    setOpenModal(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditing(category);
    setOpenModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa loại sản phẩm này không?")) return;
    try {
      const res = await axios.delete(`/api/admin/categories/${id}`);
      if (res.status === 200) {
        // Xóa thành công thì tải lại danh sách luôn
        fetchCategories(); 
        alert("Đã xóa loại sản phẩm thành công!");
      }
    } catch (error: any) {
      alert(error.response?.data?.error || "Không thể xóa loại sản phẩm!");
    }
  };

  // Logic lọc và phân trang (Giữ nguyên)
  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    return categories.filter(c =>
      (c.name || "").toLowerCase().includes((searchTerm || "").toLowerCase())
    );
  }, [categories, searchTerm]);

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      
      {/* Header & Button Thêm mới */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Layers className="w-8 h-8 text-blue-600" />
            Quản lý loại sản phẩm
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Quản lý danh mục và phân loại sản phẩm</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>Thêm mới</span>
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
        
        {/* Toolbar Tìm kiếm */}
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50 rounded-t-xl">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm danh mục..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
            />
          </div>
          <div className="text-sm text-gray-500 font-medium">
            Tổng số: <span className="font-bold text-gray-900">{filteredCategories.length}</span> danh mục
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
              <tr>
                <th className="py-4 px-6 w-16">#</th>
                <th className="py-4 px-6">Tên danh mục</th>
                <th className="py-4 px-6">Ngày tạo</th>
                <th className="py-4 px-6">Cập nhật cuối</th>
                <th className="py-4 px-6 text-center">Trạng thái</th>
                <th className="py-4 px-6 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="py-8 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 bg-gray-50/30">
                    <div className="flex flex-col items-center justify-center">
                      <Filter className="w-6 h-6 text-gray-300 mb-2" />
                      <p>Không tìm thấy danh mục nào</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedCategories.map((c, index) => (
                  <tr key={c.id || index} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="py-4 px-6 text-gray-400 font-medium">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-gray-800 text-base">{c.name}</span>
                    </td>
                    <td className="py-4 px-6 text-gray-500">
                      {c.created_at ? new Date(c.created_at).toLocaleDateString("vi-VN") : "-"}
                    </td>
                    <td className="py-4 px-6 text-gray-500">
                      {c.updated_at ? new Date(c.updated_at).toLocaleDateString("vi-VN") : "-"}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {c.status ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600 border border-green-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200">
                          <XCircle className="w-3.5 h-3.5" /> Ngừng
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors shadow-sm"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-2 text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors shadow-sm"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 flex justify-between items-center bg-gray-50 rounded-b-xl">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" /> Trước
            </button>
            <span className="text-sm font-medium text-gray-600">
              Trang <span className="font-bold text-gray-900">{currentPage}</span> / {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              Tiếp <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 🔹 4. CẤU HÌNH MODAL ĐỂ RELOAD DỮ LIỆU */}
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={editing ? "Cập nhật danh mục" : "Thêm danh mục mới"}
      >
        <CategoryForm
          editing={editing}
          onCancel={() => setOpenModal(false)}
          // QUAN TRỌNG: Gọi fetchCategories() khi onSuccess
          onSuccess={() => {
            fetchCategories(); // <-- Đây là dòng code giúp reload lại danh sách
            setOpenModal(false);
          }}
        />
      </Modal>

    </div>
  );
}