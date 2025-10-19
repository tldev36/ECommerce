"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxOpen,
  faCircleXmark,
  faEdit,
  faTrash,
  faPlus,
  faFire,
  faStar,
} from "@fortawesome/free-solid-svg-icons";

import Modal from "@/components/common/Modal";
import ProductForm from "@/components/admin/ProductForm";
import { Product, ProductApi } from "@/types/product"; // ✅ Dùng 2 kiểu

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  // 🟢 Load danh sách sản phẩm
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get<ProductApi[]>("/api/products");
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

  // 🗑️ Xóa sản phẩm
  const handleDelete = (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      console.log("Delete product", id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      // TODO: Gọi API DELETE
    }
  };

  // ➕ Thêm sản phẩm mới
  const handleAdd = (product: Omit<Product, "id" | "created_at" | "updated_at">) => {
    const newProduct: Product = {
      ...product,
      id: Date.now(),
      created_at: new Date(),
      updated_at: new Date(),
    };
    setProducts((prev) => [...prev, newProduct]);
    setShowModal(false);
  };

  // ✏️ Cập nhật sản phẩm
  const handleUpdate = (product: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)));
    setShowModal(false);
    setEditing(null);
  };

  return (
    <div className="max-w-7xl mx-auto mt-10 bg-white rounded-2xl shadow p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FontAwesomeIcon icon={faBoxOpen} className="text-blue-600 text-2xl" />
          <h1 className="text-2xl font-bold text-gray-800">
            Quản lý sản phẩm
          </h1>
        </div>

        <button
          onClick={() => {
            setEditing(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow transition"
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>Thêm sản phẩm</span>
        </button>
      </div>

      {/* Bảng sản phẩm */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
        {loading ? (
          <p className="p-6 text-gray-500 italic">Đang tải dữ liệu...</p>
        ) : products.length === 0 ? (
          <p className="p-6 text-gray-500 italic text-center">
            Chưa có sản phẩm nào.
          </p>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="p-3 border-b text-center w-16">#</th>
                <th className="p-3 border-b text-center">Ảnh</th>
                <th className="p-3 border-b">Tên sản phẩm</th>
                <th className="p-3 border-b">Danh mục</th>
                <th className="p-3 border-b text-right">Giá bán</th>
                <th className="p-3 border-b text-right">Giá vốn</th>
                <th className="p-3 border-b text-center">Đơn vị</th>
                <th className="p-3 border-b text-center">Trạng thái</th>
                <th className="p-3 border-b text-center">Ngày tạo</th>
                <th className="p-3 border-b text-center w-24">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, index) => (
                <tr
                  key={p.id}
                  className="hover:bg-gray-50 transition duration-150"
                >
                  <td className="p-3 border-b text-center">{index + 1}</td>
                  <td className="p-3 border-b text-center">
                    {p.image ? (
                      <img
                        src={`/images/products/${p.image}`}
                        alt={p.name}
                        className="w-14 h-14 object-cover rounded-lg border border-gray-200 mx-auto shadow-sm"
                      />
                    ) : (
                      <div className="w-14 h-14 bg-gray-100 text-gray-400 flex items-center justify-center rounded-lg text-xs mx-auto">
                        No Img
                      </div>
                    )}
                  </td>

                  <td className="p-3 border-b font-medium text-gray-800">
                    {p.name}
                  </td>

                  <td className="p-3 border-b text-gray-600">
                    {p.categories?.name || "—"}
                  </td>

                  <td className="p-3 border-b text-right text-green-700 font-medium">
                    {p.price.toLocaleString("vi-VN")} đ
                  </td>

                  <td className="p-3 border-b text-right text-gray-500">
                    {p.cost_price.toLocaleString("vi-VN")} đ
                  </td>

                  <td className="p-3 border-b text-center">{p.unit}</td>

                  <td className="p-3 border-b text-center">
                    {p.is_best_seller ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full font-medium">
                        <FontAwesomeIcon icon={faFire} />
                        Bán chạy
                      </span>
                    ) : p.is_new ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
                        <FontAwesomeIcon icon={faStar} />
                        Mới
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                        <FontAwesomeIcon icon={faCircleXmark} />
                        Bình thường
                      </span>
                    )}
                  </td>

                  <td className="p-3 border-b text-center text-gray-500">
                    {p.created_at
                      ? p.created_at.toLocaleDateString("vi-VN")
                      : "-"}
                  </td>

                  <td className="p-3 border-b text-center">
                    <div className="flex items-center justify-center gap-4">
                      <button
                        title="Sửa sản phẩm"
                        onClick={() => {
                          setEditing(p);
                          setShowModal(true);
                        }}
                        className="text-yellow-600 hover:text-yellow-800 transition"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        title="Xóa sản phẩm"
                        onClick={() => handleDelete(p.id)}
                        className="text-red-600 hover:text-red-800 transition"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal thêm/sửa */}
      <Modal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setEditing(null);
        }}
        title={editing ? "✏️ Cập nhật sản phẩm" : "➕ Thêm sản phẩm"}
        width="max-w-2xl"
      >
        <ProductForm
          editing={editing}
          onAdd={handleAdd}
          onUpdate={handleUpdate}
        />
      </Modal>
    </div>
  );
}
