import { NextResponse } from "next/server";
import axios from "axios";

const GHN_BASE_URL = process.env.GHN_BASE_URL!;
const GHN_TOKEN = process.env.GHN_TOKEN!;
const GHN_SHOP_ID = Number(process.env.GHN_SHOP_ID!);

export async function POST(req: Request) {
  try {
    const { toAddress, weight } = await req.json();
    if (!toAddress)
      return NextResponse.json(
        { code: 400, message: "Thiếu địa chỉ khách hàng" },
        { status: 400 }
      );

    // ✅ Chuẩn hóa cân nặng
    let safeWeight = Number(weight);
    if (isNaN(safeWeight) || safeWeight <= 0) safeWeight = 500;
    if (safeWeight < 50) safeWeight = 50;
    if (safeWeight < 100) safeWeight *= 1000; // nhập kg thì đổi sang gram

    // ✅ 1️⃣ Lấy thông tin cửa hàng
    const shopRes = await axios.post<any>(`${GHN_BASE_URL}/v2/shop/all`, { limit: 50, offset: 0 }, {
      headers: { Token: GHN_TOKEN },
    });

    const shop = shopRes.data.data.shops.find((s: any) => s._id === GHN_SHOP_ID);
    if (!shop)
      return NextResponse.json(
        { code: 404, message: "Không tìm thấy cửa hàng trong hệ thống GHN" },
        { status: 404 }
      );

    // ✅ 2️⃣ Parse địa chỉ khách hàng
    const [wardName, districtName, provinceName] = toAddress.split(",").map((p: string) => p.trim());

    // ✅ 3️⃣ Lấy tỉnh
    const provincesRes = await axios.get<any>(`${GHN_BASE_URL}/master-data/province`, {
      headers: { Token: GHN_TOKEN },
    });
    const province = provincesRes.data.data.find((p: any) =>
      provinceName.includes(p.ProvinceName)
    );
    if (!province)
      return NextResponse.json({
        code: 404,
        message: `Không tìm thấy tỉnh tương ứng: "${provinceName}"`,
      });

    // ✅ 4️⃣ Lấy huyện
    const districtsRes = await axios.get<any>(`${GHN_BASE_URL}/master-data/district`, {
      headers: { Token: GHN_TOKEN },
    });
    const district = districtsRes.data.data.find(
      (d: any) =>
        districtName.includes(d.DistrictName) &&
        d.ProvinceID === province.ProvinceID
    );
    if (!district)
      return NextResponse.json({
        code: 404,
        message: `Không tìm thấy huyện tương ứng: "${districtName}" trong ${province.ProvinceName}`,
      });

    // ✅ 5️⃣ Lấy xã
    const wardsRes = await axios.get<any>(
      `${GHN_BASE_URL}/master-data/ward?district_id=${district.DistrictID}`,
      { headers: { Token: GHN_TOKEN } }
    );
    // const ward = wardsRes.data.data.find((w: any) =>
    //   wardName.includes(w.WardName)
    // );
    const ward = wardsRes.data.data.find(
      (w: any) => w.WardName.trim().toLowerCase() === wardName.trim().toLowerCase()
    );

    if (!ward)
      return NextResponse.json({
        code: 404,
        message: `Không tìm thấy xã/phường tương ứng: "${wardName}" trong ${district.DistrictName}`,
      });

    // ✅ 6️⃣ Lấy dịch vụ giao hàng khả dụng
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
        code: 400,
        message: "❌ Khu vực này hiện GHN chưa hỗ trợ giao hàng hoặc không có tuyến phù hợp.",
        details: {
          province: province.ProvinceName,
          district: district.DistrictName,
          ward: ward.WardName,
        },
      });
    }

    // ✅ 7️⃣ Gọi API tính phí GHN
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
        headers: {
          Token: GHN_TOKEN,
          ShopId: GHN_SHOP_ID,
        },
      }
    );

    // ✅ 8️⃣ Trả kết quả thành công
    return NextResponse.json({
      code: 200,
      message: "Tính phí giao hàng thành công",
      data: {
        shop: {
          id: shop._id,
          name: shop.name,
          address: shop.address,
        },
        customer: {
          province: province.ProvinceName,
          district: district.DistrictName,
          ward: ward.WardName,
        },
        fee: feeRes.data.data.total,
        service_id: serviceId,
        weight: safeWeight,
      },
    });
  } catch (error: any) {
    console.error("💥 GHN Fee API Error:", error.response?.data || error.message);
    const message =
      error.response?.data?.message ||
      error.response?.data?.text ||
      error.message ||
      "Không tính được phí vận chuyển";

    return NextResponse.json(
      {
        code: 500,
        message,
      },
      { status: 500 }
    );
  }
}
