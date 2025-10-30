"use client";
import { useState } from "react";
import { Category } from "@/types/category";
import axios from "axios";
import { ImagePlus, UploadCloud } from "lucide-react";

interface CategoryFormProps {
  editing?: Category | null;
  onSuccess: (category: Category) => void;
  onCancel: () => void;
}

export default function CategoryForm({
  editing,
  onSuccess,
  onCancel,
}: CategoryFormProps) {
  const [formData, setFormData] = useState({
    name: editing?.name || "",
    image: editing?.image || "",
    status: editing?.status ?? true,
  });
  const [preview, setPreview] = useState<string | null>(
    editing?.image ? `/images/categories/${editing.image}` : null
  );
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // 🔹 Chọn file nhưng KHÔNG upload ngay
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file)); // chỉ preview tạm
    setSelectedFile(file); // lưu tạm để upload sau
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let uploadedFileName = formData.image;

      // 🔹 Nếu có file mới thì upload trước khi lưu category
      if (selectedFile) {
        const uploadForm = new FormData();
        uploadForm.append("file", selectedFile);

        const uploadRes = await axios.post<{ fileName: string }>(
          "/api/upload?type=categories",
          uploadForm,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        uploadedFileName = uploadRes.data.fileName;
      }

      // 🔹 Sau đó lưu vào DB
      const payload = { ...formData, image: uploadedFileName };
      let res;
      if (editing) {
        res = await axios.put(`/api/admin/categories/${editing.id}`, payload);
      } else {
        res = await axios.post(`/api/admin/categories`, payload);
      }

      onSuccess(res.data as Category);
    } catch (error) {
      console.error("Lỗi lưu category:", error);
      alert("Không thể lưu dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 🔹 Tên loại */}
      <div>
        <label className="block font-medium mb-1">Tên loại sản phẩm</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* 🔹 Upload hình ảnh */}
      <div>
        <label className="block font-medium mb-2">Hình ảnh</label>
        <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 hover:border-blue-500 transition relative bg-gray-50">
          {preview ? (
            <div className="relative group">
              <img
                src={preview}
                alt="Preview"
                className="w-48 h-48 object-cover rounded-xl border shadow"
              />
              <label
                htmlFor="file-upload"
                className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-xl cursor-pointer transition"
              >
                <UploadCloud className="w-6 h-6 mr-2" />
                <span>Thay ảnh</span>
              </label>
            </div>
          ) : (
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center cursor-pointer"
            >
              <div className="p-4 bg-gray-100 rounded-full mb-2">
                <ImagePlus className="w-8 h-8 text-gray-500" />
              </div>
              <span className="text-gray-600 font-medium">
                Chọn hoặc kéo thả ảnh vào đây
              </span>
            </label>
          )}
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* 🔹 Trạng thái */}
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

      {/* 🔹 Nút hành động */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded-lg hover:bg-gray-100"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          {loading ? "Đang lưu..." : editing ? "Cập nhật" : "Thêm mới"}
        </button>
      </div>
    </form>
  );
}
