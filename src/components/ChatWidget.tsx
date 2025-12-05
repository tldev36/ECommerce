"use client";
import ChatBox from "@/components/ChatBox";

interface ChatWidgetProps {
  onClose: () => void;
}

export default function ChatWidget({ onClose }: ChatWidgetProps) {
  return (
    <div className="fixed bottom-24 right-6 w-[350px] h-[500px] bg-white border border-gray-200 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden animate-fade-in-up">
      {/* Header */}
      <div className="flex justify-between items-center bg-gradient-to-r from-blue-600 to-blue-500 text-white p-4">
        <div className="flex items-center gap-2">
          {/* Avatar bot giả lập */}
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            🤖
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">Trợ lý Nông Sản</span>
            <span className="text-[10px] flex items-center gap-1 opacity-90">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
              Đang hoạt động
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-1 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Chat content - flex-1 để chiếm hết chiều cao còn lại */}
      <div className="flex-1 overflow-hidden relative">
        <ChatBox />
      </div>
    </div>
  );
}