import { NextResponse } from "next/server";

const GHN_BASE_URL = process.env.GHN_BASE_URL!;
const GHN_TOKEN = process.env.GHN_TOKEN!;

export async function POST(req: Request) {
  try {
    const { districtId } = await req.json();
    const res = await fetch(`${GHN_BASE_URL}/master-data/ward`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Token: GHN_TOKEN,
      },
      body: JSON.stringify({ district_id: Number(districtId) }), // ✅ Đúng
    });

    console.log("ward :",res)
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("GHN Wards Error:", err);
    return NextResponse.json(
      { error: "Không thể lấy danh sách phường/xã" },
      { status: 500 }
    );
  }
}
