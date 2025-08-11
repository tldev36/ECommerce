import { categories } from "@/data/categories";
import Image from "next/image";

export default function Categories() {
    return (
        <section className="max-w-6xl mx-auto px-4 py-10">
            <h2 className="text-2xl font-semibold mb-4">Danh mục</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {categories.map((c) => (
                    <a
                        key={c.id}
                        href={c.href}
                        className="relative rounded-md overflow-hidden group"
                    >
                        <div className="relative w-full h-36">
                            <Image
                                src={c.image}
                                alt={c.name}
                                fill
                                style={{ objectFit: "cover" }}
                            />
                        </div>
                        <div className="absolute inset-0 bg-black/25 flex items-end p-3">
                            <div className="text-white font-semibold">{c.name}</div>
                        </div>
                    </a>
                ))}
            </div>
        </section>
    );
}