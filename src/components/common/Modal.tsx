"use client";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  width?: string; // ví dụ: "max-w-2xl"
  children: React.ReactNode;
}

export default function Modal({ open, onClose, title, width, children }: ModalProps) {
  // 🧩 Khi modal mở -> khóa cuộn body chính
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Modal box */}
          <motion.div
            onClick={(e) => e.stopPropagation()} // không đóng khi bấm trong nội dung
            className={`
              bg-white rounded-2xl shadow-lg w-full mx-4 my-8
              sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-3xl
              max-h-[90vh] overflow-y-auto scrollbar-hide
              ${width || ""}
            `}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="flex justify-between items-center border-b p-4 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold">{title}</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition text-xl"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-4">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
