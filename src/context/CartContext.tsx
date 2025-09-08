"use client";
import { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { Product } from "@/types/product";

export interface CartItem {
  id?: number;
  product_id: number;
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

// ✅ axios gửi cookie tự động
axios.defaults.withCredentials = true;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Lấy giỏ hàng từ server nếu login, nếu không lấy từ cookie
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await axios.get<{ cart: CartItem[] }>("/api/cart");
        if (res.data?.cart) {
          setCart(res.data.cart);
        } else {
          const storedCart = Cookies.get("cart");
          if (storedCart) setCart(JSON.parse(storedCart));
        }
      } catch (err) {
        // chưa login → lấy từ cookie
        const storedCart = Cookies.get("cart");
        if (storedCart) setCart(JSON.parse(storedCart));
      }
    };
    fetchCart();
  }, []);

  // Lưu giỏ hàng vào cookie nếu chưa login
  useEffect(() => {
    const storeCart = async () => {
      try {
        await axios.get("/api/cart");
        // nếu login → server lưu rồi, không cần cookie
      } catch {
        if (cart.length > 0) {
          Cookies.set("cart", JSON.stringify(cart), { expires: 7 });
        } else {
          Cookies.remove("cart");
        }
      }
    };
    storeCart();
  }, [cart]);

  // Thêm sản phẩm
  const addItem = async (product: Product) => {
    try {
      const res = await axios.post<{ cart: CartItem[] }>("/api/cart", { productId: product.id, quantity: 1 });
      if (res.data?.cart) setCart(res.data.cart);
    } catch {
      // chưa login → lưu cookie
      setCart((prev) => {
        const existing = prev.find((i) => i.product_id === product.id);
        if (existing) return prev.map((i) => i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
        return [...prev, { product_id: product.id, name: product.name, slug: product.slug, price: product.price, unit: product.unit, image: product.image, quantity: 1 }];
      });
    }
  };

  // ❌ Xóa sản phẩm
  // Xóa sản phẩm
const removeItem = async (productId: number) => {
  // 1️⃣ Cập nhật state ngay lập tức (optimistic update)
  setCart((prev) => {
    const newCart = prev.filter((i) => i.product_id !== productId);
    if (newCart.length > 0) {
      Cookies.set("cart", JSON.stringify(newCart), { expires: 7 });
    } else {
      Cookies.remove("cart");
    }
    return newCart;
  });

  try {
    // 2️⃣ Thử xóa trên server
    await axios.delete(`/api/cart/${productId}`);

    // 3️⃣ Lấy lại giỏ hàng mới nhất từ server để đảm bảo đồng bộ
    const res = await axios.get<{ cart: CartItem[] }>("/api/cart");
    if (res.data?.cart) {
      setCart(res.data.cart);
      if (res.data.cart.length > 0) {
        Cookies.set("cart", JSON.stringify(res.data.cart), { expires: 7 });
      } else {
        Cookies.remove("cart");
      }
    }
  } catch {
    // Nếu chưa login hoặc server lỗi → đã update state phía client rồi, không cần làm gì thêm
    console.warn("Xóa item thất bại trên server, nhưng client vẫn cập nhật.");
  }
};




  // Cập nhật số lượng
  const updateQuantity = async (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    try {
      const res = await axios.put<{ cart: CartItem[] }>(`/api/cart/${productId}`, { quantity });
      if (res.data?.cart) setCart(res.data.cart);
    } catch {
      // chưa login → cập nhật trong cookie
      setCart((prev) => prev.map((i) => i.product_id === productId ? { ...i, quantity } : i));
    }
  };

  // Xóa toàn bộ giỏ hàng
  const clearCart = async () => {
    try {
      await axios.delete("/api/cart");
      setCart([]);
    } catch {
      setCart([]);
      Cookies.remove("cart");
    }
  };

  const setCartFromServer = (items: CartItem[]) => {
    setCart(items);
    // chưa login → lưu cookie
    const storedCart = Cookies.get("cart");
    if (!storedCart) Cookies.set("cart", JSON.stringify(items), { expires: 7 });
  };

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, updateQuantity, setCartFromServer, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart phải được sử dụng trong <CartProvider>");
  return context;
}
