"use client";
import { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
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
  setCartFromServer: (items: CartItem[]) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  // ✅ Lấy giỏ hàng từ server nếu có token, nếu không thì lấy từ cookie
  useEffect(() => {
    const token = Cookies.get("token");

    if (token) {
      axios.get("/api/cart", { headers: { Authorization: `Bearer ${token}` } })
        .then((res: any) => {
          if (res.data?.cart) {
            setCart(res.data.cart);
            Cookies.set("cart", JSON.stringify(res.data.cart), { expires: 7 });
          }
        });
    } else {
      const storedCart = Cookies.get("cart");
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
    }
  }, [Cookies.get("token")]);

  // ✅ Đồng bộ giỏ hàng vào cookie mỗi khi thay đổi
  useEffect(() => {
    if (cart.length > 0) {
      Cookies.set("cart", JSON.stringify(cart), { expires: 7 });
    } else {
      Cookies.remove("cart");
    }
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
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setCart([]);

  const setCartFromServer = (items: CartItem[]) => {
    setCart(items);
    Cookies.set("cart", JSON.stringify(items), { expires: 7 });
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        removeItem,
        updateQuantity,
        setCartFromServer,
        clearCart,
      }}
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