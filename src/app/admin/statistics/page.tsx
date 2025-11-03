"use client";
import React, { useState } from "react";
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

// Dữ liệu doanh thu giả định (nhiều tháng)
const revenueDataByMonth = [
  { month: "Jan", revenue: 12000000, bestProduct: "Áo thun Unisex" },
  { month: "Feb", revenue: 9000000, bestProduct: "Giày Sneaker" },
  { month: "Mar", revenue: 15000000, bestProduct: "Áo khoác da" },
  { month: "Apr", revenue: 18000000, bestProduct: "Quần jean nam" },
  { month: "May", revenue: 20000000, bestProduct: "Đồng hồ nam" },
  { month: "Jun", revenue: 22000000, bestProduct: "Túi xách nữ" },
  { month: "Jul", revenue: 19500000, bestProduct: "Giày thể thao nữ" },
  { month: "Aug", revenue: 23000000, bestProduct: "Áo sơ mi nam" },
  { month: "Sep", revenue: 17500000, bestProduct: "Áo hoodie" },
  { month: "Oct", revenue: 25000000, bestProduct: "Áo polo cao cấp" },
  { month: "Nov", revenue: 21000000, bestProduct: "Balo laptop" },
  { month: "Dec", revenue: 30000000, bestProduct: "Giày sneaker trắng" },
];

const orderData = [
  { status: "Thành công", value: 320 },
  { status: "Đang xử lý", value: 150 },
  { status: "Đã hủy", value: 45 },
];

// Card Components
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white rounded-2xl shadow p-4 ${className}`}>{children}</div>;
}
function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-4 border-b pb-2">{children}</div>;
}
function CardTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-semibold text-gray-800">{children}</h2>;
}
function CardContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

// ✅ Trang thống kê
export default function StatisticsDashboard() {
  const [filter, setFilter] = useState<"month" | "quarter" | "year">("month");
  const [selectedMonth, setSelectedMonth] = useState("Jan");

  // Lọc dữ liệu theo tháng
  const filteredData =
    filter === "month"
      ? revenueDataByMonth.filter((item) => item.month === selectedMonth)
      : revenueDataByMonth;

  const selectedInfo = revenueDataByMonth.find((item) => item.month === selectedMonth);

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-gray-50 min-h-screen">
      {/* Bộ lọc thống kê */}
      <Card className="col-span-1 lg:col-span-3">
        <CardHeader>
          <CardTitle>📅 Bộ lọc thống kê</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4 items-center">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="border p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
          >
            <option value="month">Theo tháng</option>
            <option value="quarter">Theo quý</option>
            <option value="year">Theo năm</option>
          </select>

          {filter === "month" && (
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
            >
              {revenueDataByMonth.map((item) => (
                <option key={item.month} value={item.month}>
                  {item.month}
                </option>
              ))}
            </select>
          )}
        </CardContent>
      </Card>

      {/* Tổng quan */}
      <Card className="col-span-1 lg:col-span-3">
        <CardHeader>
          <CardTitle>📊 Thống kê tổng quan</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-green-100 p-4 rounded-2xl text-center">
            <p className="text-lg font-medium text-gray-600">Doanh thu</p>
            <p className="text-2xl font-bold text-green-600">
              {filter === "month"
                ? `${selectedInfo?.revenue.toLocaleString()}₫`
                : "220.000.000₫"}
            </p>
          </div>
          <div className="bg-blue-100 p-4 rounded-2xl text-center">
            <p className="text-lg font-medium text-gray-600">Đơn hàng</p>
            <p className="text-2xl font-bold text-blue-600">515</p>
          </div>
          <div className="bg-yellow-100 p-4 rounded-2xl text-center">
            <p className="text-lg font-medium text-gray-600">Người dùng mới</p>
            <p className="text-2xl font-bold text-yellow-600">127</p>
          </div>
        </CardContent>
      </Card>

      {/* Biểu đồ doanh thu */}
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>💰 Doanh thu {filter === "month" ? "theo tháng" : "trung bình"}</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => `${value.toLocaleString()}₫`} />
              <Line type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Biểu đồ trạng thái đơn hàng */}
      <Card>
        <CardHeader>
          <CardTitle>📦 Trạng thái đơn hàng</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={orderData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gợi ý sản phẩm nổi bật */}
      <Card className="col-span-1 lg:col-span-3">
        <CardHeader>
          <CardTitle>🏆 Mặt hàng nổi bật</CardTitle>
        </CardHeader>
        <CardContent>
          {filter === "month" && selectedInfo ? (
            <p className="text-lg">
              Trong tháng <b>{selectedMonth}</b>, sản phẩm bán chạy nhất là{" "}
              <span className="font-semibold text-blue-600">{selectedInfo.bestProduct}</span>.
            </p>
          ) : (
            <p className="text-gray-600">Chọn tháng để xem mặt hàng nổi bật.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
