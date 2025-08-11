export type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  unit: string;
  image: string;
  short: string;
  category: string;        // <-- thêm trường category
  featured?: boolean;
  discount?: number;       // % giảm giá
  isNew?: boolean;         // sản phẩm mới
  isBestSeller?: boolean;  // bán chạy
};

export const products: Product[] = [
  {
    id: "p1",
    name: "Táo hữu cơ Đà Lạt",
    slug: "tao-huu-co-da-lat",
    price: 75000,
    unit: "kg",
    image: "/images/apple.jpg",
    short: "Táo đỏ, giòn, không thuốc",
    category: "Trái cây",    // thêm category
    featured: true,
    discount: 10,
    isNew: true,
  },
  {
    id: "p2",
    name: "Gạo sạch Hậu Giang",
    slug: "gao-sach-hau-giang",
    price: 23000,
    unit: "kg",
    image: "/images/rice.jpg",
    short: "Gạo thơm, hạt dài, cho cơm dẻo",
    category: "Gạo",         // thêm category
    featured: true,
    isBestSeller: true,
  },
  {
    id: "p3",
    name: "Cà rốt tươi hữu cơ",
    slug: "ca-rot-huu-co",
    price: 18000,
    unit: "kg",
    image: "/images/carrot.jpg",
    short: "Cà rốt giòn, ngọt tự nhiên",
    category: "Rau củ",      // thêm category
    discount: 5,
  },
  {
    id: "p4",
    name: "Xoài cát Hòa Lộc",
    slug: "xoai-cat-hoa-loc",
    price: 65000,
    unit: "kg",
    image: "/images/carrot.jpg",
    short: "Xoài vàng, ngọt thanh",
    category: "Trái cây",    // thêm category
    isNew: true,
    isBestSeller: true,
  },
  {
    id: "p5",
    name: "Sầu riêng Monthong",
    slug: "sau-rieng-monthong",
    price: 180000,
    unit: "kg",
    image: "/images/carrot.jpg",
    short: "Cơm vàng, hạt lép, thơm béo",
    category: "Trái cây",    // thêm category
    discount: 15,
    featured: true,
  },
  // các sản phẩm khác thêm category tương tự...
];
