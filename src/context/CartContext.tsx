"use client";
import { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Product } from "@/types/product";

export interface CartItem {
  id: number;
  name: string;
  slug: string;
  price: number;
  unit: string;
  image: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Lấy giỏ hàng từ cookie khi load lần đầu
  useEffect(() => {
    const storedCart = Cookies.get("cart");
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  // Lưu giỏ hàng vào cookie khi thay đổi
  useEffect(() => {
    Cookies.set("cart", JSON.stringify(cart), { expires: 7 });
  }, [cart]);

  const addItem = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          unit: product.unit,
          image: product.image,
          quantity: 1,
        },
      ];
    });
  };

  const removeItem = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{ cart, addItem, removeItem, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ✅ Hook để dùng trong component
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart phải được sử dụng trong <CartProvider>");
  }
  return context;
}
