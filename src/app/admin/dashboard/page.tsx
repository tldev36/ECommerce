"use client";

import React, { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from "recharts";
import { TrendingUp, Package, DollarSign, ShoppingCart } from "lucide-react";

// 🔹 Card Components (Giữ nguyên)
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white rounded-lg shadow p-6 ${className}`}>{children}</div>;
}
function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-4">{children}</div>;
}
function CardTitle({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      {icon && <div className="text-gray-700">{icon}</div>}
      <h2 className="text-lg font-semibold text-gray-800">{children}</h2>
    </div>
  );
}
function CardContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

export default function StatisticsDashboard() {
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [orderData, setOrderData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const currentMonthLabel = new Date().toLocaleString('en-US', { month: 'short' });

  // 🔹 Lấy dữ liệu từ API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Gọi song song 2 API
        const [revRes, ordRes] = await Promise.all([
          fetch("/api/admin/dashboard/revenue"),
          fetch("/api/admin/dashboard/orders"), // 👈 Cần file route mới này
        ]);

        const revData = await revRes.json();
        const ordData = await ordRes.json();

        if (Array.isArray(revData)) setRevenueData(revData);
        if (Array.isArray(ordData)) setOrderData(ordData);

      } catch (err) {
        console.error("Lỗi khi tải dữ liệu thống kê:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 🔹 Tính toán số liệu
  // 1. Tổng doanh thu 6 tháng
  const totalRevenue = revenueData.reduce((a, b) => a + (b.revenue || 0), 0);

  // 2. Doanh thu tháng hiện tại (Lấy phần tử cuối cùng của mảng 6 tháng)
  const currentMonthData = revenueData.length > 0
    ? revenueData[revenueData.length - 1]
    : { revenue: 0 };

  // 3. Tổng đơn hàng (Cộng dồn tất cả trạng thái)
  const totalOrders = orderData.reduce((a, b) => a + (b.value || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Bảng điều khiển</h1>
          <p className="text-gray-600">Dữ liệu tính đến {currentMonthLabel} {new Date().getFullYear()}</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Doanh thu tháng này */}
          <Card className="border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Doanh thu tháng này</p>
                <p className="text-2xl font-bold text-gray-800">
                  {(currentMonthData.revenue || 0).toLocaleString()}₫
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          {/* Tổng doanh thu */}
          <Card className="border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng doanh thu (6 tháng)</p>
                <p className="text-2xl font-bold text-gray-800">
                  {totalRevenue.toLocaleString()}₫
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          {/* Tổng đơn hàng */}
          <Card className="border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng đơn hàng</p>
                <p className="text-2xl font-bold text-gray-800">
                  {totalOrders} {/* Đã fix lỗi hiển thị 0 */}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Biểu đồ doanh thu */}
          <Card>
            <CardHeader>
              <CardTitle icon={<TrendingUp className="w-5 h-5 text-green-600" />}>
                Doanh thu 6 tháng gần nhất
              </CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 12 }} padding={{ left: 10, right: 10 }} />
                  <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(0)}tr`} tick={{ fill: "#6b7280", fontSize: 12 }} />
                  <Tooltip
                    formatter={(v: number) => [`${v.toLocaleString()}₫`, "Doanh thu"]}
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Biểu đồ đơn hàng */}
          {/* <Card>
            <CardHeader>
              <CardTitle icon={<Package className="w-5 h-5 text-blue-600" />}>
                Trạng thái đơn hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={orderData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />

                  👇 SỬA 1: dataKey="name" để lấy tên Tiếng Việt từ API
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: "8px" }} />

                  👇 SỬA 2: Bỏ fill cứng, map Cell để lấy màu dynamic
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                    {orderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>

                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card> */}
          <Card className="w-full"> {/* Đảm bảo Card full width container */}
            <CardHeader>
              <CardTitle icon={<Package className="w-5 h-5 text-blue-600" />}>
                Trạng thái đơn hàng
              </CardTitle>
            </CardHeader>

            {/* 👇 SỬA 1: Chiều cao linh hoạt (mobile thấp hơn 1 chút), giảm padding trên mobile */}
            <CardContent className="h-64 sm:h-80 p-2 sm:p-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={orderData}
                  layout="horizontal"
                  // 👇 SỬA 2: Tinh chỉnh margin để tận dụng tối đa không gian trên mobile
                  margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />

                  <XAxis
                    dataKey="name"
                    // 👇 SỬA 3: Font chữ nhỏ hơn trên mobile (10px), desktop (12px)
                    tick={{ fill: "#6b7280", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    // Giúp hiển thị hết các nhãn nếu có thể
                    interval={0}
                  // Nếu tên dài quá, có thể thêm angle={-45} textAnchor="end" height={60}
                  />

                  <YAxis
                    tick={{ fill: "#6b7280", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    // Cho phép số nguyên
                    allowDecimals={false}
                  />

                  <Tooltip
                    cursor={{ fill: '#f3f4f6' }}
                    contentStyle={{ borderRadius: "8px", fontSize: "12px" }}
                  />

                  {/* 👇 SỬA 4: Dùng maxBarSize thay vì barSize cứng. 
            Trên mobile cột sẽ tự nhỏ lại, trên desktop max là 40px */}
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={40}>
                    {orderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>

                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}