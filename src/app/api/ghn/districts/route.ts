import { NextResponse } from "next/server";

const GHN_BASE_URL = process.env.GHN_BASE_URL!;
const GHN_TOKEN = process.env.GHN_TOKEN!;

export async function POST(req: Request) {
  try {
    const { provinceId } = await req.json();
    const res = await fetch(`${GHN_BASE_URL}/master-data/district`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Token: GHN_TOKEN,
      },
      body: JSON.stringify({ province_id: Number(provinceId) }), // ✅ Đúng định dạng
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("GHN Districts Error:", err);
    return NextResponse.json(
      { error: "Không thể lấy danh sách quận/huyện" },
      { status: 500 }
    );
  }
}
