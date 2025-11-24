"use client";

import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faMagnifyingGlass, faCheck, faUserPlus, faChartLine, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

interface Notification {
    id: number;
    title: string;
    description: string;
    time: string;
    icon: any;
}

const notifications: Notification[] = [
    {
        id: 1,
        title: "Payment Received",
        description: "$2,499.00 payment received for Pro Plan subscription from Acme Corp",
        time: "2 min ago",
        icon: faCheck,
    },
    {
        id: 2,
        title: "New Team Member",
        description: "Sarah Johnson joined your workspace and was assigned to the Marketing team",
        time: "1 hour ago",
        icon: faUserPlus,
    },
    {
        id: 3,
        title: "Monthly Report Ready",
        description: "Your January 2025 analytics report is ready. Revenue up 24% vs last month",
        time: "3 hours ago",
        icon: faChartLine,
    },
    {
        id: 4,
        title: "System Update",
        description: "Your system has been updated to the latest version. Restart required.",
        time: "1 day ago",
        icon: faCheck,
    },
    {
        id: 5,
        title: "New Message",
        description: "You have received a new message from John Doe.",
        time: "2 days ago",
        icon: faEnvelope,
    },
    {
        id: 6,
        title: "Server Maintenance",
        description: "Scheduled maintenance will occur on January 15th from 2:00 AM to 4:00 AM.",
        time: "3 days ago",
        icon: faCheck,
    },

];

export default function Header() {
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [isAvatarOpen, setIsAvatarOpen] = useState(false);

    const notifRef = useRef<HTMLDivElement>(null);
    const avatarRef = useRef<HTMLDivElement>(null);

    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    // Click outside để đóng dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setIsNotifOpen(false);
            }
            if (avatarRef.current && !avatarRef.current.contains(event.target as Node)) {
                setIsAvatarOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const unreadCount = notifications.length;

    // Logout
    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        Cookies.remove("cart");
        // setCart([]);
        setUser(null);
        router.push("/auth/login");
    };

    return (
        <header className="flex items-center justify-between bg-white h-16 p-4 border-b border-gray-200">
            {/* Search */}
            <div className="flex items-center bg-gray-100 rounded-md px-3 py-1 flex-1 max-w-md">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="text-gray-500 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    className="ml-2 bg-transparent outline-none w-full text-gray-700 placeholder-gray-400"
                />
            </div>

            {/* Notification & Avatar */}
            <div className="flex items-center gap-4 ml-4">
                {/* Notification */}
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => setIsNotifOpen(!isNotifOpen)}
                        className="relative p-1 rounded hover:bg-gray-200"
                    >
                        <FontAwesomeIcon icon={faBell} size="lg" className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {isNotifOpen && (
                        <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 shadow-lg rounded-md z-50">
                            <div className="p-4">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-semibold text-gray-700">Thông báo</h3>
                                    <button className="text-blue-500 text-xs hover:underline">Đánh dấu tất cả đã đọc</button>
                                </div>

                                {/* Group: Today */}
                                <div className="mb-2 overflow-auto">
                                    <p className="text-xs font-semibold text-gray-400 mb-2 mt-2">HÔM NAY</p>
                                    <ul className="space-y-2 max-h-64 ">
                                        {notifications.map((notif) => (
                                            <li
                                                key={notif.id}
                                                className="flex items-start gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                                            >
                                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                                    <FontAwesomeIcon icon={notif.icon} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-700">{notif.title}</p>
                                                    <p className="text-xs text-gray-500">{notif.description}</p>
                                                </div>
                                                <span className="text-xs text-gray-400 flex-shrink-0">{notif.time}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Footer */}
                                <div className="pt-2 border-t border-gray-100">
                                    <button className="text-orange-500 text-sm hover:underline w-full text-left">
                                        Xóa tất cả thông báo
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Avatar */}
                <div className="relative" ref={avatarRef}>
                    <button
                        onClick={() => setIsAvatarOpen(!isAvatarOpen)}
                        className="w-8 h-8 rounded-full bg-gray-300"
                    />
                    {isAvatarOpen && (
                        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 shadow-lg rounded-md z-50">
                            <ul className="py-2 text-sm text-gray-700">
                                {/* <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                                    <Link href="/customer/home">Trang người dùng</Link>
                                </li>
                                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Hồ sơ</li> */}
                                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">

                                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-100">
                                        Đăng xuất
                                    </button>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
