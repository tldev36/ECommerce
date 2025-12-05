// 📂 app/api/user/profile/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const selectUser = {
  id: true,
  username: true,
  name: true,
  email: true,
  phone: true,
  gender: true,
  birthday: true,
  avatar: true,
  role: true,
  is_active: true,
  created_at: true,
  updated_at: true,
  // Nếu trong schema bạn có "address", mở comment dưới:
  // address: true,
};

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 });
  }

  const user = await prisma.users.findUnique({ where: { id }, select: selectUser });
  if (!user) {
    return NextResponse.json({ error: "Không tìm thấy user" }, { status: 404 });
  }
  return NextResponse.json(user);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 });
  }

  try {
    // 1. Nhận dữ liệu dạng FormData
    const formData = await req.formData();

    // 2. Lấy các trường thông tin
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const gender = formData.get("gender") as string;
    const birthdayStr = formData.get("birthday") as string;
    
    // 3. Xử lý File ảnh
    const file = formData.get("file") as File | null;
    
    let avatarPath = formData.get("avatarUrl") as string; // Mặc định lấy URL cũ nếu không có file mới

    // Nếu người dùng có upload file mới
    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Tạo tên file duy nhất (timestamp + tên gốc đã bỏ khoảng trắng)
      const filename = `${Date.now()}-${file.name.replaceAll(" ", "_")}`;
      
      // Đường dẫn thư mục lưu: public/images/avatar
      const uploadDir = path.join(process.cwd(), "public/images/avatar");

      // Tạo thư mục nếu chưa tồn tại (để tránh lỗi)
      await mkdir(uploadDir, { recursive: true });

      // Đường dẫn file vật lý trên ổ cứng
      const filePath = path.join(uploadDir, filename);

      // Ghi file vào ổ cứng
      await writeFile(filePath, buffer);

      // Cập nhật đường dẫn avatar để lưu vào DB (đường dẫn tương đối từ gốc web)
      avatarPath = `/images/avatar/${filename}`;
    }

    // 4. Update Database
    const updated = await prisma.users.update({
      where: { id },
      data: {
        name,
        phone,
        gender,
        birthday: birthdayStr ? new Date(birthdayStr) : null,
        avatar: avatarPath, // Lưu đường dẫn "/images/avatar/..."
      },
      // select: selectUser, // Nếu bạn có định nghĩa selectUser
    });

    return NextResponse.json(updated);

  } catch (error) {
    console.error("Lỗi update profile:", error);
    return NextResponse.json({ error: "Lỗi server khi lưu thông tin" }, { status: 500 });
  }
}
