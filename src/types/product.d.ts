import { Category } from "./category";

/**
 * Dữ liệu Product trả về từ API (Prisma → JSON)
 * - Thời gian là dạng string (ISO)
 */
export interface ProductApi {
  id: number;
  name: string;
  slug: string;
  price: number;
  cost_price: number;
  unit: string;
  image: string;
  short?: string | null;
  category_id?: number | null;
  featured?: boolean | null;
  discount?: number | null;
  stock_quantity?: number;
  min_stock_level?: number;
  is_active?: boolean;
  is_new?: boolean;
  is_best_seller?: boolean;
  created_at?: string;   // <-- API trả về chuỗi
  updated_at?: string;
  categories?: Category | null;
}

/**
 * Dữ liệu Product dùng trong client (UI)
 * - Thời gian là đối tượng Date
 */
export type Product = Omit<ProductApi, "created_at" | "updated_at"> & {
  created_at?: Date;
  updated_at?: Date;
};
