// src/components/layout/Header.tsx
import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-green-700">NôngSảnShop</Link>
        <nav className="flex gap-4 items-center">
          <Link href="/products" className="text-sm text-gray-700">Sản phẩm</Link>
          <Link href="/about" className="text-sm text-gray-700">Về chúng tôi</Link>
          <Link href="/cart" className="text-sm text-gray-700">Giỏ hàng</Link>
        </nav>
      </div>
    </header>
  );
}
