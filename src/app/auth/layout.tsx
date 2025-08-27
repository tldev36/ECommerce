import Header from "@/components/layout/Header";


export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <div
      
      >
        {children}
      </div>

    </>
  );
}