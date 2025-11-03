import { NextResponse } from "next/server";
import { da } from "zod/v4/locales";

const GHN_BASE_URL = process.env.GHN_BASE_URL!;
const GHN_TOKEN = process.env.GHN_TOKEN!;

export async function GET() {
  try {
    const res = await fetch(`${GHN_BASE_URL}/master-data/province`, {
      headers: { Token: GHN_TOKEN },
    });

    console.log("data province :", res);
    const data = await res.json();

    console.log("data province :", data);
    return NextResponse.json(data);
  } catch (err) {
    console.error("GHN Provinces Error:", err);
    return NextResponse.json({ error: "Không thể lấy danh sách tỉnh" }, { status: 500 });
  }
}
