import { Category } from "./category";

/**
 * Dữ liệu Product trả về từ API (Prisma → JSON)
 * - Thời gian là dạng string (ISO)
 */
export interface ProductApi {
  id: number;
  name: string;
  slug: string;
  price: number | null;
  cost_price: number | null;
  unit: string | null;
  image: string | null;
  short?: string | null;
  category_id?: number | null;
  featured?: boolean | null;
  discount?: number | null;
  stock_quantity?: number | null;
  min_stock_level?: number | null;
  is_active?: boolean;
  is_new?: boolean;
  is_best_seller?: boolean;
  created_at?: string;   // <-- API trả về chuỗi
  updated_at?: string;
  categories?: Category | null;
  description?: string | null;
  tags: string | null;
  region: string | null;
  description: string | null;
  weight_gram: number;
  popularity?: number;
}

/**
 * Dữ liệu Product dùng trong client (UI)
 * - Thời gian là đối tượng Date
 */
export type Product = Omit<ProductApi, "created_at" | "updated_at"> & {
  created_at?: Date;
  updated_at?: Date;
};
