import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "supersecret";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const token = cookieHeader.split("; ").find((c) => c.startsWith("token="))?.split("=")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const decoded = jwt.verify(token, SECRET) as { id: number };

    const { recipient_name, phone, detail_address, province_district_ward } = await req.json();

    const updatedAddress = await prisma.shipping_addresses.updateMany({
      where: { id: Number(params.id), user_id: decoded.id },
      data: { recipient_name, phone, detail_address, province_district_ward },
    });

    return NextResponse.json({ address: updatedAddress });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
