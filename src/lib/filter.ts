const ALLOWED = [
  "sản phẩm",
  "giá",
  "đơn hàng",
  "đổi trả",
  "vận chuyển",
  "giao hàng",
  "kho hàng",
  "mua hàng",
  "thanh toán",
];

export function isAllowedQuestion(input: string) {
  const lower = input.toLowerCase();
  return ALLOWED.some(k => lower.includes(k));
}
