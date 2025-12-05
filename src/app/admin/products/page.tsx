"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { 
  Package, Plus, Edit, Trash2, Eye, 
  Search, Filter, ChevronLeft, ChevronRight, Loader2 
} from "lucide-react";

import Modal from "@/components/common/Modal";
import ProductForm from "@/components/admin/products/ProductForm";
import { Product, ProductApi } from "@/types/product";
import ProductStatusIcons from "@/components/admin/products/ProductStatusIcons";
import ProductDetailModal from "@/components/admin/products/ProductDetailModal";
import Image from "next/image";
import { Toaster, toast } from "react-hot-toast";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  
  // State tìm kiếm & phân trang
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Detail modal state
  const [showDetail, setShowDetail] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // 🟢 Load danh sách sản phẩm
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get<ProductApi[]>("/api/admin/products");
        const formatted = res.data.map((p) => ({
          ...p,
          created_at: p.created_at ? new Date(p.created_at) : undefined,
          updated_at: p.updated_at ? new Date(p.updated_at) : undefined,
        }));
        setProducts(formatted);
      } catch (err) {
        console.error("Lỗi khi tải sản phẩm:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // 🔍 Logic Lọc & Phân trang
  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.categories?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset trang khi tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // 🗑️ Xóa sản phẩm
  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
    try {
      await axios.delete(`/api/admin/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      alert("Đã xóa sản phẩm thành công!");
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
      alert("Không thể xóa sản phẩm!");
    }
  };

  // ➕ Thêm sản phẩm
  const handleAdd = (product: Omit<Product, "id" | "created_at" | "updated_at">) => {
    const newProduct: Product = {
      ...product,
      id: Date.now(),
      created_at: new Date(),
      updated_at: new Date(),
    };
    setProducts((prev) => [newProduct, ...prev]);
    setShowModal(false);
  };

  // ✏️ Cập nhật sản phẩm
  const handleUpdate = (updatedProduct: Product) => {
    setProducts((prev) => prev.map((p) => {
       if (p.id === updatedProduct.id) {
          // Giữ lại các trường quan trọng nếu API trả về thiếu (ví dụ created_at)
          // Đồng thời cập nhật category_id mới nhất
          return {
             ...p,
             ...updatedProduct,
             category_id: updatedProduct.category_id ?? updatedProduct.categories?.id
          };
       }
       return p;
    }));
    setShowModal(false);
    setEditing(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      
      {/* 🔹 Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Package className="w-8 h-8 text-blue-600" />
            Quản lý sản phẩm
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Quản lý kho hàng và danh sách sản phẩm</p>
        </div>
        
        <button
          onClick={() => {
            setEditing(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>Thêm sản phẩm</span>
        </button>
      </div>

      {/* 🔹 Main Content Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
        
        {/* Toolbar */}
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50 rounded-t-xl">
           <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm tên sản phẩm, danh mục..." 
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
              />
           </div>
           <div className="text-sm text-gray-500 font-medium">
              Tổng số: <span className="font-bold text-gray-900">{filteredProducts.length}</span> sản phẩm
           </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
              <tr>
                <th className="py-4 px-6 w-16 text-center">#</th>
                <th className="py-4 px-6 w-24 text-center">Ảnh</th>
                <th className="py-4 px-6">Tên sản phẩm</th>
                <th className="py-4 px-6">Danh mục</th>
                <th className="py-4 px-6 text-right">Giá bán</th>
                <th className="py-4 px-6 text-center">Trạng thái</th>
                <th className="py-4 px-6 text-center">Tồn kho</th>
                <th className="py-4 px-6 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={8} className="py-12 text-center text-gray-500"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2"/>Đang tải dữ liệu...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                   <td colSpan={8} className="py-12 text-center text-gray-400 bg-gray-50/30">
                      <div className="flex flex-col items-center justify-center">
                         <div className="bg-gray-100 p-3 rounded-full mb-3"><Filter className="w-6 h-6 text-gray-300" /></div>
                         <p>Không tìm thấy sản phẩm nào</p>
                      </div>
                   </td>
                </tr>
              ) : (
                paginatedProducts.map((p, index) => (
                  <tr key={p.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="py-4 px-6 text-center text-gray-400 font-medium">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    
                    <td className="py-4 px-6 text-center">
                      <div className="w-12 h-12 relative rounded-lg border border-gray-200 overflow-hidden bg-gray-100 mx-auto">
                        {p.image ? (
                          <Image
                            src={`/images/products/${p.image}`}
                            alt={p.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No Img</div>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-6">
                       <span className="font-semibold text-gray-800 line-clamp-1" title={p.name}>{p.name}</span>
                    </td>

                    <td className="py-4 px-6 text-gray-600">
                       <span className="bg-gray-100 px-2 py-1 rounded text-xs border border-gray-200">
                          {p.categories?.name || "Chưa phân loại"}
                       </span>
                    </td>

                    <td className="py-4 px-6 text-right font-medium text-emerald-600">
                       {Number(p.price).toLocaleString("vi-VN")}₫
                    </td>

                    <td className="py-4 px-6 text-center">
                      <ProductStatusIcons product={p} />
                    </td>

                    <td className="py-4 px-6 text-center">
                       <span className={`font-bold ${p.stock_quantity ?? 0 > 0 ? 'text-gray-700' : 'text-red-500'}`}>
                          {p.stock_quantity}
                       </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setSelectedProduct(p);
                            setShowDetail(true);
                          }}
                          className="p-2 text-gray-500 bg-white border border-gray-200 hover:text-blue-600 hover:border-blue-300 rounded-lg transition-colors shadow-sm"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditing(p);
                            setShowModal(true);
                          }}
                          className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors shadow-sm"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
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

        {/* 🔹 Footer Pagination */}
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
      <Toaster position="top-right" />


      {selectedProduct && (
        <ProductDetailModal
          open={showDetail}
          onClose={() => {
            setShowDetail(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
        />
      )}

      {/* Modal thêm/sửa */}
      <Modal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setEditing(null);
        }}
        title={editing ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
        width="max-w-4xl" // Modal rộng hơn để chứa form sản phẩm
      >
        <ProductForm editing={editing} onAdd={handleAdd} onUpdate={handleUpdate} />
      </Modal>
    </div>
  );
}