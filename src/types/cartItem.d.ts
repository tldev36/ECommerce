export interface CartItem {
  id?: number;
  product_id: number;
  name: string;
  slug: string;
  price: number;
  unit: string;
  image: string;
  quantity: number;
}