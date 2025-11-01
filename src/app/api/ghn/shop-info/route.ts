import { NextResponse } from "next/server";
import axios from "axios";

const GHN_BASE_URL = "https://dev-online-gateway.ghn.vn/shiip/public-api";
const SHOP_ID = 197699;

interface Shop {
  _id: number;
  name: string;
  address: string;
  district_id: number;
  ward_code: string;
}

interface ShopResponse {
  code: number;
  message: string;
  data: {
    shops: Shop[];
  };
}

export async function GET() {
  const token = process.env.GHN_TOKEN;
  if (!token) {
    return NextResponse.json(
      { success: false, error: "GHN_TOKEN chưa được cấu hình" },
      { status: 500 }
    );
  }

  try {
    const shopRes = await axios.post<ShopResponse>(
      `${GHN_BASE_URL}/v2/shop/all`,
      { limit: 50, offset: 0 },
      { headers: { Token: token } }
    );

    if (shopRes.data.code !== 200) {
      throw new Error(shopRes.data.message);
    }

    const shop = shopRes.data.data.shops.find((s) => s._id === SHOP_ID);

    if (!shop) {
      return NextResponse.json(
        { success: false, message: `Không tìm thấy cửa hàng ID ${SHOP_ID}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Lấy thông tin shop thành công",
      data: shop,
    });
  } catch (error: any) {
    console.error("❌ Lỗi lấy thông tin shop GHN:", error.response?.data || error.message);
    return NextResponse.json(
      { success: false, error: "Không thể lấy thông tin shop GHN" },
      { status: 500 }
    );
  }
}
