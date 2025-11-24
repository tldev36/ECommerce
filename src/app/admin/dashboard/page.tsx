"use client";
import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { 
  TrendingUp, 
  Package, 
  DollarSign, 
  ShoppingCart,
  Award
} from "lucide-react";

// 🔹 Card Components
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

  // Lấy tháng hiện tại
  const currentMonth = new Date().toLocaleString('en-US', { month: 'short' });

  // 🔹 Lấy dữ liệu từ API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [revRes, ordRes] = await Promise.all([
          fetch("/api/admin/dashboard/revenue"),
          fetch("/api/admin/dashboard/orders"),
        ]);
        const [rev, ord] = await Promise.all([revRes.json(), ordRes.json()]);
        setRevenueData(rev);
        setOrderData(ord);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu thống kê:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Lấy dữ liệu tháng hiện tại
  const currentMonthData = revenueData.find((item) => item.month === currentMonth);
  const totalRevenue = revenueData.reduce((a, b) => a + b.revenue, 0);
  const totalOrders = orderData.reduce((a, b) => a + b.value, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Thống Kê</h1>
          <p className="text-gray-600">Tháng {currentMonth} {new Date().getFullYear()}</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Doanh thu tháng này */}
          <Card className="border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Doanh thu tháng này</p>
                <p className="text-2xl font-bold text-gray-800">
                  {(currentMonthData?.revenue || 0).toLocaleString()}₫
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
                <p className="text-sm text-gray-600 mb-1">Tổng doanh thu</p>
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
                <p className="text-2xl font-bold text-gray-800">{totalOrders}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>

          {/* Sản phẩm nổi bật */}
          <Card className="border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Sản phẩm nổi bật</p>
                <p className="text-lg font-semibold text-gray-800 truncate">
                  {currentMonthData?.bestProduct || "—"}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-orange-600" />
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
                Doanh thu theo tháng
              </CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                  />
                  <YAxis
                    tickFormatter={(v: number) => `${(v / 1_000_000).toFixed(1)}tr`}
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    }}
                    formatter={(v: number) => [`${v.toLocaleString()}₫`, "Doanh thu"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: "#10b981", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Biểu đồ đơn hàng */}
          <Card>
            <CardHeader>
              <CardTitle icon={<Package className="w-5 h-5 text-blue-600" />}>
                Trạng thái đơn hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={orderData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="status" 
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                  />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="#3b82f6" 
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Thống kê nhanh */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-green-50 border border-green-200">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Đã giao</p>
              <p className="text-3xl font-bold text-green-600">
                {orderData.find(o => o.status === "Đã giao")?.value || 0}
              </p>
            </div>
          </Card>

          <Card className="bg-yellow-50 border border-yellow-200">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Đang xử lý</p>
              <p className="text-3xl font-bold text-yellow-600">
                {orderData.find(o => o.status === "Đang xử lý")?.value || 0}
              </p>
            </div>
          </Card>

          <Card className="bg-red-50 border border-red-200">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Đã hủy</p>
              <p className="text-3xl font-bold text-red-600">
                {orderData.find(o => o.status === "Đã hủy")?.value || 0}
              </p>
            </div>
          </Card>
        </div> */}

      </div>
    </div>
  );
}