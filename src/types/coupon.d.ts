export interface Coupon {
  id: number;
  code: string;
  description?: string | null;
  discount_percent?: number | null;
  discount_amount?: number | null;
  valid_from?: string | null;
  valid_until?: string | null;
  usage_limit?: number | null;
  status?: boolean | string | null; // ✅ thêm string để tránh lỗi
}
