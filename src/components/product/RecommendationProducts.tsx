// app/components/product/RecommendationProducts.tsx
import ProductCard from "@/components/product/ProductCard";
import { prisma } from "@/lib/prisma";
import { ProductMapper } from "@/lib/mappers/productMapper";

export default async function RecommendationProducts() {
  // Lấy sản phẩm nổi bật (featured = true) từ DB
  const dbProducts = await prisma.products.findMany({
    where: { featured: true },
    include: { categories: true },
    take: 4, // chỉ lấy 4 sản phẩm
  });

  // Convert Prisma model -> Domain model
  const products = dbProducts.map(ProductMapper.toDomain);

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-4">Sản phẩm đề xuất</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
