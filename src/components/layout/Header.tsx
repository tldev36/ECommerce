"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShoppingCartIcon,
  UserCircleIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";

export default function Header() {
  const [openMenu, setOpenMenu] = useState<string>("");
  const [search, setSearch] = useState("");
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const router = useRouter();

  const navItems = [
    { name: "Trang chủ", href: "/" },
    {
      name: "Sản phẩm",
      href: "/",
      subMenu: [
        { name: "Phân bón", href: "/" },
        { name: "Hạt giống", href: "/" },
        { name: "Gạo", href: "/" },
      ],
    },
    { name: "Giới thiệu", href: "/" },
    { name: "Liên hệ", href: "/" },
  ];

  const navItemClass = (menu: string) =>
    `relative px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out cursor-pointer
     ${openMenu === menu
      ? "bg-gradient-to-r from-green-500 to-green-400 text-white shadow-lg scale-105"
      : "text-white hover:bg-gradient-to-r hover:from-green-600 hover:to-green-500 hover:text-white hover:shadow-md"
    }`;

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
        <nav className="flex space-x-2 relative">
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
                  <span className="font-medium text-base ">{item.name}</span>
                  {hasSubMenu && <ChevronDownIcon className="w-4 h-4 ml-1" strokeWidth={3}  />}
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
            className="w-full px-4 py-2 pl-10 rounded-md text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-700 placeholder-gray-400 transition duration-200"
          />
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-500 absolute left-3" />
        </div>

        {/* Icon giỏ hàng + avatar */}
        <div className="flex items-center space-x-4">
          <Link
            href="/cart"
            className="relative text-white hover:text-green-200 transition"
          >
            <ShoppingCartIcon className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-xs text-white rounded-full px-1">
              3
            </span>
          </Link>

          {/* Avatar + Dropdown */}
          <div className="relative">
            <button
              onClick={() => setOpenUserMenu(!openUserMenu)}
              className="text-white hover:text-green-200 transition"
            >
              <UserCircleIcon className="w-8 h-8" />
            </button>

            {openUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-50">
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-100"
                >
                  Thông tin cá nhân
                </Link>
                <Link
                  href="/login"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-100"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-100"
                >
                  Đăng ký
                </Link>
                <button
                  onClick={() => alert("Đăng xuất")}
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
