// app/components/product/RecommendationProducts.tsx
import ProductCard from "@/components/product/ProductCard";
import { prisma } from "@/lib/prisma";
import { ProductMapper } from "@/lib/mappers/productMapper";

export default async function RecommendationProducts() {
  // Lấy sản phẩm nổi bật (featured = true) từ DB
  const dbProducts = await prisma.products.findMany({
    where: { featured: true },
    include: { categories: true },
    take: 5, // chỉ lấy 5 sản phẩm
  });

  // Convert Prisma model -> Domain model
  const products = dbProducts.map(ProductMapper.toDomain);

  return (
    // <section className="max-w-7xl mx-auto px-4 py-10 space-y-6">
    //   <h2 className="text-2xl font-semibold mb-4">Sản phẩm đề xuất</h2>
    //   <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
    //     {products.map((p) => (
    //       <ProductCard key={p.id} product={p} />
    //     ))}
    //   </div>
    // </section>
    <section className="w-full bg-white py-14">
      <div className="max-w-[1700px] mx-auto px-6 space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-wide text-gray-900">
            Sản phẩm đề xuất
          </h2>
          <button className="text-green-600 text-sm hover:underline">
            Xem tất cả →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-7">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>

  );
}
