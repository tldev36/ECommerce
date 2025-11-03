// types/dto.ts
export interface OrderItemDTO {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  total_price: number;
  product: {
    id: number;
    name: string;
    image?: string | null;
  };
}

export interface OrderDTO {
  id: number;
  order_code: string;
  total_amount: number;
  payment_method: string;
  status: string;
  created_at: string;
  updated_at: string;
  shipping_address: string;
  ship_amount?: number;
  coupon_amount?: number;
  order_items: OrderItemDTO[];
}
