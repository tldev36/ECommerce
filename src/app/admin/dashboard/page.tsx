// app/admin/page.tsx
export default function DashboardPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Tổng quan</h2>
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">Sản phẩm: 120</div>
        <div className="bg-white p-6 rounded-lg shadow">Đơn hàng: 45</div>
        <div className="bg-white p-6 rounded-lg shadow">Người dùng: 300</div>
        <div className="bg-white p-6 rounded-lg shadow">Doanh thu: 50M</div>
      </div>
    </div>
  );
}
