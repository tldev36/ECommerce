export interface ProductSummary {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  price: number;
}

export interface OrderItem {
  id?: number;
  order_id?: number;
  product_id: number;
  quantity: number;
  price: number;
  discount_percent?: number;
  final_price?: number;
  subtotal?: number;
  product?: ProductSummary | null;
}

export interface Order {
  id?: number;
  order_code: string;
  user_id: number;
  shipping_address_id: number;
  coupon_id?: number;
  total_amount: number;
  status: string;
  payment_method: string;
  created_at?: string;
  updated_at?: string;
  order_items?: OrderItem[];
}

export type PaymentMethod = "cod" | "zalopay" | "momo";
