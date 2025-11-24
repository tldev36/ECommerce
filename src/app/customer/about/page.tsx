// app/about/page.tsx
"use client";

import Image from "next/image";

export default function AboutPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-10 mt-20">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Về Chúng Tôi</h1>
        <p className="text-gray-600 text-lg">
          Chúng tôi mang đến những sản phẩm nông sản chất lượng cao, 
          an toàn và tốt cho sức khỏe người tiêu dùng Việt Nam.
        </p>
      </section>

      <div className="grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="text-2xl font-semibold mb-3">Sứ Mệnh</h2>
          <p className="text-gray-700 leading-relaxed">
            Kết nối nông dân và khách hàng bằng nền tảng thương mại điện tử hiện đại, 
            giúp tối ưu chất lượng – minh bạch nguồn gốc – và nâng cao giá trị nông sản Việt.
          </p>
        </div>

        <Image
          src="/images/about-mission.jpg"
          width={500}
          height={350}
          alt="Sứ mệnh"
          className="rounded-xl object-cover"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-10 items-center mt-14">
        <Image
          src="/images/about-vision.jpg"
          width={500}
          height={350}
          alt="Tầm nhìn"
          className="rounded-xl object-cover"
        />

        <div>
          <h2 className="text-2xl font-semibold mb-3">Tầm Nhìn</h2>
          <p className="text-gray-700 leading-relaxed">
            Trở thành nền tảng thương mại nông sản thông minh hàng đầu Việt Nam, 
            áp dụng công nghệ gợi ý mua sắm theo xu hướng người dùng, 
            mang lại trải nghiệm mua hàng cá nhân hóa tối ưu.
          </p>
        </div>
      </div>

      <section className="mt-16 text-center">
        <h3 className="text-xl font-semibold mb-3">Liên Hệ</h3>
        <p className="text-gray-700">
          Email: <a href="mailto:contact@nongsan.vn" className="text-green-600 underline">contact@nongsan.vn</a>
        </p>
        <p className="text-gray-700">Hotline: 0123 456 789</p>
      </section>
    </main>
  );
}
