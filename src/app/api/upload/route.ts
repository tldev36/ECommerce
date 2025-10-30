import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // mặc định categories

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Không có file tải lên" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // 🟢 Tự chọn thư mục theo loại
    const uploadDir = path.join(process.cwd(), `public/images/${type}`);
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const ext = path.extname(file.name);
    const fileName = `${randomUUID()}${ext}`;
    const filePath = path.join(uploadDir, fileName);

    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({
      success: true,
      url: `/images/${type}/${fileName}`, // 🔹 không cần /public ở đây
      fileName,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Lỗi khi tải ảnh lên" }, { status: 500 });
  }
}
