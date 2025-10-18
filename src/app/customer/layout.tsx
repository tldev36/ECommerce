// app/Customer/layout.tsx
"use client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
