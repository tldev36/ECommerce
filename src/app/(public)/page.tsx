// src/app/(public)/page.tsx
import Image from "next/image";
import ProductCard from "@/components/product/ProductCard";
import Header from "@/components/layout/Header";
import { products } from "@/data/products";
import { categories } from "@/data/categories";

export default function PublicHome() {
  const featured = products.filter((p) => p.featured);
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero */}
      <section className="bg-[url('/images/hero.jpg')] bg-cover bg-center">
        <div className="bg-black/30">
          <div className="max-w-6xl mx-auto px-4 py-24 text-white">
            <h1 className="text-4xl md:text-5xl font-bold">Nông sản sạch — Tươi từ vườn đến bàn</h1>
            <p className="mt-4 text-lg text-gray-100/90 max-w-2xl">
              Chúng tôi kết nối nông dân sạch với người tiêu dùng, cam kết không chất bảo quản, giao tận nơi.
            </p>
            <div className="mt-6">
              <a href="/products" className="bg-green-600 px-5 py-3 rounded-md font-medium shadow hover:bg-green-700">Mua ngay</a>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-semibold mb-4">Danh mục</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((c) => (
            <a key={c.id} href={c.href} className="relative rounded-md overflow-hidden group">
              <div className="relative w-full h-36">
                <Image src={c.image} alt={c.name} fill style={{ objectFit: "cover" }} />
              </div>
              <div className="absolute inset-0 bg-black/25 flex items-end p-3">
                <div className="text-white font-semibold">{c.name}</div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold mb-4">Sản phẩm nổi bật</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Latest */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold mb-4">Sản phẩm mới</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Footer simple */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-gray-600">
          © {new Date().getFullYear()} NôngSảnShop — Nông sản sạch, giao tận nơi.
        </div>
      </footer>
    </div>
  );
}
