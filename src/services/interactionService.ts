import { prisma } from "@/lib/prisma";

export async function logUserInteraction(
  userId: number,
  productId: number,
  interactionType: "view" | "add_to_cart" | "purchase"
) {
  try {
    // Nếu user chưa đăng nhập thì bỏ qua
    if (!userId) return;

    await prisma.user_product_interactions.create({
      data: {
        user_id: userId,
        product_id: productId,
        interaction_type: interactionType,
        interaction_weight:
          interactionType === "purchase"
            ? 1.0
            : interactionType === "add_to_cart"
            ? 0.7
            : 0.3, // xem thì trọng số nhẹ hơn
      },
    });

    console.log(`✅ Ghi log hành vi: ${interactionType} - user:${userId}, product:${productId}`);
  } catch (error) {
    console.error("❌ Lỗi ghi log hành vi:", error);
  }
}
