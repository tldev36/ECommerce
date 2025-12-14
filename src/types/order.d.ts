import { Order_Item } from "./order_item";

export type PaymentMethod = "cod" | "zalopay" | "momo";

export interface Order {
  id: number
  order_code: string
  user_id: number
  coupon_amount: number
  amount: number
  status: string
  payment_method: string
  created_at: string
  updated_at: string
  shipping_address: string
  ward_address: string
  district_address: string
  ship_amount: number
  payment_status: string
  order_items?: (Order_Item & {
    product?: {
      id: number;
      name: string;
      image: string;
      price: number;
      quantity: number;
    };
  })[];
}