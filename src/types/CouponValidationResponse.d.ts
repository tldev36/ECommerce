interface CouponValidationResponse {
  valid?: boolean;
  message?: string;
  discount_percent?: number | null;
  discount_amount?: number | null;
}