"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Category } from "@/types/category";
import { Product } from "@/types/product";
import {
   Package, Archive, Tag, UploadCloud,
   Save, Loader2, ImagePlus, FileText // Thêm icon FileText
} from "lucide-react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// 1. SCHEMA
const productSchema = z.object({
   name: z.string().min(1, "Vui lòng nhập tên sản phẩm"),
   slug: z.string().optional(),
   price: z.coerce.number().min(0, "Giá không hợp lệ"),
   cost_price: z.coerce.number().optional().default(0),
   unit: z.string().optional().default(""),
   category_id: z.coerce.string().min(1, "Vui lòng chọn danh mục"),
   image: z.string().optional().nullable(),
   description: z.string().optional().nullable(), // --- THÊM TRƯỜNG MÔ TẢ ---
   stock_quantity: z.coerce.number().default(0),
   min_stock_level: z.coerce.number().default(0),

   is_new: z.boolean().default(false),
   is_best_seller: z.boolean().default(false),
   featured: z.boolean().default(false),
   is_active: z.boolean().default(true),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
   onAdd?: (data: Product) => void;
   onUpdate?: (data: Product) => void;
   editing?: Product | null;
}

export default function ProductForm({ onAdd, onUpdate, editing }: ProductFormProps) {
   const [categories, setCategories] = useState<Category[]>([]);
   const [preview, setPreview] = useState<string | null>(null);
   const [loading, setLoading] = useState(false);
   const [selectedFile, setSelectedFile] = useState<File | null>(null);

   const {
      register,
      handleSubmit,
      setValue,
      watch,
      reset,
      formState: { errors },
   } = useForm({
      resolver: zodResolver(productSchema),
      defaultValues: {
         name: "", slug: "", price: 0, cost_price: 0, unit: "",
         category_id: "", stock_quantity: 0, min_stock_level: 0,
         is_new: false, is_best_seller: false, featured: false, is_active: true,
         image: null,
         description: "", // --- THÊM DEFAULT VALUE ---
      },
   });

   // 3. LOAD DATA
   useEffect(() => {
      if (editing) {
         const rawCateId = editing.category_id ?? (editing as any).categories?.id ?? (editing as any).category?.id;
         const cateIdString = rawCateId ? String(rawCateId) : "";

         reset({
            name: editing.name,
            slug: editing.slug || "",
            price: Number(editing.price) || 0,
            cost_price: Number(editing.cost_price) || 0,
            unit: editing.unit || "",
            category_id: cateIdString,
            stock_quantity: Number(editing.stock_quantity) || 0,
            min_stock_level: Number(editing.min_stock_level) || 0,
            is_new: Boolean(editing.is_new),
            is_best_seller: Boolean(editing.is_best_seller),
            featured: Boolean(editing.featured),
            is_active: editing.is_active !== undefined ? Boolean(editing.is_active) : true,
            image: editing.image || null,
            description: editing.description || "", // --- LOAD DỮ LIỆU CŨ ---
         });

         if (editing.image) {
            setPreview(`/images/products/${editing.image}`);
         }
      }
   }, [editing, reset, categories]);

   useEffect(() => {
      axios.get<Category[]>("/api/categories")
         .then((res) => setCategories(res.data))
         .catch((err) => {
            console.error("Lỗi tải danh mục:", err);
         });
   }, []);

   const nameValue = watch("name");
   useEffect(() => {
      if (!editing && nameValue) {
         const slug = nameValue.toLowerCase().normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-")
            .replace(/[^\w\-]+/g, "").replace(/\-\-+/g, "-").replace(/^-+|-+$/g, "");
         setValue("slug", slug);
      }
   }, [nameValue, editing, setValue]);

   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const validTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!validTypes.includes(file.type)) {
         alert("❌ Chỉ chấp nhận file ảnh định dạng PNG hoặc JPG/JPEG!");
         e.target.value = "";
         return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
         alert("❌ File quá lớn! Vui lòng chọn ảnh dưới 5MB.");
         e.target.value = "";
         return;
      }

      setPreview(URL.createObjectURL(file));
      setSelectedFile(file);
   };

   const onSubmit = async (data: ProductFormValues) => {
      setLoading(true);
      try {
         let uploadedFileName = data.image;

         if (selectedFile) {
            const uploadForm = new FormData();
            uploadForm.append("file", selectedFile);
            const uploadRes = await axios.post<{ fileName: string }>("/api/upload?type=products", uploadForm, {
               headers: { "Content-Type": "multipart/form-data" },
            });
            uploadedFileName = uploadRes.data.fileName;
         }

         const payload = { ...data, image: uploadedFileName };

         let res;
         if (editing) {
            // --- CẬP NHẬT ---
            res = await axios.put<Product>(`/api/admin/products/${editing.id}`, payload);
            alert("Cập nhật thành công");
            onUpdate?.(res.data);
         } else {
            // --- THÊM MỚI ---
            res = await axios.post<Product>(`/api/admin/products`, payload);
            alert("Thêm sản phẩm thành công");
            onAdd?.(res.data);
         }

         if (!editing) {
            reset();
            setPreview(null);
            setSelectedFile(null);
         }

      } catch (err) {
         console.error("❌ Lỗi khi lưu sản phẩm:", err);
         alert("Có lỗi xảy ra, vui lòng thử lại!");
      } finally {
         setLoading(false);
      }
   };

   return (
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 relative">
         
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* CỘT 1: Ảnh */}
            <div className="md:col-span-1 space-y-4">
               <label className="block text-sm font-medium text-gray-700">Ảnh sản phẩm</label>
               <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 relative h-64 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition group">
                  <input
                     type="file"
                     accept=".png, .jpg, .jpeg"
                     onChange={handleFileChange}
                     className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  {preview ? (
                     <div className="relative w-full h-full">
                        <img 
                           src={preview} 
                           alt="preview" 
                           className="w-full h-full object-contain rounded-lg" 
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                           <p className="text-white font-medium flex items-center gap-2"><ImagePlus size={20} /> Thay ảnh</p>
                        </div>
                     </div>
                  ) : (
                     <div className="flex flex-col items-center gap-2 text-gray-400">
                        <UploadCloud size={40} />
                        <p className="text-sm">Chọn ảnh (PNG, JPG)</p>
                     </div>
                  )}
               </div>
            </div>

            {/* CỘT 2: Thông tin chính */}
            <div className="md:col-span-2 space-y-4">
               {/* Tên SP */}
               <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Tên sản phẩm <span className="text-red-500">*</span></label>
                  <input
                     {...register("name")}
                     className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                     placeholder="Nhập tên sản phẩm..."
                  />
                  {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
               </div>

               {/* Giá */}
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-gray-700">Giá bán <span className="text-red-500">*</span></label>
                     <input type="number" {...register("price")} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none" />
                     {errors.price && <p className="text-red-500 text-xs">{errors.price.message}</p>}
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-gray-700">Giá vốn</label>
                     <input type="number" {...register("cost_price")} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 outline-none" />
                  </div>
               </div>

               {/* Danh mục & Đơn vị */}
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-gray-700">Danh mục <span className="text-red-500">*</span></label>
                     <select {...register("category_id")} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                        <option value="">-- Chọn --</option>
                        {categories && categories.length > 0 ? (
                           categories.map((c) => (
                              <option key={c.id} value={String(c.id)}>
                                 {c.name}
                              </option>
                           ))
                        ) : (
                           <option disabled>Đang tải danh mục...</option>
                        )}
                     </select>
                     {errors.category_id && <p className="text-red-500 text-xs">{errors.category_id.message}</p>}
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-gray-700">Đơn vị</label>
                     <input {...register("unit")} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 outline-none" placeholder="Cái..." />
                  </div>
               </div>

               {/* --- PHẦN MỚI THÊM: MÔ TẢ --- */}
               <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                     <FileText className="w-4 h-4" /> Mô tả sản phẩm
                  </label>
                  <textarea
                     {...register("description")}
                     rows={4}
                     className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                     placeholder="Nhập mô tả chi tiết về sản phẩm..."
                  />
               </div>
            </div>
         </div>

         <hr className="border-gray-100" />

         {/* Kho & Thuộc tính */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
               <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Archive className="w-4 h-4" /> Quản lý kho</h3>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="text-xs text-gray-500 uppercase font-semibold">Tồn kho</label>
                     <input type="number" {...register("stock_quantity")} className="w-full px-3 py-2 rounded-lg border border-gray-300 outline-none" />
                  </div>
                  <div>
                     <label className="text-xs text-gray-500 uppercase font-semibold">Tối thiểu</label>
                     <input type="number" {...register("min_stock_level")} className="w-full px-3 py-2 rounded-lg border border-gray-300 outline-none" />
                  </div>
               </div>
            </div>

            <div className="space-y-4">
               <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Tag className="w-4 h-4" /> Thuộc tính</h3>
               <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-gray-50">
                     <input type="checkbox" {...register("is_new")} className="w-5 h-5 text-blue-600 rounded" />
                     <span className="text-sm font-medium">Sản phẩm mới</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-gray-50">
                     <input type="checkbox" {...register("is_best_seller")} className="w-5 h-5 text-blue-600 rounded" />
                     <span className="text-sm font-medium">Bán chạy</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-gray-50">
                     <input type="checkbox" {...register("featured")} className="w-5 h-5 text-blue-600 rounded" />
                     <span className="text-sm font-medium">Nổi bật</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-gray-50">
                     <input type="checkbox" {...register("is_active")} className="w-5 h-5 text-blue-600 rounded" />
                     <span className="text-sm font-medium">Đang bán</span>
                  </label>
               </div>
            </div>
         </div>

         <div className="pt-4 mt-2 border-t border-gray-100">
            <button
               type="submit"
               disabled={loading}
               className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 disabled:opacity-70"
            >
               {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
               {loading ? "Đang xử lý..." : editing ? "Lưu thay đổi" : "Thêm sản phẩm mới"}
            </button>
         </div>
      </form>
   );
}