// src/app/(public)/page.tsx
import Image from "next/image";
import ProductCard from "@/components/product/ProductCard";
import Header from "@/components/layout/Header";
import Link from "next/link";
import Slider from "@/components/layout/Slider";
import "@/lib/fontawesome";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebookF,
  faInstagram,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import {
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";
import { products } from "@/data/products";
import { categories } from "@/data/categories";

export default function PublicHome() {
  const featured = products.filter((p) => p.featured);
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Slider */}
      <Slider />

      {/* Hero section */}
      {/* Categories */}
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

      {/* Featured */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold mb-4">Sản phẩm đề xuất</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {featured.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Latest */}
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

      {/* Ưu đãi đặc biệt */}
      <section className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-[url('/images/hero.jpg')] bg-cover bg-center rounded-lg overflow-hidden relative h-52">
          <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-white">
            <h3 className="text-xl font-semibold">Giảm giá 20% Trái cây</h3>
            <a
              href="/products"
              className="mt-3 bg-green-600 px-4 py-2 rounded hover:bg-green-700"
            >
              Xem ngay
            </a>
          </div>
        </div>
        <div className="bg-[url('/images/hero.jpg')] bg-cover bg-center rounded-lg overflow-hidden relative h-52">
          <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-white">
            <h3 className="text-xl font-semibold">Ưu đãi rau củ hữu cơ</h3>
            <a
              href="/products"
              className="mt-3 bg-green-600 px-4 py-2 rounded hover:bg-green-700"
            >
              Xem ngay
            </a>
          </div>
        </div>
      </section>

      {/* Blog */}
      <section className="max-w-6xl mx-auto px-4 py-12">
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

      {/* Review */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-semibold mb-6">Khách hàng nói gì?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <p className="text-gray-700 italic">
                  “Sản phẩm rất tươi và ngon, giao hàng nhanh chóng. Mình sẽ
                  tiếp tục ủng hộ.”
                </p>
                <div className="mt-4 flex items-center">
                  <Image
                    src={`/images/user${i}.jpg`}
                    alt=""
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <p className="font-semibold">Nguyễn Văn A</p>
                    <p className="text-sm text-gray-500">Khách hàng</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-green-600 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-semibold mb-4">Đăng ký nhận tin</h2>
          <p className="mb-6 text-white/90">
            Nhận thông tin ưu đãi và sản phẩm mới nhất qua email.
          </p>
          <form className="flex flex-col sm:flex-row justify-center gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Nhập email của bạn"
              className="px-4 py-2 rounded text-gray-800 w-full bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              type="submit"
              className="bg-black px-4 w-50 py-2 rounded hover:bg-gray-800"
            >
              Đăng ký
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-10">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold text-lg mb-3 text-white">
              Về chúng tôi
            </h3>
            <p>Chuyên cung cấp nông sản sạch, an toàn, giao hàng tận nơi.</p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-3 text-white">Liên hệ</h3>
            <ul className="space-y-2 text-white">
              <li className="flex items-center gap-2">
                <FontAwesomeIcon icon={faPhone} /> 0123 456 789
              </li>
              <li className="flex items-center gap-2">
                <FontAwesomeIcon icon={faEnvelope} /> contact@nongsan.vn
              </li>
              <li className="flex items-center gap-2">
                <FontAwesomeIcon icon={faMapMarkerAlt} /> Hà Nội, Việt Nam
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-3 text-white">Liên kết</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:underline">
                  Trang chủ
                </Link>
              </li>
              <li>
                <a href="/products" className="hover:underline">
                  Sản phẩm
                </a>
              </li>
              <li>
                <a href="/blog" className="hover:underline">
                  Blog
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-3 text-white">
              Mạng xã hội
            </h3>
            <div className="flex space-x-4 text-white">
              <a href="#" className="hover:text-blue-500">
                <FontAwesomeIcon icon={faFacebookF} size="lg" />
              </a>
              <a href="#" className="hover:text-pink-500">
                <FontAwesomeIcon icon={faInstagram} size="lg" />
              </a>
              <a href="#" className="hover:text-red-500">
                <FontAwesomeIcon icon={faYoutube} size="lg" />
              </a>
            </div>
          </div>
        </div>
        <div className="text-center mt-8 text-sm text-gray-500">
          © {new Date().getFullYear()} Nông Sản Sạch. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
