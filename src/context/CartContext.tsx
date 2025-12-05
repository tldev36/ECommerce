// "use client";
// import { createContext, useContext, useEffect, useState } from "react";
// import Cookies from "js-cookie";
// import axios from "axios";
// import { Product } from "@/types/product";
// import { CartItem } from "@/types/cartItem";


// interface CartContextType {
//   cart: CartItem[];
//   user: any | null;
//   isLoggedIn: boolean;
//   loadingUser: boolean;
//   setCart: (items: CartItem[]) => void;
//   addItem: (product: Product) => void;
//   removeItem: (id: number) => void;
//   updateQuantity: (id: number, quantity: number) => void;
//   clearCart: () => void;
//   setCartFromServer: (items: CartItem[]) => void;

//   fetchUser: () => Promise<void>;
//   fetchCart: () => Promise<void>;
// }

// interface MeResponse {
//   user?: {
//     id: number;
//     name: string;
//     email: string;
//     // các trường khác của user
//   };
// }

// const CartContext = createContext<CartContextType | undefined>(undefined);

// axios.defaults.withCredentials = true;

// export function CartProvider({ children }: { children: React.ReactNode }) {
//   const [cart, setCart] = useState<CartItem[]>([]);
//   const [user, setUser] = useState<any | null>(null);
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [loadingUser, setLoadingUser] = useState(true);



//   // 🧩 Gán user tạm từ token (client-side decode)
//   // useEffect(() => {
//   //   const fetchUser = async () => {
//   //     try {
//   //       // 🧩 Gọi API lấy user
//   //       const userRes = await axios.get<MeResponse>("/api/auth/me", {
//   //         withCredentials: true,
//   //       });

//   //       if (userRes.data?.user) {
//   //         setUser(userRes.data.user);
//   //         setIsLoggedIn(true);
//   //       } else {
//   //         setUser(null);
//   //         setIsLoggedIn(false);
//   //       }
//   //     } catch (err) {
//   //       console.warn("❌ Lỗi lấy user:", err);
//   //       setUser(null);
//   //       setIsLoggedIn(false);
//   //     }
//   //   };

//   //   fetchUser(); // ⬅️ gọi ngay
//   // }, []);

//   // ----------------------------
//   // Load user + cart khi mount
//   // ----------------------------
//   // useEffect(() => {
//   //   const fetchUser = async () => {
//   //     try {
//   //       const res = await axios.get<MeResponse>("/api/auth/me", { withCredentials: true });
//   //       if (res.data.user) {
//   //         setUser(res.data.user);
//   //         setIsLoggedIn(true);
//   //       } else {
//   //         setIsLoggedIn(false);
//   //         setUser(null);
//   //       }
//   //     } catch {
//   //       setIsLoggedIn(false);
//   //       setUser(null);
//   //     } finally {
//   //       setLoadingUser(false);
//   //     }
//   //   };

//   //   const fetchCart = async () => {
//   //     try {
//   //       const res = await axios.get<{ cart: CartItem[] }>("/api/cart", { withCredentials: true });
//   //       if (res.data?.cart) {
//   //         setCart(res.data.cart);
//   //       } else {
//   //         // fallback lấy cart từ cookie
//   //         const storedCart = Cookies.get("cart");
//   //         if (storedCart) setCart(JSON.parse(storedCart));
//   //       }
//   //     } catch {
//   //       const storedCart = Cookies.get("cart");
//   //       if (storedCart) setCart(JSON.parse(storedCart));
//   //     }
//   //   };

//   //   // ✅ Gọi cả hai song song
//   //   const fetchUserAndCart = async () => {
//   //     await Promise.all([fetchUser(), fetchCart()]);
//   //   };

//   //   fetchUserAndCart();
//   // }, []);


//   // useEffect(() => {
//   //   const init = async () => {
//   //     try {
//   //       const [userRes, cartRes] = await Promise.all([
//   //         axios.get<MeResponse>("/api/auth/me", { withCredentials: true }),
//   //         axios.get<{ cart: CartItem[] }>("/api/cart", { withCredentials: true }),
//   //       ]);

//   //       if (userRes.data.user) {
//   //         setUser(userRes.data.user);
//   //         setIsLoggedIn(true);
//   //       } else {
//   //         setIsLoggedIn(false);
//   //       }

//   //       if (cartRes.data?.cart) {
//   //         setCart(cartRes.data.cart);
//   //       } else {
//   //         const storedCart = Cookies.get("cart");
//   //         if (storedCart) setCart(JSON.parse(storedCart));
//   //       }
//   //     } catch (err) {
//   //       console.warn("❌ Lỗi init:", err);
//   //     } finally {
//   //       setLoadingUser(false);
//   //     }
//   //   };

//   //   init();
//   // }, []);


//   // 🧩 Hàm fetchUser
//   const fetchUser = async () => {
//     try {
//       const res = await axios.get<MeResponse>("/api/auth/me", { withCredentials: true });
//       if (res.data.user) {
//         setUser(res.data.user);
//         setIsLoggedIn(true);
//       } else {
//         setIsLoggedIn(false);
//         setUser(null);
//       }
//     } catch {
//       setIsLoggedIn(false);
//       setUser(null);
//     } finally {
//       setLoadingUser(false);
//     }
//   };

//   // 🧩 Hàm fetchCart
//   const fetchCart = async () => {
//     try {
//       const res = await axios.get<{ cart: CartItem[] }>("/api/cart", { withCredentials: true });
//       if (res.data?.cart) {
//         setCart(res.data.cart);
//       } else {
//         const storedCart = Cookies.get("cart");
//         if (storedCart) setCart(JSON.parse(storedCart));
//       }
//     } catch {
//       const storedCart = Cookies.get("cart");
//       if (storedCart) setCart(JSON.parse(storedCart));
//     }
//   };

//   // ----------------------------
//   // Helper cookie
//   // ----------------------------
//   const saveCartToCookie = (items: CartItem[]) => {
//     setCart(items);
//     if (items.length > 0) {
//       Cookies.set("cart", JSON.stringify(items), { expires: 7, sameSite: "lax" });
//     } else {
//       Cookies.remove("cart");
//     }
//   };

//   // ----------------------------
//   // Action
//   // ----------------------------
//   const addItem = async (product: Product) => {
//     if (user) {
//       // ✅ User đang login → gọi API lưu DB
//       try {
//         const res = await axios.post<{ cart: CartItem[] }>(
//           "/api/cart/add",
//           { productId: product.id, quantity: 1 },
//           { withCredentials: true }
//         );
//         if (res.data?.cart) setCart(res.data.cart);
//       } catch (err) {
//         console.error("❌ Lỗi thêm sản phẩm khi login:", err);
//         alert("Không thể thêm sản phẩm vào giỏ hàng!");
//       }
//     } else {
//       // ✅ Chưa login → lưu tạm vào cookie
//       const existing = cart.find((i) => i.product_id === product.id);
//       if (existing) {
//         saveCartToCookie(
//           cart.map((i) =>
//             i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i
//           )
//         );
//       } else {
//         saveCartToCookie([
//           ...cart,
//           {
//             product_id: product.id,
//             name: product.name,
//             slug: product.slug,
//             price: product.price || 0,
//             unit: product.unit || "0gram",
//             image: product.image || "",
//             quantity: 1,
//           },
//         ]);
//       }
//       alert(`Đã thêm ${product.name} vào giỏ hàng tạm!`);
//     }
//   };



//   const removeItem = async (productId: number) => {
//     if (isLoggedIn) {
//       await axios.delete(`/api/cart/delete/${productId}`);
//       const res = await axios.get<{ cart: CartItem[] }>("/api/cart");
//       if (res.data?.cart) setCart(res.data.cart);
//     } else {
//       saveCartToCookie(cart.filter((i) => i.product_id !== productId));
//     }
//   };

//   // const updateQuantity = async (productId: number, quantity: number) => {
//   //   if (quantity <= 0) {
//   //     removeItem(productId);
//   //     return;
//   //   }

//   //   if (isLoggedIn) {
//   //     const res = await axios.put<{ cart: CartItem[] }>(`/api/cart/${productId}`, {
//   //       quantity,
//   //     });
//   //     if (res.data?.cart) setCart(res.data.cart);
//   //   } else {
//   //     saveCartToCookie(
//   //       cart.map((i) =>
//   //         i.product_id === productId ? { ...i, quantity } : i
//   //       )
//   //     );
//   //   }
//   // };

//   const updateQuantity = async (productId: number, quantity: number) => {
//     try {
//       if (quantity <= 0) {
//         await removeItem(productId);
//         return;
//       }

//       if (isLoggedIn) {
//         // ✅ Gửi PUT tới API để cập nhật số lượng trong DB
//         const res = await axios.put<{ cart: CartItem[] }>(
//           `/api/cart/${productId}`,
//           { quantity },
//           { withCredentials: true }
//         );
//         console.log("🔍 PUT response:", res.data);

//         // ✅ Cập nhật lại state giỏ hàng
//         if (res.data?.cart) {
//           setCart(res.data.cart);
//         } else {
//           console.warn("Không nhận được dữ liệu giỏ hàng từ server");
//         }
//       } else {
//         // ✅ Cập nhật giỏ hàng trong cookie nếu chưa đăng nhập
//         const newCart = cart.map((i) =>
//           i.product_id === productId ? { ...i, quantity } : i
//         );
//         console.log("🧩 Updated local cart:", newCart);
//         saveCartToCookie(newCart);
//       }
//     } catch (error: any) {
//       console.error("❌ Lỗi cập nhật số lượng:", error);
//       alert("Không thể cập nhật số lượng sản phẩm!");
//     }
//   };


//   const clearCart = async () => {
//     if (isLoggedIn) {
//       await axios.delete("/api/cart/delete");
//       setCart([]);
//     } else {
//       saveCartToCookie([]);
//     }
//   };

//   const setCartFromServer = (items: CartItem[]) => {
//     setCart(items);
//     setIsLoggedIn(true);
//   };

//   return (
//     <CartContext.Provider
//       value={{
//         cart,
//         user,
//         isLoggedIn,
//         loadingUser,
//         setCart,
//         addItem,
//         removeItem,
//         updateQuantity,
//         clearCart,
//         setCartFromServer,
//         fetchUser,
//         fetchCart,
//       }}
//     >
//       {children}
//     </CartContext.Provider>
//   );
// }

// export function useCart() {
//   const context = useContext(CartContext);
//   if (!context) throw new Error("useCart phải được dùng trong <CartProvider>");
//   return context;
// }

// ----------------------------
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
  loadingUser: boolean;

  setCart: (items: CartItem[]) => void;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  refresh: () => Promise<void>;
  setCartFromServer: (items: CartItem[]) => void;
}

interface MeResponse {
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

const CartContext = createContext<CartContextType | undefined>(undefined);
axios.defaults.withCredentials = true;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<any | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);


  // ========== Helpers ==========
  const saveCartToCookie = (items: CartItem[]) => {
    setCart(items);
    if (items.length > 0) {
      Cookies.set("cart", JSON.stringify(items), { expires: 7 });
    } else {
      Cookies.remove("cart");
    }
  };

  // ========== API ==========
  const fetchUser = async () => {
    try {
      const res = await axios.get<MeResponse>("/api/auth/me");
      if (res.data.user) {
        setUser(res.data.user);
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    } catch {
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  const fetchCart = async () => {
    try {
      const res = await axios.get<{ cart: CartItem[] }>("/api/cart");
      if (res.data.cart) {
        setCart(res.data.cart);
      } else {
        const stored = Cookies.get("cart");
        if (stored) setCart(JSON.parse(stored));
      }
    } catch {
      const stored = Cookies.get("cart");
      if (stored) setCart(JSON.parse(stored));
    }
  };

  // ========== INIT: Chạy 1 lần duy nhất ==========
  useEffect(() => {
    const init = async () => {
      setLoadingUser(true);
      await fetchUser();
      await fetchCart();
      setLoadingUser(false);
    };

    init();
  }, []);

  const refresh = async () => {
    setLoadingUser(true);
    await fetchUser();
    await fetchCart();
    setLoadingUser(false);
  };

  // ========== Action ==========
  // const addItem = async (product: Product) => {
  //   if (user) {
  //     // ✅ Đã login → gọi API lưu DB
  //     const res = await axios.post<{ cart: CartItem[] }>(
  //       "/api/cart/add",
  //       { productId: product.id, quantity: 1 }
  //     );
  //     if (res.data.cart) setCart(res.data.cart);
  //   } else {
  //     const exist = cart.find((i) => i.product_id === product.id);
  //     if (exist) {
  //       saveCartToCookie(
  //         cart.map((i) =>
  //           i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i
  //         )
  //       );
  //     } else {
  //       saveCartToCookie([
  //         ...cart,
  //         {
  //           product_id: product.id,
  //           name: product.name,
  //           slug: product.slug,
  //           price: product.price || 0,
  //           unit: product.unit || "0gram",
  //           image: product.image || "",
  //           quantity: 1,
  //         },
  //       ]);
  //     }
  //   }
  // };

  // Trong file CartContext.tsx (hoặc nơi bạn khai báo addItem)

  const addItem = async (product: Product, quantity: number = 1) => { // 👈 Thêm tham số quantity, default = 1
    if (user) {
      // ✅ Đã login → gọi API lưu DB
      try {
        const res = await axios.post<{ cart: CartItem[] }>(
          "/api/cart/add",
          {
            productId: product.id,
            quantity: quantity // 👈 Sử dụng số lượng khách chọn thay vì số 1
          }
        );
        if (res.data.cart) setCart(res.data.cart);
      } catch (error) {
        console.error("Lỗi thêm vào giỏ hàng:", error);
      }
    } else {
      // ❌ Chưa login → Lưu Cookie
      const exist = cart.find((i) => i.product_id === product.id);

      if (exist) {
        // Nếu đã có, cộng dồn số lượng cũ + số lượng mới chọn
        saveCartToCookie(
          cart.map((i) =>
            i.product_id === product.id
              ? { ...i, quantity: i.quantity + quantity } // 👈 Cộng thêm quantity
              : i
          )
        );
      } else {
        // Nếu chưa có, thêm mới với số lượng đã chọn
        saveCartToCookie([
          ...cart,
          {
            product_id: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price || 0,
            unit: product.unit || "0gram",
            image: product.image || "",
            quantity: quantity, // 👈 Sử dụng quantity khách chọn
            discount: product.discount || 0, // Thêm trường dicount_percent nếu cần
          },
        ]);
      }
    }
  };


  const setCartFromServer = (items: CartItem[]) => {
    setCart(items);
    setIsLoggedIn(true);
  };

  const removeItem = async (id: number) => {
    if (isLoggedIn) {
      await axios.delete(`/api/cart/delete/${id}`);
      setCart(cart.filter((i) => i.product_id !== id));
    } else {
      saveCartToCookie(cart.filter((i) => i.product_id !== id));
    }
  };

  const updateQuantity = async (id: number, quantity: number) => {
    if (quantity <= 0) return removeItem(id);

    if (isLoggedIn) {
      const res = await axios.put<{ cart: CartItem[] }>(
        `/api/cart/${id}`,
        { quantity }
      );
      if (res.data.cart) setCart(res.data.cart);
    } else {
      saveCartToCookie(
        cart.map((i) =>
          i.product_id === id ? { ...i, quantity } : i
        )
      );
    }
  };

  const clearCart = async () => {
    if (user) {
      // ✅ Login → xóa trên DB
      await axios.delete("/api/cart/delete");
      setCart([]);
    } else {
      // ❌ Guest → xóa trên cookie
      saveCartToCookie([]);
      setCart([]);
    }
  };

  // ========== Render Provider ==========
  return (
    <CartContext.Provider
      value={{
        cart,
        user,
        isLoggedIn,
        loadingUser,
        setCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        refresh,
        setCartFromServer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart phải được dùng trong <CartProvider>!");
  return ctx;
}
