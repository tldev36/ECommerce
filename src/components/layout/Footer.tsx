"use client";

import Link from "next/link";
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

export default function Footer() {
    return (
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
    );
}