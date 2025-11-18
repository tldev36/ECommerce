// app/api/recommend/[userId]/route.ts
import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: 'Thanhlan1',
  database: 'EcommerceDB',
  port: 5432,
});

// Cosine similarity
function cosineSimilarity(a: number[], b: number[]) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val*val, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val*val, 0));
  if (normA === 0 || normB === 0) return 0;
  return dot / (normA * normB);
}

export async function GET(
  _req: Request,
  { params }: { params: { userId: string } }
) {
  const targetUserId = parseInt(params.userId, 10);

  try {
    const { rows } = await pool.query(`
      SELECT user_id, product_id, interaction_type
      FROM public.user_product_interactions
    `);

    const interactionWeightMap: Record<string, number> = { view: 1, cart: 2, buy: 3 };

    // Build user x product matrix
    const users = Array.from(new Set(rows.map(r => r.user_id)));
    const products = Array.from(new Set(rows.map(r => r.product_id)));

    const userIndexMap = new Map(users.map((u, i) => [u, i]));
    const productIndexMap = new Map(products.map((p, i) => [p, i]));

    const matrix: number[][] = Array(users.length).fill(0).map(() => Array(products.length).fill(0));

    rows.forEach(r => {
      const uIdx = userIndexMap.get(r.user_id)!;
      const pIdx = productIndexMap.get(r.product_id)!;
      matrix[uIdx][pIdx] = interactionWeightMap[r.interaction_type] || 1;
    });

    const targetIdx = userIndexMap.get(targetUserId);
    if (targetIdx === undefined) return NextResponse.json({ recommendations: [] });

    // Compute similarity with other users
    const sims: { userId: number; sim: number }[] = [];
    matrix.forEach((vec, idx) => {
      if (idx === targetIdx) return;
      sims.push({ userId: users[idx], sim: cosineSimilarity(matrix[targetIdx], vec) });
    });

    sims.sort((a,b) => b.sim - a.sim);
    const topK = sims.slice(0, 5);

    // Compute predicted scores for candidate products
    const userProducts = matrix[targetIdx].map((v, i) => v > 0 ? i : -1).filter(i => i !== -1);
    const candidateProducts = products.map((p, i) => i).filter(i => !userProducts.includes(i));

    const predictedScores: { productId: number; score: number }[] = [];
    candidateProducts.forEach(pIdx => {
      let score = 0;
      topK.forEach(u => {
        const uIdx = userIndexMap.get(u.userId)!;
        score += u.sim * matrix[uIdx][pIdx];
      });
      predictedScores.push({ productId: products[pIdx], score });
    });

    predictedScores.sort((a,b) => b.score - a.score);
    const topN = predictedScores.slice(0, 10);

    return NextResponse.json({ userId: targetUserId, recommendations: topN });

  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
