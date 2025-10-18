import ProductCard from "@/components/product/ProductCard";
import Link from "next/link";
import { prisma } from "@/lib/prisma"; // 👉 import Prisma client
import { ProductMapper } from "@/lib/mappers/productMapper";
import { Product } from "@/types/product"; // 👉 type chuẩn cho FE

export default async function NewProducts() {
  // Lấy sản phẩm mới từ DB
  const products = await prisma.products.findMany({
    where: { is_new: true },
    orderBy: { id: "desc" }, // sắp xếp mới nhất trước
    take: 12, // chỉ lấy 12 sản phẩm mới nhất
    include: { categories: true },
  });
console.log("New Products1:", products.length);
  const newProducts: Product[] = products.map(ProductMapper.toDomain);

  console.log("New Products2:", newProducts.length);
  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-4">Sản phẩm mới</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {newProducts.slice(0, 8).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {newProducts.length > 8 && (
        <div className="mt-6 text-center">
          <Link
            href="/products/new"
            className="inline-block px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
          >
            Xem tất cả
          </Link>
        </div>
      )}
    </section>
  );
}
