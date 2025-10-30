import {
    faCircleXmark,
    faFire,
    faStar,
    faTag,
} from "@fortawesome/free-solid-svg-icons";
import { Product } from "@/types/product";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


/* ✅ Component hiển thị trạng thái sản phẩm bằng icon */
export default function ProductStatusIcons({ product }: { product: Product }) {
    const statuses = [];

    if (product.featured)
        statuses.push({
            icon: faTag,
            text: "Nổi bật",
            color: "text-green-600",
            title: "Sản phẩm nổi bật (hiển thị ở trang chủ)",
        });

    if (product.is_best_seller)
        statuses.push({
            icon: faFire,
            text: "Bán chạy",
            color: "text-purple-600",
            title: "Sản phẩm có doanh số cao",
        });

    if (product.is_new)
        statuses.push({
            icon: faStar,
            text: "Mới",
            color: "text-blue-600",
            title: "Sản phẩm mới được thêm gần đây",
        });

    if (!product.is_new && !product.is_best_seller && !product.featured)
        statuses.push({
            icon: faCircleXmark,
            text: "Bình thường",
            color: "text-gray-500",
            title: "Không có trạng thái đặc biệt",
        });

    return (
        <div className="flex items-center justify-center gap-3 flex-wrap py-1">
            {statuses.map((s, i) => (
                <span
                    key={i}
                    title={s.title}
                    className={`flex items-center gap-2 text-sm sm:text-base font-semibold ${s.color}`}
                >
                    <FontAwesomeIcon icon={s.icon} className="text-lg sm:text-lg" />
                    
                </span>
            ))}
        </div>

    );
}