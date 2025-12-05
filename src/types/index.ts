export type OrderRow = {
  id: number;
  order_code: string;
  created_at: string;
  amount: number;
  status: string;
  // Các trường bổ sung
  customer_name?: string;
  phone?: string;
  address?: string;
  payment_method?: string;
  items?: Array<{ name: string; quantity: number; price: number }>;
};