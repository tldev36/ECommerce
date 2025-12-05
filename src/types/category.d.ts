import { Product } from "./product";

export interface Category {
  id: number;
  name: string;
  slug: string;
  status: boolean;
  created_at?: Date;
  updated_at?: Date;

  products?: Product[]; // Quan hệ 1-nhiều
}
