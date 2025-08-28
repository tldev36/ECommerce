"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShoppingCartIcon,
  UserCircleIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { Category } from "@/types/category";
import axios from "axios";
import { useCart } from "@/context/CartContext";
import Cookies from "js-cookie";


export default function Header() {
  const [openMenu, setOpenMenu] = useState<string>("");
  const [search, setSearch] = useState("");
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);


  const router = useRouter();

  const { cart, clearCart } = useCart();
  const totalItems = cart.length;

  // Ref cho menu chính và menu user
  const navRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fetch categories từ API
  useEffect(() => {
    const fetchCategories = async () => {
      const res = await axios.get<Category[]>("/api/categories");
      setCategories(res.data);
    };
    fetchCategories();
  }, []);

  const navItems = [
    { name: "Trang chủ", href: "/customer/home" },
    {
      name: "Sản phẩm",
      href: "/customer/list-product",
      subMenu: categories.map((c) => ({
        name: c.name,
        href: `/customer/list-product/${c.slug}`,
      })),
    },
    { name: "Giới thiệu", href: "/customer/about" },
    { name: "Liên hệ", href: "/customer/contact" },
  ];

  const navItemClass = (menu: string) =>
    `relative px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out cursor-pointer
     ${openMenu === menu
      ? "bg-gradient-to-r from-green-500 to-green-400 text-white shadow-lg scale-105"
      : "text-white hover:bg-gradient-to-r hover:from-green-600 hover:to-green-500 hover:text-white hover:shadow-md"
    }`;

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenMenu("");
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setOpenUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    router.push(`/customer/list-product?${params.toString()}`);
  };


  // logout
  const handleLogout = async () => {
  await fetch("/api/auth/logout", { method: "POST" });
  localStorage.removeItem("user");
  Cookies.remove("cart");
  clearCart(); // ✅ xóa cart trong context
  router.push("/auth/login");
};



  return (
    <header className="bg-green-700 shadow-md fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto flex items-center justify-between px-6 py-3 gap-4 ">
        {/* Logo */}
        <Link
          href="/"
          className="text-white font-bold text-lg whitespace-nowrap"
        >
          <Image src="/images/logo/logo-FF.png" alt="MyShop" width={100} height={40} />
        </Link>

        {/* Menu */}
        <nav ref={navRef} className="flex space-x-2 relative">
          {navItems.map((item) => {
            const hasSubMenu = !!item.subMenu;
            const isOpen = openMenu === item.name;

            return (
              <div
                key={item.name}
                className={`${navItemClass(item.name)} ${isOpen ? "rounded-b-none" : ""}`}
                onClick={() =>
                  hasSubMenu
                    ? setOpenMenu(isOpen ? "" : item.name)
                    : router.push(item.href)
                }
              >
                <div className="flex items-center justify-between cursor-pointer w-full">
                  <span className="font-medium text-base">{item.name}</span>
                  {hasSubMenu && <ChevronDownIcon className="w-4 h-4 ml-1" strokeWidth={3} />}
                </div>

                {/* Menu cấp 2 */}
                {hasSubMenu && isOpen && (
                  <div className="absolute top-full left-0 mt-0 bg-white rounded-md rounded-tl-none shadow-lg py-2 w-48 z-50 animate-fadeIn">
                    {item.subMenu.map((sub) => (
                      <Link
                        key={sub.name}
                        href={sub.href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-100 hover:text-green-700"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Thanh tìm kiếm */}
        <div className="flex items-center flex-1 max-w-md relative">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()} // nhấn Enter để search
            className="w-full px-4 py-2 pl-10 rounded-md text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-700 placeholder-gray-400 transition duration-200"
          />
          <MagnifyingGlassIcon
            className="w-5 h-5 text-gray-500 absolute left-3 cursor-pointer"
            onClick={handleSearch}
          />
        </div>

        {/* Icon giỏ hàng + avatar */}
        <div className="flex items-center space-x-4">
          <Link
            href="/customer/cart"
            className="relative text-white hover:text-green-200 transition"
          >
            <ShoppingCartIcon className="w-6 h-6" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-xs text-white rounded-full px-1 min-w-[18px] text-center">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Avatar + Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setOpenUserMenu(!openUserMenu)}
              className="text-white hover:text-green-200 transition"
            >
              <UserCircleIcon className="w-8 h-8" />
            </button>

            {openUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-50">
                <Link
                  href="/admin"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-100"
                >
                  Admin
                </Link>
                <Link
                  href="/customer/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-100"
                >
                  Thông tin cá nhân
                </Link>
                <Link
                  href="/customer/order-history"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-100"
                >
                  Lịch sử mua hàng
                </Link>
                <Link
                  href="/customer/wishlist"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-100"
                >
                  Danh sách yêu thích
                </Link>
                <Link
                  href="/auth/login"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-100"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/auth/register"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-100"
                >
                  Đăng ký
                </Link>
                <button

                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-100"
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
