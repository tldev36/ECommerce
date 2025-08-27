// 📂 app/api/user/profile/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

  const body = await req.json();

  const updated = await prisma.users.update({
    where: { id },
    data: {
      name: body.name,
      email: body.email,
      phone: body.phone,
      gender: body.gender,
      birthday: body.birthday ? new Date(body.birthday) : null,
      avatar: body.avatar,
      // address: body.address, // chỉ bật nếu schema có field này
    },
    select: selectUser,
  });

  return NextResponse.json(updated);
}
