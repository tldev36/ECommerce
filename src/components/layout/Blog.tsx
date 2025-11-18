import Image from "next/image";


export default function Blog() {

    return (
        <section className="max-w-7xl mx-auto px-4 py-10 space-y-6">
            <h2 className="text-2xl font-semibold mb-6">Blog & Mẹo</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="bg-white rounded-lg shadow hover:shadow-lg overflow-hidden"
                    >
                        <Image
                            src="/images/blog1.jpg"
                            alt="Blog 1"
                            width={400} // hoặc kích thước thật của ảnh
                            height={160}
                            className="h-40 w-full object-cover"
                        />
                        <div className="p-4">
                            <h3 className="font-semibold text-lg mb-2">
                                Mẹo bảo quản rau củ tươi lâu
                            </h3>
                            <p className="text-gray-600 text-sm mb-4">
                                Giúp rau củ của bạn luôn tươi ngon mà không cần dùng chất bảo
                                quản...
                            </p>
                            <a href="/blog" className="text-green-600 font-medium">
                                Đọc tiếp →
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}