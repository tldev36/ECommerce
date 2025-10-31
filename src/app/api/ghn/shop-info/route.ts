import { NextResponse } from "next/server";
import axios from "axios";

// const GHN_TOKEN = "57a9d50f-b604-11ee-8bfa-8a2dda8ec551";
const GHN_BASE_URL = "https://dev-online-gateway.ghn.vn/shiip/public-api";

export async function GET() {
  try {
    // Gọi API GHN lấy danh sách shop
    interface ShopResponse {
      code: number;
      message: string;
      data: {
        shops: Array<{
          _id: number;
          name: string;
          address: string;
          district_id: number;
          ward_code: string;
        }>;
      };
    }

    const shopRes = await axios.post<ShopResponse>(
      `${GHN_BASE_URL}/v2/shop/all`,
      { limit: 50, offset: 0 },
      {
        headers:
        {
          Token: process.env.GHN_TOKEN!
        },
      }
    );

    if (shopRes.data.code !== 200) {
      throw new Error(shopRes.data.message);
    }

    const shop = shopRes.data.data.shops.find((s: any) => s._id === 197699);

    if (!shop) {
      return NextResponse.json(
        { message: "Không tìm thấy cửa hàng ID 197699" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      code: 200,
      message: "Success",
      data: {
        id: shop._id,
        name: shop.name,
        address: shop.address,
        district_id: shop.district_id,
        ward_code: shop.ward_code,
      },
    });
  } catch (error: any) {
    console.error("❌ Lỗi lấy thông tin shop GHN:", error.response?.data || error.message);
    return NextResponse.json(
      { success: false, error: "Không thể lấy thông tin shop GHN" },
      { status: 500 }
    );
  }
}
