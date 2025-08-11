import ProductCard from "@/components/product/ProductCard";
import { products } from "@/data/products";

export default function RecommendationProducts() {
    const featured = products.filter((p) => p.featured);
    return (
        <section className="max-w-6xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-semibold mb-4">Sản phẩm đề xuất</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {featured.slice(0, 4).map((p) => (
                    <ProductCard key={p.id} product={p} />
                ))}
            </div>
        </section>
    );
}