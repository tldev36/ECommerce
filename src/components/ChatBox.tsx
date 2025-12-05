"use client";
import { useState, useRef, useEffect } from "react";

export default function ChatBox() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll xuống cuối khi có tin nhắn mới
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    // 1. UI Optimistic update: Hiện tin nhắn user ngay lập tức
    const userMsg = message;
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setMessage("");
    setIsLoading(true); // Bật loading

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: data.reply ?? "Xin lỗi, tôi không nghe rõ." },
      ]);
    } catch (err) {
      console.error("❌ Chat Error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Đường truyền đang gián đoạn, bạn thử lại sau nhé!" },
      ]);
    } finally {
      setIsLoading(false); // Tắt loading dù thành công hay thất bại
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Khu vực hiển thị tin nhắn */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 text-sm mt-10">
            <p>👋 Chào bạn! Tôi là trợ lý ảo nông sản.</p>
            <p>Bạn cần tìm rau củ hay trái cây gì hôm nay?</p>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-blue-600 text-white rounded-br-none" // User: Xanh, bo góc lạ
                  : "bg-white text-gray-800 border border-gray-100 rounded-bl-none" // Bot: Trắng, viền nhẹ
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {/* Hiệu ứng đang gõ (Typing Indicator) */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Khu vực nhập liệu */}
      <div className="p-3 bg-white border-t border-gray-100">
        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 border focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-100 transition-all">
          <input
            className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Nhập câu hỏi của bạn..."
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !message.trim()}
            className={`p-2 rounded-full transition-all ${
              message.trim()
                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md transform hover:scale-105"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {/* SVG Icon Send */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}