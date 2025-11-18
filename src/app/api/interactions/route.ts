import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const { userId, productId, interactionType } = await req.json();

        if (!userId || !productId || !interactionType) {
            return NextResponse.json({ error: "Thiếu dữ liệu" }, { status: 400 });
        }

        await prisma.user_product_interactions.create({
            data: {
                user_id: Number(userId),
                product_id: Number(productId),
                interaction_type: interactionType,
                interaction_weight:
                    interactionType === "purchase"
                        ? 1.0
                        : interactionType === "add_to_cart"
                            ? 0.7
                            : 0.3, // view nhẹ nhất
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("❌ Lỗi ghi log hành vi:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
