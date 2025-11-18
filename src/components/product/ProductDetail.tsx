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
  faTag
} from "@fortawesome/free-solid-svg-icons";

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

  const [hasLoggedView, setHasLoggedView] = useState(false);

  // 🧠 Lấy user từ API /auth/me
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

  // 🧠 Lấy chi tiết sản phẩm
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

    if (user !== null) {
      fetchProduct();
    }
  }, [slug, user]);

  // 🛒 Xử lý thêm giỏ hàng
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!product) return;

    addItem(product);
    
    // Toast notification thay vì alert
    const toast = document.createElement('div');
    toast.className = 'fixed top-20 right-4 bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl z-50 animate-slide-in-right';
    toast.innerHTML = `
      <div class="flex items-center gap-3">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span class="font-semibold">Đã thêm ${product.name} vào giỏ hàng!</span>
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 pt-24 flex items-center justify-center">
        <div className="text-center bg-white p-12 rounded-2xl shadow-xl">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy sản phẩm</h2>
          <p className="text-gray-600">Sản phẩm bạn tìm kiếm không tồn tại hoặc đã bị xóa</p>
        </div>
      </div>
    );
  }

  const finalPrice =
    product.discount && product.discount > 0
      ? Number(product.price) * (1 - Number(product.discount) / 100)
      : Number(product.price);

  const discountPercent =
    product.discount && product.discount > 0 ? Number(product.discount) : 0;

  const handleIncrease = () => setQuantity((prev) => prev + 1);
  const handleDecrease = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 pt-20 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-gray-600">
          <a href="/" className="hover:text-green-600 transition">Trang chủ</a>
          <span>/</span>
          <a href="/customer/list-product" className="hover:text-green-600 transition">Sản phẩm</a>
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        {/* Chi tiết sản phẩm */}
        <div className="bg-white shadow-2xl rounded-3xl overflow-hidden mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Ảnh sản phẩm */}
            <div className="relative bg-gray-50 p-8 lg:p-12 flex items-center justify-center">
              {/* Badges */}
              <div className="absolute top-6 left-6 flex flex-col gap-2 z-10">
                {product.is_new && (
                  <span className="bg-gradient-to-r from-green-600 to-green-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                    <FontAwesomeIcon icon={faStar} />
                    SẢN PHẨM MỚI
                  </span>
                )}
                {product.is_best_seller && (
                  <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                    <FontAwesomeIcon icon={faTag} />
                    BÁN CHẠY
                  </span>
                )}
              </div>

              {/* Discount badge */}
              {discountPercent > 0 && (
                <div className="absolute top-6 right-6 z-10">
                  <div className="bg-red-600 text-white font-bold rounded-full w-20 h-20 flex flex-col items-center justify-center shadow-xl">
                    <span className="text-2xl">-{discountPercent}%</span>
                  </div>
                </div>
              )}

              {/* Image */}
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

              {/* Action buttons */}
              <div className="absolute bottom-6 right-6 flex gap-2">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
                    isLiked ? 'bg-red-500 text-white' : 'bg-white text-gray-700 hover:bg-red-50'
                  }`}
                >
                  <FontAwesomeIcon icon={faHeart} />
                </button>
                <button className="w-12 h-12 bg-white text-gray-700 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all duration-300">
                  <FontAwesomeIcon icon={faShare} />
                </button>
              </div>
            </div>

            {/* Thông tin sản phẩm */}
            <div className="p-8 lg:p-12 flex flex-col">
              <div className="flex-1">
                {/* Tên sản phẩm */}
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  {product.name}
                </h1>

                {/* Rating & Stock */}
                <div className="flex items-center gap-6 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <FontAwesomeIcon key={i} icon={faStar} className="text-sm" />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">(150 đánh giá)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-green-600">Còn hàng</span>
                  </div>
                </div>

                {/* Mô tả ngắn */}
                {product.short && (
                  <p className="text-gray-600 mb-6 leading-relaxed text-lg">
                    {product.short}
                  </p>
                )}

                {/* Giá */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 mb-8">
                  {product.discount && product.discount > 0 ? (
                    <>
                      <p className="text-sm text-gray-500 mb-2">Giá gốc:</p>
                      <p className="text-xl line-through text-gray-400 mb-2">
                        {Number(product.price).toLocaleString()}₫
                      </p>
                      <div className="flex items-baseline gap-3">
                        <p className="text-4xl lg:text-5xl font-bold text-green-600">
                          {finalPrice.toLocaleString()}₫
                        </p>
                        <span className="text-lg text-gray-600">/ {product.unit}</span>
                      </div>
                      <p className="text-sm text-green-700 font-semibold mt-2">
                        Tiết kiệm: {(Number(product.price) - finalPrice).toLocaleString()}₫
                      </p>
                    </>
                  ) : (
                    <div className="flex items-baseline gap-3">
                      <p className="text-4xl lg:text-5xl font-bold text-green-600">
                        {Number(product.price).toLocaleString()}₫
                      </p>
                      <span className="text-lg text-gray-600">/ {product.unit}</span>
                    </div>
                  )}
                </div>

                {/* Số lượng */}
                <div className="mb-8">
                  <label className="block text-gray-700 font-semibold mb-3 text-lg">
                    Số lượng:
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden shadow-inner">
                      <button
                        onClick={handleDecrease}
                        className="w-12 h-12 flex items-center justify-center hover:bg-white transition-all text-gray-700 font-bold"
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
                        className="w-12 h-12 flex items-center justify-center hover:bg-white transition-all text-gray-700 font-bold"
                      >
                        <FontAwesomeIcon icon={faPlus} />
                      </button>
                    </div>
                    <span className="text-gray-500">
                      {product.unit && `(${product.unit})`}
                    </span>
                  </div>
                </div>

                {/* Nút hành động */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 text-lg"
                  >
                    <FontAwesomeIcon icon={faShoppingCart} />
                    Thêm vào giỏ hàng
                  </button>
                </div>

                {/* Chính sách */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FontAwesomeIcon icon={faTruck} className="text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Giao hàng miễn phí</p>
                      <p className="text-xs text-gray-600">Toàn quốc</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FontAwesomeIcon icon={faShieldAlt} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Bảo hành chính hãng</p>
                      <p className="text-xs text-gray-600">12 tháng</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FontAwesomeIcon icon={faSync} className="text-orange-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Đổi trả dễ dàng</p>
                      <p className="text-xs text-gray-600">Trong 7 ngày</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mô tả chi tiết */}
          {product.description && (
            <div className="border-t border-gray-200 p-8 lg:p-12 bg-gray-50">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-1 h-8 bg-green-600 rounded-full"></div>
                Mô tả chi tiết sản phẩm
              </h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            </div>
          )}

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
                <span className="font-semibold text-gray-700">Xuất xứ:</span>
                <span className="text-gray-900">Việt Nam</span>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 flex justify-between items-center">
                <span className="font-semibold text-gray-700">Tình trạng:</span>
                <span className="text-green-600 font-semibold flex items-center gap-2">
                  <FontAwesomeIcon icon={faCheck} className="text-sm" />
                  Còn hàng
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Gợi ý sản phẩm */}
        {product?.id && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <span className="text-3xl">💡</span>
              Sản phẩm tương tự
            </h2>
            <ProductDetailRecommendations productId={product.id} />
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}