import Sidebar from "@/components/layout-admin/Sidebar";
import Header from "@/components/layout-admin/Header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header />

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
