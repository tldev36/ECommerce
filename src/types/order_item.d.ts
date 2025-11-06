export interface Order_Item {
  id: number;
  order_id: number | null;
  product_id: number | null;
  quantity: number;
  price: number;
  total_price: number;
}
