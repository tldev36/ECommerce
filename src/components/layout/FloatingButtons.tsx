"use client";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp, faMessage } from "@fortawesome/free-solid-svg-icons";
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
      {/* Khung chat hiển thị nếu bật */}
      {showChat && <ChatWidget onClose={() => setShowChat(false)} />}

      {/* Cụm nút nổi */}
      <div className="fixed bottom-6 right-6 flex flex-col items-center gap-3 z-50">
        {/* Nút mở Chat */}
        <button
          onClick={() => setShowChat(!showChat)}
          className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition"
        >
          <FontAwesomeIcon icon={faMessage} size="lg" className="w-5 h-5" />
        </button>

        {/* Nút Lên đầu */}
        {showScroll && (
          <button
            onClick={scrollToTop}
            className="bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition"
          >
            <FontAwesomeIcon icon={faChevronUp} size="lg" className="w-4 h-4" />
          </button>
        )}
      </div>
    </>
  );
}
