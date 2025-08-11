import ProductCard from "@/components/product/ProductCard";
import { products } from "@/data/products";
import Link from "next/link";


export default function NewProducts() {
    
    return (
        <section className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold mb-4">Sản phẩm mới</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {products.slice(0, 8).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        {products.length > 8 && (
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="inline-block px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
            >
              Xem tất cả
            </Link>
          </div>
        )}
      </section>
    );
}