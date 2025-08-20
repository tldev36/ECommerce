// src/app/layout.tsx
import './globals.css';
import { CartProvider } from "@/context/CartContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}