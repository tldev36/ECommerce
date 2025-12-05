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
  Legend,
} from "recharts";
import { CalendarRange, DollarSign, Package, TrendingUp } from "lucide-react";
import OrdersTable from "@/components/admin/OrdersTable";
import { OrderRow } from "@/types";

type TopProd = { product_id: number | null; name: string; quantity: number };
type ChartPoint = { month: string; label: string; revenue: number };

export default function AdminStatisticsPage() {
  // --- STATE ---
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());

  // ✅ CỐ ĐỊNH TRẠNG THÁI LÀ 'completed' (Thanh toán thành công)
  const FIXED_STATUS = "completed";

  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [summary, setSummary] = useState<{
    totalRevenue: number;
    totalOrders: number;
    completedRate: number;
    chartData: ChartPoint[];
    topProducts: TopProd[];
  } | null>(null);

  const [ordersList, setOrdersList] = useState<OrderRow[]>([]);
  const [page, setPage] = useState<number>(1);
  const perPage = 10;
  const [totalOrdersCount, setTotalOrdersCount] = useState<number>(0);

  // --- API CALLS ---

  // 1. Lấy dữ liệu tổng quan & biểu đồ
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          month: String(month),
          year: String(year),
          status: FIXED_STATUS, // ✅ Luôn gửi 'completed'
          search: search || "",
        });
        const res = await fetch(`/api/admin/demochart/revenue?${params.toString()}`);
        const data = await res.json();

        if (data.success) {
          setSummary({
            totalRevenue: data.totalRevenue,
            totalOrders: data.totalOrders,
            completedRate: data.completedRate,
            chartData: data.chartData,
            topProducts: data.topProducts,
          });
        }
      } catch (err) {
        console.error("Fetch summary error", err);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchSummary();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [month, year, search]); // Bỏ dependency 'status' vì nó cố định

  // 2. Lấy danh sách đơn hàng (Table)
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const params = new URLSearchParams({
          month: String(month),
          year: String(year),
          status: FIXED_STATUS, // ✅ Luôn gửi 'completed'
          search: search || "",
          page: String(page),
          perPage: String(perPage),
        });
        const res = await fetch(`/api/admin/demochart/orders?${params.toString()}`);
        const data = await res.json();
        console.log("Fetched orders:", data);
        if (data.success) {
          setOrdersList(data.orders);
          setTotalOrdersCount(data.total || 0);
        } else {
          setOrdersList([]);
          setTotalOrdersCount(0);
        }
      } catch (err) {
        console.error("Fetch orders error", err);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchOrders();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [month, year, search, page]);

  // --- HANDLERS ---
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  // ✅ Đã xóa handleStatusChange vì không còn dùng

  const topProducts = summary?.topProducts ?? [];
  const chartData = summary?.chartData ?? [];
  const totalRevenue = summary?.totalRevenue ?? 0;
  const totalOrders = summary?.totalOrders ?? 0;
  const completedRate = summary?.completedRate ?? 0;

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen font-sans space-y-8">

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp className="text-blue-600" /> Thống kê doanh thu
          </h1>
          <p className="text-sm text-gray-500 mt-1">Chỉ hiển thị các đơn hàng đã thanh toán thành công</p>
        </div>

        {/* TIME FILTER */}
        <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-200 flex items-center gap-3">
          <div className="flex items-center gap-2 px-2">
            <CalendarRange className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Kỳ báo cáo:</span>
          </div>

          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 cursor-pointer hover:bg-gray-100 transition"
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i} value={i + 1}>Tháng {i + 1}</option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 cursor-pointer hover:bg-gray-100 transition"
          >
            {Array.from({ length: 5 }).map((_, i) => {
              const y = new Date().getFullYear() - 2 + i;
              return <option key={y} value={y}>{y}</option>;
            })}
          </select>
        </div>
      </div>

      {/* --- SUMMARY CARDS --- */}
      {/* ... (Giữ nguyên phần Charts & Cards) ... */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Tổng doanh thu</p>
            <h3 className="text-3xl font-bold text-gray-800">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalRevenue)}
            </h3>
          </div>
          <div className="p-4 bg-green-50 rounded-full">
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Đơn thành công</p>
            <h3 className="text-3xl font-bold text-gray-800">{totalOrders}</h3>
          </div>
          <div className="p-4 bg-blue-50 rounded-full">
            <Package className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Tỷ lệ hoàn thành</p>
            <h3 className="text-3xl font-bold text-gray-800">{completedRate}%</h3>
          </div>
          <div className="p-4 bg-yellow-50 rounded-full relative">
            <div className="absolute inset-0 rounded-full border-4 border-yellow-200 opacity-25" />
            <span className="text-lg font-bold text-yellow-600">{completedRate}</span>
          </div>
        </div>
      </div>

      {/* --- CHARTS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
        {/* Left: Line Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Biểu đồ doanh thu thực tế (6 tháng)</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis
                  dataKey="label"
                  tickFormatter={(v) => String(v).split(" ")[0]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  tickFormatter={(v) => `${(Number(v) / 1000000).toFixed(0)}Tr`}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                />
                <Tooltip
                  formatter={(v: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v)}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  name="Doanh thu"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Bar Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top 5 Sản phẩm bán chạy</h3>
          <div className="flex-1 w-full min-h-0">
            {topProducts.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 italic">
                Chưa có dữ liệu
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={100}
                    tick={{ fontSize: 11 }}
                    interval={0}
                  />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar
                    dataKey="quantity"
                    name="Số lượng"
                    fill="#8b5cf6"
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
      {/* --- ORDERS TABLE --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
          <h3 className="text-lg font-semibold text-gray-800">
            Danh sách đơn hàng đã hoàn thành
          </h3>

        </div>

        <OrdersTable
          ordersList={ordersList}
          loading={loading}
          page={page}
          perPage={perPage}
          search={search}
          totalOrdersCount={totalOrdersCount}
          onSearchChange={(v) => handleSearchChange(v)}
          onPageChange={(p) => setPage(p)}
          onView={(order) => console.log("Xem chi tiết", order)}
        />

      </div>


    </div>
  );
}