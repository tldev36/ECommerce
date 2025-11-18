"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation"; // 👈 thêm usePathname
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTachometerAlt,
  faBoxOpen,
  faShoppingBag,
  faUsers,
  faCog,
  faBars,
  faBox,
  faTicket,
  faChartArea
} from "@fortawesome/free-solid-svg-icons";

const MENU_ITEMS = [
  { name: "Bảng điều khiển", icon: faTachometerAlt, path: "/admin/dashboard" },
  { name: "Sản phẩm", icon: faBoxOpen, path: "/admin/products" },
  { name: "Loại sản phẩm", icon: faShoppingBag, path: "/admin/categories" },
  // { name: "Người dùng", icon: faUsers, path: "/admin/users" },
  { name: "Đơn hàng", icon: faBox, path: "/admin/orders" },
  { name: "Giảm giá", icon: faTicket, path: "/admin/coupons" },
  // { name: "Thống kê", icon: faCog, path: "/admin/statistics" },
  { name: "Thống kê", icon: faChartArea, path: "/admin/demochart" },

];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname(); // 👈 lấy URL hiện tại

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <aside
      className={`flex flex-col bg-white transition-all duration-300 border-r border-gray-200
        ${isOpen ? "w-64" : "w-16"}
      `}
    >
      {/* Toggle Button */}
      <div
        className={`flex items-center p-4 transition-all duration-300 h-16 border-b border-gray-200 ${isOpen ? "justify-between" : "justify-center"
          }`}
      >
        {isOpen && <span className="text-lg font-bold">Admin</span>}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded hover:bg-gray-200"
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 mt-4 relative">
        {isOpen && (
          <h2 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Menu
          </h2>
        )}
        <div className="flex flex-col relative">
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.path; // 👈 kiểm tra URL
            return (
              <button
                key={item.name}
                onClick={() => handleNavigate(item.path)}
                title={!isOpen ? item.name : ""}
                className={`relative flex items-center gap-4 w-full px-4 py-3 my-1 rounded-lg transition
                  ${isActive
                    ? "bg-blue-100 text-blue-600 font-medium"
                    : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  }
                  ${isOpen ? "justify-start" : "justify-center"}
                `}
              >
                {isActive && (
                  <span className="absolute left-0 top-0 h-full w-1 bg-blue-600 rounded-tr-lg rounded-br-lg"></span>
                )}
                <FontAwesomeIcon icon={item.icon} className="w-5 h-5" />
                {isOpen && <span>{item.name}</span>}
              </button>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
