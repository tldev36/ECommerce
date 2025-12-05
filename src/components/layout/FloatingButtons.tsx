"use client";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp, faMessage, faComments } from "@fortawesome/free-solid-svg-icons";
import ChatWidget from "../ChatWidget";

export default function FloatingButtons() {
  const [showScroll, setShowScroll] = useState(false);
  const [showChat, setShowChat] = useState(false);

  // Hiện nút lên đầu khi scroll xuống
  useEffect(() => {
    const handleScroll = () => {
      setShowScroll(window.scrollY > 200);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* 1. Khung chat hiển thị */}
      {/* Truyền onClose để khi tắt ChatWidget thì nút Button lại hiện ra */}
      {showChat && <ChatWidget onClose={() => setShowChat(false)} />}

      {/* 2. Cụm nút nổi */}
      <div className="fixed bottom-6 right-6 flex flex-col items-end gap-4 z-40">
        
        {/* --- Nút Mở Chat (Xử lý ẩn hiện mượt mà) --- */}
        <div
            className={`transition-all duration-300 transform ${
                showChat 
                ? "opacity-0 translate-y-4 pointer-events-none scale-0" // Khi chat mở: Ẩn đi, không click được, thu nhỏ
                : "opacity-100 translate-y-0 scale-100" // Khi chat đóng: Hiện nguyên hình
            }`}
        >
            {/* Tooltip nhỏ (Optional) */}
            <div className="absolute right-14 top-2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap hidden md:block">
                Chat tư vấn
            </div>

            <button
            onClick={() => setShowChat(true)}
            className="group relative bg-gradient-to-r from-blue-600 to-blue-500 text-white p-4 rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center"
            >
            {/* Hiệu ứng Ping (Vòng tròn lan tỏa) để gây chú ý */}
            <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75 animate-ping duration-1000"></span>
            
            <FontAwesomeIcon icon={faComments} size="lg" className="w-6 h-6 relative z-10" />
            
            {/* Badge thông báo giả (Số 1 đỏ) - Tạo cảm giác có tin nhắn chờ
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white z-20">
                1
            </span> */}
            </button>
        </div>

        {/* --- Nút Lên đầu (Giữ nguyên hoặc ẩn khi chat mở tùy thích) --- */}
        {/* Ở đây tôi giữ nguyên để khách vẫn scroll được khi đang chat */}
        <button
            onClick={scrollToTop}
            className={`bg-gray-700/80 backdrop-blur-sm text-white p-3 rounded-full shadow-lg hover:bg-gray-900 transition-all duration-300 transform ${
                showScroll ? "opacity-100 scale-100" : "opacity-0 scale-0 pointer-events-none"
            }`}
            aria-label="Scroll to top"
        >
            <FontAwesomeIcon icon={faChevronUp} className="w-4 h-4" />
        </button>
      </div>
    </>
  );
}