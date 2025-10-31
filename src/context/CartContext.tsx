"use client";
import { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { Product } from "@/types/product";
import { CartItem } from "@/types/cartItem";

interface CartContextType {
  cart: CartItem[];
  user: any | null;
  isLoggedIn: boolean;
  setCart: (items: CartItem[]) => void;
  addItem: (product: Product) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  setCartFromServer: (items: CartItem[]) => void;
}

interface MeResponse {
  user?: {
    id: number;
    name: string;
    email: string;
    // các trường khác của user
  };
}

const CartContext = createContext<CartContextType | undefined>(undefined);

axios.defaults.withCredentials = true;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<any | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);


  useEffect(() => {
    console.log("👤 User hiện tại:", user);
  }, [user]);
  // ----------------------------
  // Load user + cart khi mount
  // ----------------------------
  useEffect(() => {
    const fetchUserAndCart = async () => {
      try {
        // Lấy thông tin user từ server
        const userRes = await axios.get<MeResponse>("/api/auth/me", { withCredentials: true });
        if (userRes.data.user) {
          setUser(userRes.data.user);
          setIsLoggedIn(true);
        }

        // Lấy giỏ hàng từ server
        const cartRes = await axios.get<{ cart: CartItem[] }>("/api/cart", { withCredentials: true });
        if (cartRes.data?.cart) setCart(cartRes.data.cart);
      } catch {
        // fallback: chưa login → lấy cart từ cookie
        setIsLoggedIn(false);
        const storedCart = Cookies.get("cart");
        if (storedCart) setCart(JSON.parse(storedCart));
      }
    };

    fetchUserAndCart();
  }, []);

  // ----------------------------
  // Helper cookie
  // ----------------------------
  const saveCartToCookie = (items: CartItem[]) => {
    setCart(items);
    if (items.length > 0) {
      Cookies.set("cart", JSON.stringify(items), { expires: 7, sameSite: "lax" });
    } else {
      Cookies.remove("cart");
    }
  };

  // ----------------------------
  // Action
  // ----------------------------
  const addItem = async (product: Product) => {
    if (user) {
      // ✅ User đang login → gọi API lưu DB
      try {
        const res = await axios.post<{ cart: CartItem[] }>(
          "/api/cart/add",
          { productId: product.id, quantity: 1 },
          { withCredentials: true }
        );
        if (res.data?.cart) setCart(res.data.cart);
      } catch (err) {
        console.error("❌ Lỗi thêm sản phẩm khi login:", err);
        alert("Không thể thêm sản phẩm vào giỏ hàng!");
      }
    } else {
      // ✅ Chưa login → lưu tạm vào cookie
      const existing = cart.find((i) => i.product_id === product.id);
      if (existing) {
        saveCartToCookie(
          cart.map((i) =>
            i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i
          )
        );
      } else {
        saveCartToCookie([
          ...cart,
          {
            product_id: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            unit: product.unit,
            image: product.image,
            quantity: 1,
          },
        ]);
      }
      alert(`Đã thêm ${product.name} vào giỏ hàng tạm!`);
    }
  };



  const removeItem = async (productId: number) => {
    if (isLoggedIn) {
      await axios.delete(`/api/cart/delete/${productId}`);
      const res = await axios.get<{ cart: CartItem[] }>("/api/cart");
      if (res.data?.cart) setCart(res.data.cart);
    } else {
      saveCartToCookie(cart.filter((i) => i.product_id !== productId));
    }
  };

  // const updateQuantity = async (productId: number, quantity: number) => {
  //   if (quantity <= 0) {
  //     removeItem(productId);
  //     return;
  //   }

  //   if (isLoggedIn) {
  //     const res = await axios.put<{ cart: CartItem[] }>(`/api/cart/${productId}`, {
  //       quantity,
  //     });
  //     if (res.data?.cart) setCart(res.data.cart);
  //   } else {
  //     saveCartToCookie(
  //       cart.map((i) =>
  //         i.product_id === productId ? { ...i, quantity } : i
  //       )
  //     );
  //   }
  // };

  const updateQuantity = async (productId: number, quantity: number) => {
    try {
      if (quantity <= 0) {
        await removeItem(productId);
        return;
      }

      if (isLoggedIn) {
        // ✅ Gửi PUT tới API để cập nhật số lượng trong DB
        const res = await axios.put<{ cart: CartItem[] }>(
          `/api/cart/${productId}`,
          { quantity },
          { withCredentials: true }
        );
        console.log("🔍 PUT response:", res.data);

        // ✅ Cập nhật lại state giỏ hàng
        if (res.data?.cart) {
          setCart(res.data.cart);
        } else {
          console.warn("Không nhận được dữ liệu giỏ hàng từ server");
        }
      } else {
        // ✅ Cập nhật giỏ hàng trong cookie nếu chưa đăng nhập
        const newCart = cart.map((i) =>
          i.product_id === productId ? { ...i, quantity } : i
        );
        console.log("🧩 Updated local cart:", newCart);
        saveCartToCookie(newCart);
      }
    } catch (error: any) {
      console.error("❌ Lỗi cập nhật số lượng:", error);
      alert("Không thể cập nhật số lượng sản phẩm!");
    }
  };


  const clearCart = async () => {
    if (isLoggedIn) {
      await axios.delete("/api/cart/delete");
      setCart([]);
    } else {
      saveCartToCookie([]);
    }
  };

  const setCartFromServer = (items: CartItem[]) => {
    setCart(items);
    setIsLoggedIn(true);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        user,
        isLoggedIn,
        setCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        setCartFromServer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart phải được dùng trong <CartProvider>");
  return context;
}
