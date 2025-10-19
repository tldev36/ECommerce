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
    const [form, setForm] = useState<Product>(
        editing || {
            id: 0,
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
            created_at: new Date(),
            updated_at: new Date(),
            categories: null,
        }
    );

    const [categories, setCategories] = useState<Category[]>([]);
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        axios.get<Category[]>("/api/categories").then((res) => setCategories(res.data));
    }, []);

    useEffect(() => {
        if (editing) {
            setForm(editing);
            if (editing.image) setPreview(`/images/products/${editing.image}`);
        }
    }, [editing]);

    const generateSlug = (text: string) =>
        text
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, "-")
            .replace(/[^\w\-]+/g, "")
            .replace(/\-\-+/g, "-")
            .replace(/^-+|-+$/g, "");

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

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setForm((prev) => ({ ...prev, image: file.name }));
        const reader = new FileReader();
        reader.onload = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.price) return alert("⚠️ Nhập đầy đủ tên và giá!");
        const now = new Date();
        editing ? onUpdate?.({ ...form, updated_at: now }) : onAdd?.({ ...form, id: Date.now(), created_at: now, updated_at: now });
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-6 bg-white rounded-2xl p-6 shadow-md"
        >
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                    placeholder="Nhập tên sản phẩm..."
                    required
                />
            </div>

            {/* Slug */}
            <div>
                <label className="block font-medium mb-1 text-gray-700">Slug</label>
                <input
                    name="slug"
                    value={form.slug}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                    placeholder="vd: sua-tuoi-nguyen-chat"
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
                            <div className="flex flex-col items-center text-gray-500">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-12 w-12 mb-2 text-gray-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M7 16V4a1 1 0 011-1h8a1 1 0 011 1v12m-5 4h.01M12 16v4"
                                    />
                                </svg>
                                <p className="text-sm">
                                    <span className="text-green-600 font-medium">Chọn ảnh</span> hoặc kéo vào đây
                                </p>
                            </div>
                        )}
                    </label>
                </div>
            </div>


            {/* Đơn vị */}
            <div>
                <label className="block font-medium mb-1 text-gray-700">Đơn vị</label>
                <input
                    name="unit"
                    value={form.unit}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                    placeholder="vd: kg, hộp, chai..."
                />
            </div>

            {/* Mô tả ngắn */}
            <div>
                <label className="block font-medium mb-1 text-gray-700">Mô tả ngắn</label>
                <textarea
                    name="short"
                    value={form.short || ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                    rows={3}
                    placeholder="Mô tả ngắn về sản phẩm..."
                />
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

            {/* Các cờ */}
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
                            className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        {opt.label}
                    </label>
                ))}
            </div>

            {/* Giảm giá */}
            <div>
                <label className="block font-medium mb-1 text-gray-700">Giảm giá (%)</label>
                <input
                    name="discount"
                    type="number"
                    min={0}
                    max={100}
                    value={form.discount ?? 0}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                />
            </div>

            {/* Nút gửi */}
            <button
                type="submit"
                className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 active:scale-[0.98] transition font-medium"
            >
                {editing ? "💾 Lưu thay đổi" : "🚀 Thêm sản phẩm"}
            </button>
        </form>
    );
}
