// zalopay config
export const ZALO_CONFIG = {
  APP_ID: Number(process.env.ZALOPAY_APP_ID),
  KEY1: process.env.ZALOPAY_KEY1 || "",
  KEY2: process.env.ZALOPAY_KEY2 || "",
  CREATE_ORDER_URL: process.env.ZALOPAY_CREATE_ORDER_URL || "",
  CALLBACK_URL: process.env.ZALOPAY_CALLBACK_URL || "",
};

// momo config
export const MOMO_CONFIG = {
  PARTNER_CODE: process.env.MOMO_PARTNER_CODE!,
  ACCESS_KEY: process.env.MOMO_ACCESS_KEY!,
  SECRET_KEY: process.env.MOMO_SECRET_KEY!,
  ENDPOINT: process.env.MOMO_ENDPOINT || "https://test-payment.momo.vn",
  CREATE_PATH: process.env.MOMO_CREATE_PATH || "/v2/gateway/api/create",
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
};
