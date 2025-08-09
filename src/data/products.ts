// src/data/products.ts
export type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  unit: string;
  image: string;
  short: string;
  featured?: boolean;
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
    featured: true,
  },
  {
    id: "p2",
    name: "Gạo sạch Hậu Giang",
    slug: "gao-sach-hau-giang",
    price: 23000,
    unit: "kg",
    image: "/images/rice.jpg",
    short: "Gạo thơm, hạt dài, cho cơm dẻo",
    featured: true,
  },
  {
    id: "p3",
    name: "Cà rốt tươi hữu cơ",
    slug: "ca-rot-huu-co",
    price: 18000,
    unit: "kg",
    image: "/images/carrot.jpg",
    short: "Cà rốt giòn, ngọt tự nhiên",
  },
  // thêm nhiều item nếu muốn
];
