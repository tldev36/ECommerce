import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RecommendationResult {
  product: {
    id: number;
    name: string;
    image: string;
    price: number;
    unit: string;
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

// ---- Chuẩn hóa product thành vector tags + region ----
function getProductFeatures(product: any): string[] {
  return [
    ...(product.tags || []),
    ...(product.region || [])
  ];
}

// ---- Hybrid Recommendation ----
async function getRecommendations(userId: number, topK: number = 10): Promise<RecommendationResult[]> {
  const productsData = await prisma.products.findMany();
  const interactions = await prisma.user_product_interactions.findMany({ where: { user_id: userId } });

  if (!interactions.length) {
    return productsData.slice(0, topK).map(p => ({
      product: { id: p.id, name: p.name, image: p.image, price: Number(p.price), unit: p.unit },
      score: 0
    }));
  }

  const interactedProductIds = interactions.map(i => i.product_id);

  // 1️⃣ Content-based score: dựa trên tags + region
  const contentScores = new Map<number, number>();
  const featuresMap: Record<number, string[]> = {};
  productsData.forEach(p => {
    featuresMap[p.id] = getProductFeatures(p);
  });

  interactedProductIds.forEach(pid => {
    const vecA = featuresMap[pid];
    productsData.forEach(p => {
      if (interactedProductIds.includes(p.id)) return;
      const vecB = featuresMap[p.id];
      const score = jaccardSimilarity(vecA, vecB);
      contentScores.set(p.id, Math.max(contentScores.get(p.id) || 0, score));
    });
  });

  // 2️⃣ Collaborative Filtering: Cosine similarity từ weight
  const allInteractions = await prisma.user_product_interactions.findMany();
  const productUserMap: Record<number, Record<number, number>> = {};
  allInteractions.forEach(i => {
    if (!productUserMap[i.product_id]) productUserMap[i.product_id] = {};
    productUserMap[i.product_id][i.user_id] = Number(i.interaction_weight);
  });

  const cfScores = new Map<number, number>();
  interactedProductIds.forEach(pid => {
    const targetUsers = productUserMap[pid];
    for (const [otherIdStr, users] of Object.entries(productUserMap)) {
      const otherId = Number(otherIdStr);
      if (interactedProductIds.includes(otherId) || otherId === pid) continue;

      const dot = Object.keys(targetUsers).reduce((sum, uid) => sum + (targetUsers[Number(uid)] || 0) * (users[Number(uid)] || 0), 0);
      const magA = Math.sqrt(Object.values(targetUsers).reduce((s, w) => s + w * w, 0));
      const magB = Math.sqrt(Object.values(users).reduce((s, w) => s + w * w, 0));
      const sim = dot / (magA * magB || 1);
      if (sim > 0) cfScores.set(otherId, Math.max(cfScores.get(otherId) || 0, sim));
    }
  });

  // 3️⃣ Hybrid score = 0.6 content + 0.4 CF
  const recommendations: RecommendationResult[] = productsData
    .filter(p => !interactedProductIds.includes(p.id))
    .map(p => ({
      product: { id: p.id, name: p.name, image: p.image, price: Number(p.price), unit: p.unit },
      score: 0.6 * (contentScores.get(p.id) || 0) + 0.4 * (cfScores.get(p.id) || 0)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return recommendations;
}

// ---- Route handler ----
export async function GET(
  req: Request,
  { params }: { params: Promise<{ user_id: string }> }
  // req: Request, ctx: { params: { user_id: string } }
) {
  // const userId = Number(ctx.params.user_id);
  const { user_id } = await params;
  const userId = Number(user_id);
  if (!userId) return NextResponse.json({ message: "Missing user_id" }, { status: 400 });

  try {
    const recommendations = await getRecommendations(userId);
    return NextResponse.json({ user_id: userId, recommendations });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: "Error generating recommendations" }, { status: 500 });
  }
}
