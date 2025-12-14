"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import ProductDetailRecommendations from "@/components/ProductDetailRecommendations";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingCart,
  faMinus,
  faPlus,
  faStar,
  faCheck,
  faTruck,
  faShieldAlt,
  faSync,
  faHeart,
  faShare,
  faTag,
  faBoxOpen // ✨ Thêm icon kho hàng
} from "@fortawesome/free-solid-svg-icons";
import ProductReview from "./ProductReview";

interface ProductDetailProps {
  slug: string;
}

interface User {
  id: number;
  email: string;
  role?: string;
}

export default function ProductDetail({ slug }: ProductDetailProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [user, setUser] = useState<User | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const { addItem } = useCart();

  // ... (Giữ nguyên phần useEffect fetchUser và fetchProduct)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await res.json();
        if (data?.user) {
          setUser(data.user);
        }
      } catch (err) {
        console.error("❌ Lỗi khi lấy user:", err);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      try {
        const res = await axios.get<Product>(`/api/products/${slug}`);
        setProduct(res.data);
        const relatedRes = await axios.get<Product[]>(`/api/products/related?slug=${slug}`);
        setRelated(relatedRes.data);
      } catch (err) {
        console.error("🔥 Lỗi khi load sản phẩm:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();

  }, [slug, user]);

  // ... (Giữ nguyên handleAddToCart)
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!product) return;

    // ✨ NEW: Kiểm tra tồn kho trước khi thêm
    if (product.stock_quantity && quantity > product.stock_quantity) {
      alert("Số lượng sản phẩm trong kho không đủ!");
      return;
    }

    addItem(product, quantity); // Lưu ý: hàm addItem của bạn nên hỗ trợ tham số quantity

    const toast = document.createElement('div');
    toast.className = 'fixed top-20 right-4 bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl z-50 animate-slide-in-right';
    toast.innerHTML = `
      <div class="flex items-center gap-3">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span class="font-semibold">Đã thêm ${quantity} ${product.name} vào giỏ hàng!</span>
      </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);

    if (user?.id) {
      await axios.post("/api/interactions", {
        userId: user.id,
        productId: product.id,
        interactionType: "cart",
      });
    }
  };

  // ... (Loading và Error state giữ nguyên)
  if (loading) return <div className="min-h-screen pt-24 text-center">Đang tải...</div>;
  if (!product) return <div className="min-h-screen pt-24 text-center">Không tìm thấy sản phẩm</div>;

  const finalPrice = product.discount && product.discount > 0
    ? Number(product.price) * (1 - Number(product.discount) / 100)
    : Number(product.price);

  const discountPercent = product.discount && product.discount > 0 ? Number(product.discount) : 0;

  // ✨ NEW: Lấy số lượng tồn kho (Giả sử field trong DB là quantity, nếu là stock thì đổi lại)
  const stockQuantity = product.stock_quantity || 0;
  const isOutOfStock = stockQuantity === 0;

  // 🔄 UPDATE: Logic tăng giảm số lượng có check tồn kho
  const handleIncrease = () => {
    setQuantity((prev) => (prev < stockQuantity ? prev + 1 : prev));
  };
  const handleDecrease = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 pt-20 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Breadcrumb giữ nguyên */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-gray-600">
          {/* ... */}
          {/* <span className="text-gray-900 font-medium">{product.name}</span> */}
        </nav>

        <div className="bg-white shadow-2xl rounded-3xl overflow-hidden mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Ảnh sản phẩm (Giữ nguyên) */}
            <div className="relative bg-gray-50 p-8 lg:p-12 flex items-center justify-center">
              {/* ... Code ảnh ... */}
              <div className="relative w-full h-96 lg:h-[500px]">
                <Image
                  src={`/images/products/${product.image ?? "default.jpg"}`}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain hover:scale-110 transition-transform duration-500"
                  priority
                />
              </div>
              {/* ... */}
            </div>

            {/* Thông tin sản phẩm */}
            <div className="p-8 lg:p-12 flex flex-col">
              <div className="flex-1">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  {product.name}
                </h1>

                {/* 🔄 UPDATE: Rating & Stock Status */}
                <div className="flex items-center gap-6 mb-6">
                  {/* <div className="flex items-center gap-2">
                    <div className="flex text-gray-400">
                      {[...Array(5)].map((_, i) => (
                        <FontAwesomeIcon key={i} icon={faStar} className="text-sm" />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">(0 đánh giá)</span>
                  </div> */}

                  {/* ✨ Hiển thị trạng thái kho hàng động */}
                  <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
                    <div className={`w-2 h-2 rounded-full ${isOutOfStock ? 'bg-red-500' : 'bg-green-500'}`}></div>
                    <span className={`text-sm font-medium ${isOutOfStock ? 'text-red-600' : 'text-green-600'}`}>
                      {isOutOfStock ? "Hết hàng" : "Còn hàng"}
                    </span>
                  </div>
                </div>

                {/* Mô tả ngắn (Giữ nguyên) */}
                {/* {product.short && (
                  <p className="text-gray-600 mb-6 leading-relaxed text-lg">{product.short}</p>
                )} */}

                {/* Giá (Giữ nguyên) */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 mb-8">
                  {/* ... Code hiển thị giá ... */}
                  <div className="flex items-baseline gap-3">
                    <p className="text-4xl lg:text-5xl font-bold text-green-600">
                      {finalPrice.toLocaleString()}₫
                    </p>
                    {/* <span className="text-lg text-gray-600">/ {product.unit}</span> */}
                  </div>
                </div>

                {/* 🔄 UPDATE: Số lượng & Tồn kho */}
                <div className="mb-8">
                  <label className="block text-gray-700 font-semibold mb-3 text-lg">
                    Số lượng:
                  </label>
                  <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden shadow-inner">
                      <button
                        onClick={handleDecrease}
                        disabled={isOutOfStock}
                        className="w-12 h-12 flex items-center justify-center hover:bg-white transition-all text-gray-700 font-bold disabled:opacity-50"
                      >
                        <FontAwesomeIcon icon={faMinus} />
                      </button>
                      <input
                        type="text"
                        value={quantity}
                        readOnly
                        className="w-16 h-12 text-center bg-transparent text-xl font-bold outline-none"
                      />
                      <button
                        onClick={handleIncrease}
                        disabled={isOutOfStock || quantity >= stockQuantity}
                        className={`w-12 h-12 flex items-center justify-center transition-all text-gray-700 font-bold disabled:opacity-30 disabled:cursor-not-allowed ${quantity >= stockQuantity ? 'bg-gray-200' : 'hover:bg-white'}`}
                      >
                        <FontAwesomeIcon icon={faPlus} />
                      </button>
                    </div>

                    {/* ✨ Hiển thị số lượng tồn kho cụ thể */}
                    <div className="flex items-center gap-2 text-gray-500 font-medium">
                      <FontAwesomeIcon icon={faBoxOpen} className="text-gray-400" />
                      <span>
                        {stockQuantity > 0
                          ? `${stockQuantity} sản phẩm có sẵn`
                          : "Tạm hết hàng"}
                      </span>
                    </div>
                  </div>
                  {/* Cảnh báo khi chạm giới hạn tồn kho */}
                  {quantity >= stockQuantity && stockQuantity > 0 && (
                    <p className="text-red-500 text-sm mt-2 italic">
                      * Bạn đã chọn tối đa số lượng hiện có.
                    </p>
                  )}
                </div>

                {/* Nút hành động */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className={`flex-1 font-bold py-4 px-8 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-3 text-lg
                        ${isOutOfStock
                        ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                        : 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white hover:shadow-xl'
                      }`}
                  >
                    <FontAwesomeIcon icon={faShoppingCart} />
                    {isOutOfStock ? "Hết hàng" : "Thêm vào giỏ hàng"}
                  </button>
                </div>

              </div>
            </div>
          </div>

          {/* Mô tả chi tiết (Giữ nguyên) */}
          {/* ... */}

          {/* Thông số kỹ thuật */}
          <div className="border-t border-gray-200 p-8 lg:p-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-1 h-8 bg-green-600 rounded-full"></div>
              Thông tin sản phẩm
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4 flex justify-between items-center">
                <span className="font-semibold text-gray-700">Danh mục:</span>
                <span className="text-gray-900">{product.categories?.name || "Chưa phân loại"}</span>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 flex justify-between items-center">
                <span className="font-semibold text-gray-700">Đơn vị:</span>
                <span className="text-gray-900">{product.unit}</span>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 flex justify-between items-center">
                <span className="font-semibold text-gray-700">Mô tả:</span>
                <span className="text-gray-900">{product.description}</span>
              </div>
              {/* 🔄 UPDATE: Hiển thị Tình trạng kho chi tiết */}
              <div className="bg-gray-50 rounded-xl p-4 flex justify-between items-center">
                <span className="font-semibold text-gray-700">Tình trạng kho:</span>
                <span className={`font-semibold flex items-center gap-2 ${stockQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stockQuantity > 0 ? (
                    <>
                      <FontAwesomeIcon icon={faCheck} className="text-sm" />
                      Còn {stockQuantity} sản phẩm
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faBoxOpen} className="text-sm" />
                      Tạm hết hàng
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ... (Phần Gợi ý và Đánh giá giữ nguyên) */}
        {product?.id && (

          <ProductDetailRecommendations productId={product.id} />

        )}
        {product?.id && (
          <ProductReview productId={product.id} user={user} />
        )}
      </div>

      <style jsx global>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in-right { animation: slide-in-right 0.3s ease-out; }
      `}</style>
    </div>
  );
}