import { Category } from "./category";

export interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;             // Prisma Decimal -> number
  cost_price: number;        // Prisma Decimal -> number
  unit: string;
  image: string;
  short?: string | null;
  category_id?: number | null;
  featured?: boolean | null;
  discount?: number | null;  // Prisma Decimal -> number
  is_new?: boolean;
  is_best_seller?: boolean;
  created_at?: Date;
  updated_at?: Date;

  categories?: Category | null; // Quan hệ nhiều-1
}
