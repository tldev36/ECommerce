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
        categories: null,
    });

    const [categories, setCategories] = useState<Category[]>([]);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // 🔹 Lấy danh sách categories
    useEffect(() => {
        axios.get<Category[]>("/api/categories").then((res) => setCategories(res.data));
    }, []);

    // 🔹 Khi edit sản phẩm
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
                categories: editing.categories,
            });
            if (editing.image) setPreview(`/images/products/${editing.image}`);
        }
    }, [editing]);

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

    // 🔹 Xử lý thay đổi form
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

    // 🔹 Xử lý chọn ảnh
    const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setPreview(URL.createObjectURL(file)); // hiển thị ảnh tạm
        try {
            const formData = new FormData();
            formData.append("file", file);

            // 🟢 Gọi API upload
            const res = await axios.post("/api/upload?type=products", formData);
            const { fileName } = res.data as { fileName: string };

            // Lưu tên file đã upload
            setForm((prev) => ({ ...prev, image: fileName }));
        } catch (error) {
            console.error("Lỗi upload ảnh:", error);
            alert("❌ Không thể tải ảnh lên!");
        }
    };


    // 🔹 Submit Form
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.price) {
            alert("⚠️ Nhập đầy đủ tên và giá!");
            return;
        }

        setLoading(true);
        try {
            let res;
            if (editing) {
                // 🟢 Cập nhật sản phẩm
                res = await axios.put<Product>(`/api/admin/products/${editing.id}`, form);
                onUpdate?.(res.data);
            } else {
                // 🟢 Thêm mới sản phẩm
                res = await axios.post<Product>(`/api/admin/products`, form);
                onAdd?.(res.data);
            }
        } catch (err) {
            console.error("Lỗi khi lưu sản phẩm:", err);
            alert("❌ Không thể lưu sản phẩm!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl p-6 shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 border-b pb-3">
                {editing ? "✏️ Cập nhật sản phẩm" : "➕ Thêm mới sản phẩm"}
            </h2>

            {/* Tên sản phẩm */}
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

            {/* Giá bán + Giá vốn */}
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

            {/* Ảnh sản phẩm */}
            <div>
                <label className="block font-medium mb-2 text-gray-700">Ảnh sản phẩm</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-green-500 transition cursor-pointer">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
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

            {/* Danh mục */}
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

            {/* Cờ */}
            <div className="flex flex-wrap gap-4">
                {[
                    { name: "is_new", label: "Mới" },
                    { name: "is_best_seller", label: "Bán chạy" },
                    { name: "featured", label: "Nổi bật" },
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

            {/* Nút gửi */}
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
