import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCircleXmark,
    faFire,
    faStar,
    faTag,
} from "@fortawesome/free-solid-svg-icons";

/* ✅ Component mô tả legend trạng thái */
export default function StatusLegend() {
    const legends = [
        { icon: faTag, color: "text-green-600", text: "Nổi bật" },
        { icon: faFire, color: "text-purple-600", text: "Bán chạy" },
        { icon: faStar, color: "text-blue-600", text: "Mới" },
        { icon: faCircleXmark, color: "text-gray-500", text: "Bình thường" },
    ];

    return (
        <div className="flex flex-wrap items-center gap-4 text-sm mb-3 text-gray-700">
            <span className="font-medium text-gray-800">📘 Chú thích trạng thái:</span>
            {legends.map((l, i) => (
                <span key={i} className={`flex items-center gap-1 ${l.color}`}>
                    <FontAwesomeIcon icon={l.icon} /> {l.text}
                </span>
            ))}
        </div>
    );
}