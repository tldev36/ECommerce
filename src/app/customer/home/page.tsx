// src/app/Customer/Home/page.tsx

import FloatingButtons from "@/components/layout/FloatingButtons";
import Slider from "@/components/layout/Slider";
import Categories from "@/components/layout/Categories";
import RecommendationProducts from "@/components/product/RecommendationProducts";
import NewProducts from "@/components/product/NewProducts";
import SpecialOffers from "@/components/layout/SpecialOffers";
import Blog from "@/components/layout/Blog";
import Review from "@/components/layout/Review";
import Newsletter from "@/components/layout/Newsletter";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 pt-16"> 
      
      {/* Slider */}
      <Slider />
      
      {/* Categories */}
      <Categories />

      {/* Recommendations Product */}
      <RecommendationProducts />

      {/* New Product */}
      <NewProducts />

      {/* Special Offers */}
      <SpecialOffers />

      {/* Blog */}
      <Blog />

      {/* Review */}
      <Review />

      {/* Newsletter */}
      <Newsletter />

      {/* Floating Buttons */}
      <FloatingButtons />

      

    </div>
  );
}
