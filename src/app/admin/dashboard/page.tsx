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
import Link from "next/link";

// 🔹 Card Components
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

function Button({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors ${className}`}
    >
      {children}
    </button>
  );
}

export default function StatisticsDashboard() {
  const [filter, setFilter] = useState<"month" | "year">("month");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [orderData, setOrderData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
        setSelectedMonth(rev[0]?.month || "Jan");
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu thống kê:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const selectedInfo = revenueData.find((item) => item.month === selectedMonth);
  const filteredData =
    filter === "month"
      ? revenueData.filter((item) => item.month === selectedMonth)
      : revenueData;

  if (loading) return <div className="p-10 text-center text-gray-600">Đang tải dữ liệu...</div>;

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-gray-50 min-h-screen">
      {/* Bộ lọc */}
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>📅 Bộ lọc thống kê</CardTitle>

          {/* <Link href="/admin/statistics">
            <Button>Xem chi tiết thống kê</Button>
          </Link> */}
        </CardHeader>
        <CardContent className="flex gap-4 items-center">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="border p-2 rounded-lg shadow-sm"
          >
            <option value="month">Theo tháng</option>
            <option value="year">Theo năm</option>
          </select>

          {filter === "month" && (
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border p-2 rounded-lg shadow-sm"
            >
              {revenueData.map((item) => (
                <option key={item.month} value={item.month}>
                  {item.month}
                </option>
              ))}
            </select>
          )}
        </CardContent>

      </Card>

      {/* Tổng quan */}
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>📊 Thống kê tổng quan</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-green-100 p-4 rounded-2xl text-center">
            <p className="text-lg text-gray-600">Doanh thu</p>
            <p className="text-2xl font-bold text-green-600">
              {filter === "month"
                ? `${selectedInfo?.revenue.toLocaleString()}₫`
                : `${revenueData.reduce((a, b) => a + b.revenue, 0).toLocaleString()}₫`}
            </p>
          </div>
          <div className="bg-blue-100 p-4 rounded-2xl text-center">
            <p className="text-lg text-gray-600">Đơn hàng</p>
            <p className="text-2xl font-bold text-blue-600">
              {orderData.reduce((a, b) => a + b.value, 0)}
            </p>
          </div>
          <div className="bg-yellow-100 p-4 rounded-2xl text-center">
            <p className="text-lg text-gray-600">Sản phẩm nổi bật</p>
            <p className="text-xl font-semibold text-yellow-600">
              {selectedInfo?.bestProduct || "—"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 💰 Biểu đồ doanh thu theo tháng (nâng cấp UI) */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>
            💰 <span>Doanh thu theo tháng</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="h-80 bg-gradient-to-b from-white to-green-50 rounded-2xl p-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
              {/* Lưới nền mờ */}
              <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" opacity={0.6} />

              {/* Trục X và Y rõ ràng */}
              <XAxis dataKey="month" tick={{ fill: "#374151" }} axisLine={{ stroke: "#9ca3af" }} />
              <YAxis
                tickFormatter={(v: number) => `${(v / 1_000_000).toFixed(1)}tr`}
                tick={{ fill: "#374151" }}
                axisLine={{ stroke: "#9ca3af" }}
              />

              {/* Tooltip tinh tế */}
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  borderRadius: "10px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
                labelStyle={{ fontWeight: 600, color: "#111827" }}
                formatter={(v: number) => [`${v.toLocaleString()}₫`, "Doanh thu"]}
              />

              {/* Gradient cho đường biểu đồ */}
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#16a34a" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#bbf7d0" stopOpacity={0.3} />
                </linearGradient>
              </defs>

              {/* Đường biểu đồ */}
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="url(#revenueGradient)"
                strokeWidth={4}
                dot={{ r: 5, fill: "#16a34a", stroke: "#fff", strokeWidth: 2 }}
                activeDot={{ r: 7, stroke: "#16a34a", strokeWidth: 3, fill: "#fff" }}
              />
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
    </div>
  );
}
