"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Category } from "@/types/category";

export default function Categories() {
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            const res = await fetch("/api/categories");
            const data = await res.json();
            setCategories(data);
        };
        fetchCategories();
    }, []);
    return (
        <section className="max-w-6xl mx-auto px-4 py-10">
            <h2 className="text-2xl font-semibold mb-4">Danh mục</h2>
            <div className="flex gap-4 overflow-x-auto scroll-smooth snap-x scrollbar-hide">
                {categories
                    .filter((c) => c.status) // chỉ lấy category status = true
                    .map((c) => (
                        <a
                            key={c.id}
                            href={`/category/${c.slug}`}
                            className="relative min-w-[360px] rounded-md overflow-hidden group flex-shrink-0 snap-start"
                        >
                            <div className="relative w-full h-36">
                                <Image
                                    src={"/images/categories/" + c.image}
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