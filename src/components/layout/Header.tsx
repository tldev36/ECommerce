"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ShoppingCartIcon,
  UserCircleIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

export default function Header() {
  const [openMenu, setOpenMenu] = useState<string>("");
  const [search, setSearch] = useState("");

  const navItems = [
    { name: "Trang chủ", href: "/" },
    {
      name: "Sản phẩm",
      href: "/",
      subMenu: [
        { name: "Điện thoại", href: "/products/phones" },
        { name: "Laptop", href: "/products/laptops" },
        { name: "Phụ kiện", href: "/products/accessories" },
      ],
    },
    { name: "Giới thiệu", href: "/" },
    { name: "Liên hệ", href: "/" },
  ];

  const navItemClass = (menu: string) =>
    `relative px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out cursor-pointer
     ${
       openMenu === menu
         ? "bg-gradient-to-r from-green-500 to-green-400 text-white shadow-lg scale-105"
         : "text-white hover:bg-gradient-to-r hover:from-green-600 hover:to-green-500 hover:text-white hover:shadow-md"
     }`;

  const handleMenuClick = (itemName: string, hasSubMenu?: boolean) => {
    if (hasSubMenu) {
      setOpenMenu(openMenu === itemName ? "" : itemName);
    } else {
      setOpenMenu(itemName);
    }
  };

  return (
    <header className="bg-green-700 shadow-md">
      <div className="container mx-auto flex items-center justify-between px-6 py-3 gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="text-white font-bold text-lg whitespace-nowrap"
        >
          MyShop
        </Link>

        {/* Menu */}
        <nav className="flex space-x-2 relative">
          {navItems.map((item) => {
            const hasSubMenu = !!item.subMenu;
            const isOpen = openMenu === item.name;

            return (
              <div key={item.name} className={navItemClass(item.name)}>
                <div className="flex items-center justify-between">
                  {hasSubMenu ? (
                    // Nếu có submenu → toggle mở/đóng
                    <button
                      type="button"
                      onClick={() => setOpenMenu(isOpen ? "" : item.name)}
                      className="flex items-center gap-1 focus:outline-none"
                    >
                      {item.name}
                      <ChevronDownIcon className="w-4 h-4 ml-1" />
                    </button>
                  ) : (
                    // Nếu không có submenu → chỉ điều hướng
                    <Link href={item.href}>{item.name}</Link>
                  )}
                </div>

                {/* Menu cấp 2 */}
                {hasSubMenu && isOpen && (
                  <div className="absolute top-full left-0 mt-2 bg-white rounded-md shadow-lg py-2 w-48 z-50 animate-fadeIn">
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

          <Link
            href="/profile"
            className="text-white hover:text-green-200 transition"
          >
            <UserCircleIcon className="w-8 h-8" />
          </Link>
        </div>
      </div>
    </header>
  );
}
