import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const SECRET = process.env.JWT_SECRET || "supersecret";

// Chuẩn hóa field thành mảng string
function normalizeArray(field: unknown): string[] {
  if (Array.isArray(field)) return field as string[];
  if (typeof field === "string") return field.split(",").map((s) => s.trim());
  return [];
}

export async function GET() {
  try {
    console.log("===== 🟦 API Recommendation Triggered =====");

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    let user: { id: number; email: string; role?: string } | null = null;

    if (token) {
      try {
        user = jwt.verify(token, SECRET) as any;
        console.log("🟩 User decoded:", user);
      } catch {
        console.log("🟥 Token invalid → user = null");
        user = null;
      }
    } else {
      console.log("🟥 No token found → user not logged in");
    }

    // ----------------------------------------------------------
    // CASE 1: User NOT logged in → return popular products
    // ----------------------------------------------------------
    if (!user) {
      console.log("🟧 Guest user → loading popular products...");
      const popularProducts = await prisma.products.findMany({
        where: { is_active: true },
        orderBy: { popularity: "desc" },
        take: 10,
        include: { categories: true },
      });

      console.log("🟩 Popular products:", JSON.stringify(popularProducts, null, 2));
      return NextResponse.json(popularProducts);
    }

    // ----------------------------------------------------------
    // User logged in → Load interaction history
    // ----------------------------------------------------------
    console.log("🟦 Fetching interactions for user:", user.id);

    const interactions = await prisma.user_product_interactions.findMany({
      where: { user_id: user.id },
      include: { products: true },
      orderBy: { created_at: "desc" },
      take: 10,
    });

    console.log("🟩 User interactions:", JSON.stringify(interactions, null, 2));

    // ----------------------------------------------------------
    // Fallback if no interactions
    // ----------------------------------------------------------
    if (interactions.length === 0) {
      console.log("🟧 User has no interactions → fallback popular products");
      const fallback = await prisma.products.findMany({
        where: { is_active: true },
        orderBy: { popularity: "desc" },
        take: 10,
        include: { categories: true },
      });

      console.log("🟩 Fallback products:", JSON.stringify(fallback, null, 2));
      return NextResponse.json(fallback);
    }

    // ----------------------------------------------------------
    // Build tag/region profile
    // ----------------------------------------------------------
    const userTags = new Set<string>();
    const userRegions = new Set<string>();

    interactions.forEach((i) => {
      const p = i.products;
      const tags = normalizeArray(p.tags);
      const regions = normalizeArray(p.region);

      tags.forEach((t) => userTags.add(t));
      regions.forEach((r) => userRegions.add(r));
    });

    console.log("🟦 User tag profile:", [...userTags]);
    console.log("🟦 User region profile:", [...userRegions]);

    // ----------------------------------------------------------
    // Get all products
    // ----------------------------------------------------------
    const allProducts = await prisma.products.findMany({
      where: { is_active: true },
    });

    console.log("🟩 Total active products:", allProducts.length);

    // ----------------------------------------------------------
    // Score products
    // ----------------------------------------------------------
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

        return { id: p.id, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    console.log("🟩 TOP scored product IDs:", scoredProducts);

    const ids = scoredProducts.map((p) => p.id);

    // ----------------------------------------------------------
    // Load full products data for the IDs
    // ----------------------------------------------------------
    const fullProducts = await prisma.products.findMany({
      where: { id: { in: ids } },
      include: {
        categories: true, // thêm luôn nếu bạn muốn đầy đủ thông tin
      },
    });

    console.log("🟦 Full products from DB:", JSON.stringify(fullProducts, null, 2));

    // ----------------------------------------------------------
    // Merge score vào product
    // ----------------------------------------------------------
    const merged = fullProducts.map((p) => {
      const score = scoredProducts.find((s) => s.id === p.id)?.score || 0;
      return { ...p, score };
    });

    // sort theo score giảm dần
    merged.sort((a, b) => b.score - a.score);

    console.log("🟩 Final recommendation:", JSON.stringify(merged, null, 2));

    return NextResponse.json(merged);
  } catch (error) {
    console.error("🔥 Recommendation error:", error);
    return NextResponse.json(
      { error: "Failed to load recommendations" },
      { status: 500 }
    );
  }
}
