"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faCircleXmark, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  price: string;
  cost_price: string;
  unit: string;
  image: string;
  short?: string;
  category_id?: number;
  featured?: boolean;
  discount?: string;
  is_new?: boolean;
  is_best_seller?: boolean;
  created_at: string;
  updated_at: string;
  categories?: Category;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    axios.get<Product[]>("/api/products").then((res) => setProducts(res.data));
  }, []);

  const handleDelete = (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      // TODO: Gọi API DELETE
      console.log("Delete product", id);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Quản lý sản phẩm</h1>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-3 border-b text-center">STT</th>
            <th className="p-3 border-b">Hình ảnh</th>
            <th className="p-3 border-b">Tên sản phẩm</th>
            <th className="p-3 border-b">Danh mục</th>
            <th className="p-3 border-b">Giá bán</th>
            <th className="p-3 border-b">Giá vốn</th>
            <th className="p-3 border-b">Đơn vị</th>
            <th className="p-3 border-b">Trạng thái</th>
            <th className="p-3 border-b">Ngày tạo</th>
            <th className="p-3 border-b text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p, index) => (
            <tr key={p.id} className="hover:bg-gray-50">
              <td className="p-3 border-b text-center">{index + 1}</td>
              <td className="p-3 border-b">
                <img src={"/images/products/" + p.image} alt={p.name} className="w-10 h-10 object-cover rounded" />
              </td>
              <td className="p-3 border-b ">
                {p.name}
              </td>
              <td className="p-3 border-b">{p.categories?.name || "—"}</td>
              <td className="p-3 border-b text-green-600">{Number(p.price).toLocaleString("vi-VN")} đ</td>
              <td className="p-3 border-b text-gray-600">{Number(p.cost_price).toLocaleString("vi-VN")} đ</td>
              <td className="p-3 border-b">{p.unit}</td>
              <td className="p-3 border-b">
  {p.is_new ? (
    <span className="flex items-center gap-1 text-blue-600 text-sm">
      <FontAwesomeIcon icon={faCircleCheck} />
      Hàng mới
    </span>
  ) : p.is_best_seller ? (
    <span className="flex items-center gap-1 text-purple-600 text-sm">
      <FontAwesomeIcon icon={faCircleCheck} />
      Bán chạy
    </span>
  ) : (
    <span className="flex items-center gap-1 text-gray-600 text-sm">
      <FontAwesomeIcon icon={faCircleXmark} />
      Bình thường
    </span>
  )}
</td>

              <td className="p-3 border-b">
                {new Date(p.created_at).toLocaleDateString("vi-VN")}
              </td>
              <td className="p-3 border-b text-center space-x-3">
                <button className="text-yellow-600 hover:text-yellow-800">
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <button
                  className="text-red-600 hover:text-red-800"
                  onClick={() => handleDelete(p.id)}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
