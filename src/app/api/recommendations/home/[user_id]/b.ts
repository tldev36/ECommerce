import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Interface định nghĩa kiểu dữ liệu trả về
interface RecommendationResult {
  product: {
    id: number;
    name: string;
    image: string;
    price: number;
    unit: string;
    is_active?: boolean;
    discount?: number;
    is_new?: boolean;
    short?: string | null;
    popularity: number; // ✅ Đã đổi thành number để tránh lỗi Type Decimal
  };
  score: number;
}


// ---- Tính Jaccard similarity giữa 2 array ----
function jaccardSimilarity(a: string[], b: string[]): number {
  const setA = new Set(a);
  const setB = new Set(b);
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

// ---- Chuẩn hóa product thành vector từ TÊN và DANH MỤC ----
function getProductFeatures(product: any): string[] {
  const features: string[] = [];

  // 1. Lấy từ khóa từ Tên sản phẩm
  if (product.name) {
    const nameTokens = product.name.toLowerCase().trim().split(/\s+/);
    features.push(...nameTokens);
  }

  // 2. Lấy tên Danh mục
  if (product.categories) {
    if (typeof product.categories === 'object' && product.categories.name) {
        features.push(product.categories.name.toLowerCase());
    }
    else if (Array.isArray(product.categories)) {
        product.categories.forEach((c: any) => {
            if (c.name) features.push(c.name.toLowerCase());
        });
    }
  }

  return features;
}

// ---- Hybrid Recommendation Logic ----
async function getRecommendations(userId: number, topK: number = 10): Promise<RecommendationResult[]> {
  // Lấy toàn bộ sản phẩm đang active
  const productsData = await prisma.products.findMany({ 
    include: { categories: true },
    where: { is_active: true }
  });
  
  const interactions = await prisma.user_product_interactions.findMany({ where: { user_id: userId } });

  console.log(`🔍 User ${userId} has ${interactions.length} interactions.`);

  // --- TRƯỜNG HỢP 1: USER MỚI (Chưa có tương tác) ---
  // Trả về top sản phẩm phổ biến nhất
  if (!interactions.length) {
    return productsData
      // ✅ Fix Type: Ép kiểu sang Number trước khi trừ
      .sort((a, b) => (Number(b.popularity) || 0) - (Number(a.popularity) || 0))
      .slice(0, topK)
      .map(p => ({
        product: {
          id: p.id,
          name: p.name,
          image: p.image,
          price: Number(p.price),
          unit: p.unit,
          is_active: p.is_active ?? undefined,
          discount: p.discount ? Number(p.discount) : undefined,
          is_new: p.is_new ?? undefined,
          short: p.short ?? null,
          popularity: p.popularity ? Number(p.popularity) : 0, // ✅ Fix Type
        },
        score: 0
      }));
  }

  const interactedProductIds = interactions.map(i => i.product_id);

  // --- Content-based score ---
  const contentScores = new Map<number, number>();
  const featuresMap: Record<number, string[]> = {};
  
  productsData.forEach(p => {
    featuresMap[p.id] = getProductFeatures(p);
  });

  interactedProductIds.forEach(pid => {
    const vecA = featuresMap[pid];
    if (!vecA) return;

    productsData.forEach(p => {
      // KHÔNG FILTER: Tính toán cho tất cả sản phẩm
      const vecB = featuresMap[p.id];
      const score = jaccardSimilarity(vecA, vecB);
      contentScores.set(p.id, Math.max(contentScores.get(p.id) || 0, score));
    });
  });

  // --- Collaborative Filtering ---
  const allInteractions = await prisma.user_product_interactions.findMany();
  const productUserMap: Record<number, Record<number, number>> = {};
  
  allInteractions.forEach(i => {
    if (!productUserMap[i.product_id]) productUserMap[i.product_id] = {};
    productUserMap[i.product_id][i.user_id] = Number(i.interaction_weight);
  });

  const cfScores = new Map<number, number>();
  interactedProductIds.forEach(pid => {
    const targetUsers = productUserMap[pid];
    if (!targetUsers) return;

    for (const [otherIdStr, users] of Object.entries(productUserMap)) {
      const otherId = Number(otherIdStr);
      if (otherId === pid) continue; 

      const dot = Object.keys(targetUsers).reduce((sum, uid) => sum + (targetUsers[Number(uid)] || 0) * (users[Number(uid)] || 0), 0);
      const magA = Math.sqrt(Object.values(targetUsers).reduce((s, w) => s + w * w, 0));
      const magB = Math.sqrt(Object.values(users).reduce((s, w) => s + w * w, 0));
      
      const sim = (magA && magB) ? dot / (magA * magB) : 0;
      
      if (sim > 0) cfScores.set(otherId, Math.max(cfScores.get(otherId) || 0, sim));
    }
  });

  // --- TỔNG HỢP KẾT QUẢ ---
  let recommendations: RecommendationResult[] = productsData
    // .filter(...) -> Đã xóa filter để không loại bỏ sản phẩm
    .map(p => {
      const contentScore = contentScores.get(p.id) || 0;
      const cfScore = cfScores.get(p.id) || 0;
      
      // ✅ Fix Type: Chuyển Decimal sang Number
      const safePopularity = p.popularity ? Number(p.popularity) : 0;
      
      // Tính điểm thưởng từ popularity (nhân hệ số nhỏ)
      const popularityBonus = safePopularity * 0.0005;

      return {
        product: {
          id: p.id,
          name: p.name,
          short: p.short ?? null,
          image: p.image,
          price: Number(p.price),
          unit: p.unit,
          is_active: p.is_active !== null ? p.is_active : undefined,
          discount: p.discount !== null && p.discount !== undefined ? Number(p.discount) : undefined,
          is_new: p.is_new !== null ? p.is_new : undefined,
          popularity: safePopularity, // ✅ Trả về số đã ép kiểu
        },
        // Score = (0.6 * Content) + (0.4 * CF) + Popularity Bonus
        score: (0.6 * contentScore) + (0.4 * cfScore) + popularityBonus
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  // --- FALLBACK: Lấp đầy nếu danh sách thiếu ---
  if (recommendations.length < topK) {
      console.log("⚠️ Danh sách gợi ý thiếu, đang bổ sung sản phẩm phổ biến...");
      
      const existingIds = recommendations.map(r => r.product.id);
      
      const popularFillers = productsData
          .filter(p => !existingIds.includes(p.id))
          // ✅ Fix Type: Ép kiểu trong sort
          .sort((a, b) => (Number(b.popularity) || 0) - (Number(a.popularity) || 0))
          .slice(0, topK - recommendations.length)
          .map(p => ({
              product: {
                  id: p.id,
                  name: p.name,
                  image: p.image,
                  price: Number(p.price),
                  unit: p.unit,
                  short: p.short ?? null,
                  is_active: p.is_active !== null ? p.is_active : undefined,
                  discount: p.discount ? Number(p.discount) : undefined,
                  is_new: p.is_new ?? undefined,
                  popularity: p.popularity ? Number(p.popularity) : 0, // ✅ Fix Type
              },
              score: 0 
          }));
      
      recommendations = [...recommendations, ...popularFillers];
  }

  return recommendations;
}


// ---- Route handler ----
export async function GET(
  req: Request,
  { params }: { params: Promise<{ user_id: string }> }
) {
  const { user_id } = await params;
  const userId = Number(user_id);
  console.log("UserID requesting recommendations: ", userId);
  
  if (!userId) return NextResponse.json({ message: "Missing user_id" }, { status: 400 });

  try {
    const recommendations = await getRecommendations(userId);
    return NextResponse.json({ user_id: userId, recommendations });
  } catch (err: any) {
    console.error("Error generating recommendations:", err);
    return NextResponse.json({ message: "Error generating recommendations" }, { status: 500 });
  }
}