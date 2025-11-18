"use client";
import { useState } from "react";
import { Send, X } from "lucide-react";

interface ChatWidgetProps {
  onClose?: () => void;
}

export default function ChatWidget({ onClose }: ChatWidgetProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "bot"; text: string }[]>([]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg: { role: "user" | "bot"; text: string } = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input }),
    });

    const data = await res.json();

    const botMsg: { role: "user" | "bot"; text: string } = {
      role: "bot",
      text: data.reply || "Xin lỗi, tôi chưa có thông tin về sản phẩm này.",
    };

    setMessages((prev) => [...prev, botMsg]);
  };

  return (
    <div className="fixed bottom-20 right-4 w-80 bg-white rounded-2xl shadow-xl flex flex-col border z-[100]">
      {/* Header */}
      <div className="flex justify-between items-center bg-blue-600 text-white p-3 rounded-t-2xl font-semibold">
        <span>Chatbot 🌾</span>
        <button onClick={onClose} className="hover:text-gray-200">
          <X size={18} />
        </button>
      </div>

      {/* Nội dung chat */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2 max-h-96">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-2 rounded-lg text-sm ${
              m.role === "user"
                ? "bg-blue-100 text-right ml-10"
                : "bg-gray-100 text-left mr-10"
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>

      {/* Ô nhập chat */}
      <div className="flex border-t">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập câu hỏi..."
          className="flex-1 p-2 text-sm outline-none"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage} className="p-2 text-blue-600">
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
