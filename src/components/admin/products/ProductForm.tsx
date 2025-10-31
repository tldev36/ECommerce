"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { Category } from "@/types/category";
import { Product } from "@/types/product";

interface ProductFormProps {
    onAdd?: (data: Product) => void;
    onUpdate?: (data: Product) => void;
    editing?: Product | null;
}

export default function ProductForm({ onAdd, onUpdate, editing }: ProductFormProps) {
    // 🔹 Form dữ liệu
    const [form, setForm] = useState<Omit<Product, "id" | "created_at" | "updated_at">>({
        name: "",
        slug: "",
        price: 0,
        cost_price: 0,
        unit: "",
        image: "",
        short: "",
        category_id: null,
        featured: false,
        discount: 0,
        is_new: false,
        is_best_seller: false,
        stock_quantity: 0,
        min_stock_level: 0,
        is_active: true,
        categories: null,
    });

    const [categories, setCategories] = useState<Category[]>([]);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // 🔹 Nếu đang edit, nạp dữ liệu ban đầu vào form
    useEffect(() => {
        if (editing) {
            setForm({
                name: editing.name,
                slug: editing.slug,
                price: editing.price,
                cost_price: editing.cost_price,
                unit: editing.unit,
                image: editing.image,
                short: editing.short,
                category_id: editing.category_id,
                featured: editing.featured,
                discount: editing.discount,
                is_new: editing.is_new,
                is_best_seller: editing.is_best_seller,
                stock_quantity: editing.stock_quantity ?? 0,
                min_stock_level: editing.min_stock_level ?? 0,
                is_active: editing.is_active ?? true,
                categories: editing.categories,
            });
            if (editing.image) setPreview(`/images/products/${editing.image}`);
        }
    }, [editing]);

    // 🔹 Lấy danh sách categories
    useEffect(() => {
        axios.get<Category[]>("/api/categories").then((res) => setCategories(res.data));
    }, []);

    // 🔹 Tạo slug tự động
    const generateSlug = (text: string) =>
        text
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, "-")
            .replace(/[^\w\-]+/g, "")
            .replace(/\-\-+/g, "-")
            .replace(/^-+|-+$/g, "");

    // 🔹 Xử lý thay đổi input
    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, type, value } = e.target;
        const val =
            type === "checkbox"
                ? (e.target as HTMLInputElement).checked
                : type === "number"
                    ? Number(value)
                    : name === "category_id"
                        ? Number(value) || null
                        : name === "discount"
                            ? Math.min(Math.max(Number(value), 0), 100)
                            : value;

        setForm((prev) => ({
            ...prev,
            [name]: val,
            slug: name === "name" ? generateSlug(value) : prev.slug,
        }));
    };

    // 🔹 Chọn file ảnh
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPreview(URL.createObjectURL(file));
        setSelectedFile(file);
    };

    // 🔹 Submit form
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!form.name || !form.price) {
            alert("⚠️ Vui lòng nhập đầy đủ tên và giá sản phẩm!");
            return;
        }

        setLoading(true);
        try {
            let uploadedFileName = form.image;
            if (selectedFile) {
                const uploadForm = new FormData();
                uploadForm.append("file", selectedFile);
                const uploadRes = await axios.post<{ fileName: string }>(
                    "/api/upload?type=products",
                    uploadForm,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );
                uploadedFileName = uploadRes.data.fileName;
            } else if (editing?.image) {
                uploadedFileName = editing.image; // giữ ảnh cũ
            }

            const {
                name,
                slug,
                price,
                cost_price,
                unit,
                short,
                category_id,
                featured,
                discount,
                is_new,
                is_best_seller,
                stock_quantity,
                min_stock_level,
                is_active,
            } = form;

            const dataToSend = {
                name,
                slug,
                price,
                cost_price,
                unit,
                image: uploadedFileName,
                short,
                category_id,
                featured,
                discount,
                is_new,
                is_best_seller,
                stock_quantity,
                min_stock_level,
                is_active,
            };

            let res;
            if (editing) {
                res = await axios.put<Product>(`/api/admin/products/${editing.id}`, dataToSend);
                onUpdate?.(res.data);
            } else {
                res = await axios.post<Product>(`/api/admin/products`, dataToSend);
                onAdd?.(res.data);
            }

        } catch (err) {
            console.error("❌ Lỗi khi lưu sản phẩm:", err);
            alert("Không thể lưu sản phẩm!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl p-6 shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 border-b pb-3">
                {editing ? "✏️ Cập nhật sản phẩm" : "➕ Thêm mới sản phẩm"}
            </h2>

            {/* 🔹 Tên sản phẩm */}
            <div>
                <label className="block font-medium mb-1 text-gray-700">Tên sản phẩm</label>
                <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                    placeholder="Nhập tên sản phẩm..."
                    required
                />
            </div>

            {/* 🔹 Giá bán & Giá vốn */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block font-medium mb-1 text-gray-700">Giá bán (đ)</label>
                    <input
                        name="price"
                        type="number"
                        value={form.price}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                        required
                    />
                </div>
                <div>
                    <label className="block font-medium mb-1 text-gray-700">Giá vốn (đ)</label>
                    <input
                        name="cost_price"
                        type="number"
                        value={form.cost_price}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                    />
                </div>
            </div>

            {/* 🔹 Ảnh */}
            <div>
                <label className="block font-medium mb-2 text-gray-700">Ảnh sản phẩm</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-green-500 transition cursor-pointer">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="product-image-upload"
                    />
                    <label htmlFor="product-image-upload" className="cursor-pointer">
                        {preview ? (
                            <img
                                src={preview}
                                alt="preview"
                                className="mx-auto w-40 h-40 object-cover rounded-lg shadow-md"
                            />
                        ) : (
                            <p className="text-gray-500 text-sm">
                                <span className="text-green-600 font-medium">Chọn ảnh</span> hoặc kéo vào đây
                            </p>
                        )}
                    </label>
                </div>
            </div>

            {/* 🔹 Tồn kho & Số lượng tối thiểu */}
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                {/* <div>
                    <label className="block font-medium mb-1 text-gray-700">Tồn kho hiện tại</label>
                    <input
                        name="stock_quantity"
                        type="number"
                        value={form.stock_quantity}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                        placeholder="Nhập số lượng tồn..."
                        min={0}
                    />
                </div> */}

                <div>
                    <label className="block font-medium mb-1 text-gray-700">Số lượng tối thiểu</label>
                    <input
                        name="min_stock_level"
                        type="number"
                        value={form.min_stock_level}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                        placeholder="Nhập số lượng tối thiểu..."
                        min={0}
                    />
                </div>
            </div>


            {/* 🔹 Danh mục */}
            <div>
                <label className="block font-medium mb-1 text-gray-700">Danh mục</label>
                <select
                    name="category_id"
                    value={form.category_id ?? ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* 🔹 Cờ (checkbox) */}
            <div className="flex flex-wrap gap-4">
                {[
                    { name: "is_new", label: "Mới" },
                    { name: "is_best_seller", label: "Bán chạy" },
                    { name: "featured", label: "Nổi bật" },
                    //   { name: "is_active", label: "Đang bán" },
                ].map((opt) => (
                    <label key={opt.name} className="flex items-center gap-2 text-gray-700">
                        <input
                            type="checkbox"
                            name={opt.name}
                            checked={(form as any)[opt.name] || false}
                            onChange={handleChange}
                            className="w-4 h-4 text-green-600 border-gray-300 rounded"
                        />
                        {opt.label}
                    </label>
                ))}
            </div>

            {/* 🔹 Nút gửi */}
            <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 active:scale-[0.98] transition font-medium"
            >
                {loading ? "⏳ Đang lưu..." : editing ? "💾 Lưu thay đổi" : "🚀 Thêm sản phẩm"}
            </button>
        </form>
    );
}
