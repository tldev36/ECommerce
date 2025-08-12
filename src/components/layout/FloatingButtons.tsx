"use client";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp, faMessage } from "@fortawesome/free-solid-svg-icons";

export default function FloatingButtons() {
  const [showScroll, setShowScroll] = useState(false);

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
    <div className="fixed bottom-6 right-6 flex flex-col items-center gap-3 z-50">
      {/* Nút Messenger */}
      <a
        href="https://m.me/yourpageid" // Thay bằng link Messenger của bạn
        target="_blank"
        rel="noopener noreferrer"
        className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition"
      >
        <FontAwesomeIcon icon={faMessage} size="lg" className="w-5 h-5"/>
      </a>

      {/* Nút Lên đầu */}
      {showScroll && (
        <button
          onClick={scrollToTop}
          className="bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition"
        >
          <FontAwesomeIcon icon={faChevronUp} size="lg" className="w-4 h-4"/>
        </button>
      )}
    </div>
  );
}
