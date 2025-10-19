export interface Coupon {
  id?: number;
  code: string;
  description?: string;
  discount_percent?: number;
  valid_from?: string;
  valid_until?: string;
  usage_limit?: number;
  active: boolean;
}
