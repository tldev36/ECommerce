import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const SECRET = process.env.JWT_SECRET || "supersecret";

// 🧩 Hàm chuẩn hóa field (string | string[] | null) thành mảng string
function normalizeArray(field: unknown): string[] {
  if (Array.isArray(field)) return field as string[];
  if (typeof field === "string") return field.split(",").map((s) => s.trim());
  return [];
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    let user: { id: number; email: string; role?: string } | null = null;
    if (token) {
      try {
        user = jwt.verify(token, SECRET) as any;
      } catch {
        user = null;
      }
    }

    // 🔹 Nếu chưa đăng nhập → sản phẩm phổ biến
    if (!user) {
      const popularProducts = await prisma.products.findMany({
        where: { is_active: true },
        orderBy: { popularity: "desc" },
        take: 10,
      });
      return NextResponse.json(popularProducts);
    }

    // 🔹 Lấy lịch sử tương tác
    const interactions = await prisma.user_product_interactions.findMany({
      where: { user_id: user.id },
      include: { products: true }, // ✅ Đảm bảo model có quan hệ "products"
      orderBy: { created_at: "desc" },
      take: 10,
    });

    // 🔹 Nếu chưa có tương tác → fallback sản phẩm phổ biến
    if (interactions.length === 0) {
      const fallback = await prisma.products.findMany({
        where: { is_active: true },
        orderBy: { popularity: "desc" },
        take: 10,
      });
      return NextResponse.json(fallback);
    }

    // 🔹 Gom các tag & region người dùng từng tương tác
    const userTags = new Set<string>();
    const userRegions = new Set<string>();

    interactions.forEach((i) => {
      const p = i.products;
      const tags = normalizeArray(p.tags);
      const regions = normalizeArray(p.region);

      tags.forEach((t) => userTags.add(t));
      regions.forEach((r) => userRegions.add(r));
    });

    // 🔹 Tính điểm cho toàn bộ sản phẩm
    const allProducts = await prisma.products.findMany({
      where: { is_active: true },
    });

    const scoredProducts = allProducts
      .map((p) => {
        const tags = normalizeArray(p.tags);
        const regions = normalizeArray(p.region);

        const tagScore =
          tags.filter((t) => userTags.has(t)).length / (tags.length || 1);
        const regionScore =
          regions.filter((r) => userRegions.has(r)).length / (regions.length || 1);
        const popularityScore = Math.min((Number(p.popularity) || 0) / 10, 1);

        const score = tagScore * 0.5 + regionScore * 0.3 + popularityScore * 0.2;
        return { ...p, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    return NextResponse.json(scoredProducts);
  } catch (error) {
    console.error("🔥 Recommendation error:", error);
    return NextResponse.json({ error: "Failed to load recommendations" }, { status: 500 });
  }
}
