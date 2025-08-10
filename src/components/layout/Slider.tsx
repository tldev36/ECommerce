// src/components/layout/Slider.tsx
"use client";

import Slider from "react-slick";
import Link from "next/link";

const banners = [
  {
    image: "/images/hero.jpg",
    title: "Nông sản sạch — Tươi từ vườn đến bàn",
    desc: "Chúng tôi kết nối nông dân sạch với người tiêu dùng, cam kết không chất bảo quản, giao tận nơi.",
    link: "/products",
  },
  {
    image: "/images/hero2.jpg",
    title: "Giảm giá 30% cho rau củ hữu cơ",
    desc: "Ưu đãi có hạn, đặt ngay hôm nay để nhận rau củ tươi ngon với giá tốt nhất.",
    link: "/products",
  },
  {
    image: "/images/hero3.jpg",
    title: "Trái cây nhiệt đới tươi ngon",
    desc: "Được hái trực tiếp từ vườn, đảm bảo hương vị tự nhiên và bổ dưỡng.",
    link: "/products",
  },
];

export default function HeroSlider() {
  const settings = {
    dots: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 5000,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    pauseOnHover: false,
  };

  return (
    <Slider {...settings} className="hero-slider">
      {banners.map((b, i) => (
        <div key={i} className="relative h-[500px]">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${b.image})` }}
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 max-w-6xl mx-auto px-4 py-24 text-white">
            <h1 className="text-4xl md:text-5xl font-bold">{b.title}</h1>
            <p className="mt-4 text-lg text-gray-100/90 max-w-2xl">{b.desc}</p>
            <div className="mt-6">
              <Link
                href={b.link}
                className="bg-green-600 px-5 py-3 rounded-md font-medium shadow hover:bg-green-700"
              >
                Mua ngay
              </Link>
            </div>
          </div>
        </div>
      ))}
    </Slider>
  );
}
