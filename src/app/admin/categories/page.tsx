"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faCircleCheck,
  faCircleXmark,
  faTags,
} from "@fortawesome/free-solid-svg-icons";
import { Category } from "@/types/category";
import Modal from "@/components/common/Modal";

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    status: true,
    image: "",
  });

  // ✅ Lấy danh sách loại sản phẩm
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get<Category[]>("/api/categories");
        setCategories(res.data);
      } catch (error) {
        console.error("Lỗi fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // ✅ Mở modal thêm mới
  const handleOpenAdd = () => {
    setEditing(null);
    setFormData({ name: "", status: true, image: "" });
    setOpenModal(true);
  };

  // ✅ Mở modal sửa
  const handleOpenEdit = (category: Category) => {
    setEditing(category);
    setFormData({
      name: category.name,
      status: category.status,
      image: category.image || "",
    });
    setOpenModal(true);
  };

  // ✅ Lưu form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editing) {
        // Cập nhật
        const updated = { ...editing, ...formData };
        setCategories((prev) =>
          prev.map((c) => (c.id === editing.id ? updated : c))
        );
        // Gọi API nếu cần: await axios.put(`/api/categories/${editing.id}`, updated);
      } else {
        // Thêm mới
        const newCategory = {
          id: Math.max(0, ...categories.map((c) => c.id)) + 1,
          ...formData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        // setCategories((prev) => [...prev, newCategory]);
        // Gọi API nếu cần: await axios.post("/api/categories", newCategory);
      }

      setOpenModal(false);
    } catch (error) {
      console.error("Lỗi lưu loại sản phẩm:", error);
    }
  };

  // ✅ Xóa loại
  const handleDelete = (id: number) => {
    if (confirm("Bạn có chắc muốn xóa loại sản phẩm này không?")) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 bg-white shadow rounded-2xl p-6">
      {/* 🔹 Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faTags} className="text-blue-600 text-2xl" />
          <h1 className="text-2xl font-bold text-gray-800">
            Quản lý loại sản phẩm
          </h1>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow"
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>Thêm loại</span>
        </button>
      </div>

      {/* 🔸 Bảng danh sách */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {loading ? (
          <p className="p-6 text-gray-500 italic">Đang tải dữ liệu...</p>
        ) : categories.length === 0 ? (
          <p className="p-6 text-gray-500 italic text-center">
            Chưa có loại sản phẩm nào.
          </p>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-left">
                <th className="p-3 border-b">STT</th>
                <th className="p-3 border-b text-center">Hình ảnh</th>
                <th className="p-3 border-b">Tên loại</th>
                <th className="p-3 border-b">Ngày tạo</th>
                <th className="p-3 border-b">Ngày cập nhật</th>
                <th className="p-3 border-b text-center">Trạng thái</th>
                <th className="p-3 border-b text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c, index) => (
                <tr
                  key={c.id}
                  className="hover:bg-gray-50 transition duration-150"
                >
                  <td className="p-3 border-b text-gray-700">{index + 1}</td>
                  <td className="p-3 border-b text-center">
                    {c.image ? (
                      <img
                        src={`/images/categories/${c.image}`}
                        alt={c.name}
                        className="w-12 h-12 object-cover rounded border border-gray-200 shadow-sm mx-auto"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 text-gray-400 flex items-center justify-center rounded mx-auto text-xs">
                        No image
                      </div>
                    )}
                  </td>
                  <td className="p-3 border-b font-medium text-gray-800">
                    {c.name}
                  </td>
                  <td className="p-3 border-b text-gray-600">
                    {c.created_at
                      ? new Date(c.created_at).toLocaleDateString("vi-VN")
                      : "-"}
                  </td>
                  <td className="p-3 border-b text-gray-600">
                    {c.updated_at
                      ? new Date(c.updated_at).toLocaleDateString("vi-VN")
                      : "-"}
                  </td>
                  <td className="p-3 border-b text-center">
                    {c.status ? (
                      <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-medium">
                        <FontAwesomeIcon icon={faCircleCheck} />
                        Hoạt động
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-medium">
                        <FontAwesomeIcon icon={faCircleXmark} />
                        Ngừng
                      </span>
                    )}
                  </td>
                  <td className="p-3 border-b text-center">
                    <div className="flex items-center justify-center gap-4">
                      <button
                        title="Sửa loại"
                        onClick={() => handleOpenEdit(c)}
                        className="text-yellow-600 hover:text-yellow-800 transition"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        title="Xóa loại"
                        onClick={() => handleDelete(c.id)}
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

      {/* 🔹 Modal thêm/sửa loại sản phẩm */}
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={editing ? "Cập nhật loại sản phẩm" : "Thêm loại sản phẩm"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Tên loại sản phẩm</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập tên loại..."
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Hình ảnh (URL)</label>
            <input
              type="text"
              value={formData.image}
              onChange={(e) =>
                setFormData({ ...formData, image: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="vd: category.jpg"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.checked })
              }
              className="w-4 h-4"
            />
            <label>Hoạt động</label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={() => setOpenModal(false)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-100"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              {editing ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
