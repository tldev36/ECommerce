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
} from "@fortawesome/free-solid-svg-icons";

import { Category } from "@/types/category";


export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get<Category[]>("/api/categories");
        setCategories(res.data);
        console.log("Categories API:", res.data);
      } catch (error) {
        console.error("Lỗi fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleDelete = (id: number) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Quản lý loại sản phẩm</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <FontAwesomeIcon icon={faPlus} />
          <span>Thêm loại</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <p className="p-4">Đang tải dữ liệu...</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-3 border-b">STT</th>
                <th className="p-3 border-b">
                  Hình ảnh
                </th>
                <th className="p-3 border-b">Tên loại</th>
                <th className="p-3 border-b">Ngày tạo</th>
                <th className="p-3 border-b">Ngày cập nhật</th>
                <th className="p-3 border-b">Trạng thái</th>
                <th className="p-3 border-b text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c, index) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="p-3 border-b">{index + 1}</td>
                  <td className="p-3 border-b">
                    <img src={"/images/categories/" + c.image} alt="Category" className="w-10 h-10 object-cover rounded" />
                  </td>
                  <td className="p-3 border-b">{c.name}</td>

                  <td className="p-3 border-b">
                    {/* {new Date(c.created_at).toLocaleDateString("vi-VN")} */}
                  </td>
                  <td className="p-3 border-b">
                    {/* {new Date(c.updated_at).toLocaleDateString("vi-VN")} */}
                  </td>
                  <td className="p-3 border-b">
                    {c.status ? (
                      <span className="flex items-center gap-1 text-green-600 text-sm">
                        <FontAwesomeIcon icon={faCircleCheck} className="w-4 h-4" />
                        Hoạt động
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-600 text-sm">
                        <FontAwesomeIcon icon={faCircleXmark} className="w-4 h-4" />
                        Ngừng
                      </span>
                    )}
                  </td>
                  <td className="p-3 border-b text-center space-x-3">
                    <button className="text-yellow-600 hover:text-yellow-800">
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleDelete(c.id)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
