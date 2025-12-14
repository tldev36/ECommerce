import { NextResponse } from "next/server";
import axios from "axios";

const GHN_BASE_URL = process.env.GHN_BASE_URL!;
const GHN_TOKEN = process.env.GHN_TOKEN!;
const GHN_SHOP_ID = Number(process.env.GHN_SHOP_ID!);

const FALLBACK_FEE = 50000; // phí mặc định
const NAME_SHOP = "FARM";
const ADDRES_SHOP = "Lê Hồng Phong, Thủ Dầu Một, Hồ Chí Minh"

export async function POST(req: Request) {
  try {
    const { toAddress, weight } = await req.json();
    if (!toAddress)
      return NextResponse.json({ code: 400, message: "Thiếu địa chỉ khách hàng" }, { status: 400 });

    // Chuẩn hóa cân nặng
    let safeWeight = Number(weight);
    if (isNaN(safeWeight) || safeWeight <= 0) safeWeight = 500;

    if (safeWeight < 50) safeWeight = 50;
    if (safeWeight < 100) safeWeight *= 1000; // đổi kg sang gram

    // 1) Lấy thông tin shop
    const shopRes = await axios.post<any>(`${GHN_BASE_URL}/v2/shop/all`, { limit: 50, offset: 0 }, {
      headers: { Token: GHN_TOKEN }
    });

    const shop = shopRes.data.data.shops.find((s: any) => s._id === GHN_SHOP_ID);

    if (!shop) {
      return NextResponse.json({
        code: 200,
        message: "GHN lỗi – không tìm thấy shop. Dùng phí mặc định.",
        data: { fee: FALLBACK_FEE }
      });
    }

    // 2) Parse địa chỉ khách hàng
    const [wardName, districtName, provinceName] = toAddress.split(",").map((p: string) => p.trim());

    // 3) Lấy tỉnh
    const provincesRes = await axios.get<any>(`${GHN_BASE_URL}/master-data/province`, {
      headers: { Token: GHN_TOKEN },
    });

    const province = provincesRes.data.data.find((p: any) =>
      provinceName.includes(p.ProvinceName)
    );

    if (!province) {
      return NextResponse.json({
        code: 200,
        message: "Không tìm thấy tỉnh – dùng phí mặc định.",
        data: { fee: FALLBACK_FEE }
      });
    }

    // 4) Lấy huyện
    const districtsRes = await axios.get<any>(`${GHN_BASE_URL}/master-data/district`, {
      headers: { Token: GHN_TOKEN },
    });

    const district = districtsRes.data.data.find(
      (d: any) => districtName.includes(d.DistrictName) && d.ProvinceID === province.ProvinceID
    );

    if (!district) {
      return NextResponse.json({
        code: 200,
        message: "Không tìm thấy huyện – dùng phí mặc định.",
        data: { fee: FALLBACK_FEE }
      });
    }

    // 5) Lấy xã
    const wardsRes = await axios.get<any>(
      `${GHN_BASE_URL}/master-data/ward?district_id=${district.DistrictID}`,
      { headers: { Token: GHN_TOKEN } }
    );

    const ward = wardsRes.data.data.find(
      (w: any) => w.WardName.trim().toLowerCase() === wardName.trim().toLowerCase()
    );

    if (!ward) {
      return NextResponse.json({
        code: 200,
        message: "Không tìm thấy phường – dùng phí mặc định.",
        data: { fee: FALLBACK_FEE }
      });
    }

    // 6) Lấy dịch vụ giao hàng
    const serviceRes = await axios.post<any>(
      `${GHN_BASE_URL}/v2/shipping-order/available-services`,
      {
        shop_id: GHN_SHOP_ID,
        from_district: shop.district_id,
        to_district: district.DistrictID,
      },
      { headers: { Token: GHN_TOKEN } }
    );

    const serviceId = serviceRes.data.data?.[0]?.service_id;

    if (!serviceId) {
      return NextResponse.json({
        code: 200,
        message: "GHN không có tuyến giao hàng – dùng phí mặc định.",
        data: { fee: FALLBACK_FEE }
      });
    }

    // 7) Tính phí GHN — bọc try/catch riêng
    let fee = FALLBACK_FEE;

    try {
      const feeRes = await axios.post<any>(
        `${GHN_BASE_URL}/v2/shipping-order/fee`,
        {
          from_district_id: shop.district_id,
          from_ward_code: shop.ward_code,
          to_district_id: district.DistrictID,
          to_ward_code: ward.WardCode,
          service_id: serviceId,
          height: 10,
          length: 20,
          width: 20,
          weight: safeWeight,
          insurance_value: 500000,
          coupon: null,
        },
        {
          headers: { Token: GHN_TOKEN, ShopId: GHN_SHOP_ID },
        }
      );

      fee = feeRes.data.data.total;
    } catch (feeErr) {
      console.warn("GHN Fee Error – fallback fee:", feeErr);
    }

    // ✔️ Kết quả cuối cùng
    return NextResponse.json({
      code: 200,
      message: "Tính phí vận chuyển thành công (có fallback nếu GHN lỗi).",
      data: {
        fee,
        weight: safeWeight,
        shop: {
          name: NAME_SHOP,
          address: ADDRES_SHOP,
        },
      },
    });

  } catch (error) {
    console.error("GHN API Fatal Error:", error);

    // Cuối cùng – fallback luôn
    return NextResponse.json({
      code: 200,
      message: "GHN bị lỗi – dùng phí mặc định.",
      data: { fee: FALLBACK_FEE },

    });
  }
}
