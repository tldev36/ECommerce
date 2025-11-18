"use client";

import React, { useEffect, useMemo, useState } from "react";
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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBoxOpen,
    faEdit,
    faTrash,
    faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { Download, Loader2 } from "lucide-react";

type TopProd = { product_id: number | null; name: string; quantity: number };
type ChartPoint = { month: string; label: string; revenue: number };
type OrderRow = {
    id: number;
    order_code: string;
    customer: string;
    created_at: string;
    amount: number;
    status: string;
    payment_method: string;
};

export default function AdminStatisticsPage() {
    const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [status, setStatus] = useState<string>("all");
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
    const perPage = 20;
    const [totalOrdersCount, setTotalOrdersCount] = useState<number>(0);

    // Fetch summary (revenue & top products)
    useEffect(() => {
        const fetchSummary = async () => {
            try {
                setLoading(true);
                const params = new URLSearchParams({
                    month: String(month),
                    year: String(year),
                    status,
                    search,
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
                } else {
                    setSummary(null);
                }
            } catch (err) {
                console.error("fetch summary error", err);
                setSummary(null);
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, [month, year, status, search]);

    // Fetch orders table
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const params = new URLSearchParams({
                    month: String(month),
                    year: String(year),
                    status,
                    search,
                    page: String(page),
                    perPage: String(perPage),
                });
                const res = await fetch(`/api/admin/demochart/orders?${params.toString()}`);
                const data = await res.json();
                if (data.success) {
                    setOrdersList(data.orders);
                    setTotalOrdersCount(data.total || 0);
                } else {
                    setOrdersList([]);
                    setTotalOrdersCount(0);
                }
            } catch (err) {
                console.error("fetch orders error", err);
                setOrdersList([]);
                setTotalOrdersCount(0);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [month, year, status, search, page]);

    const topProducts = summary?.topProducts ?? [];
    const chartData = summary?.chartData ?? [];

    // Derived metrics for cards
    const totalRevenue = summary?.totalRevenue ?? 0;
    const totalOrders = summary?.totalOrders ?? 0;
    const completedRate = summary?.completedRate ?? 0;

    // Excel export placeholder
    const onExportExcel = () => {
        alert("Xuất Excel sẽ được triển khai sau (hiện đang là demo).");
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">📈 Thống kê doanh thu</h1>

                <div className="flex items-center gap-3">
                    <button
                        onClick={onExportExcel}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                        title="Xuất Excel (demo)"
                    >
                        <Download size={16} /> Xuất Excel
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow p-4 mb-6 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                    {/* <label className="text-sm text-gray-600">Tháng</label> */}
                    <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="border p-2 rounded-lg">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <option key={i} value={i + 1}>
                                Tháng {i + 1}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    {/* <label className="text-sm text-gray-600">Năm</label> */}
                    <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="border p-2 rounded-lg">
                        {Array.from({ length: 5 }).map((_, i) => {
                            const y = new Date().getFullYear() - 2 + i;
                            return (
                                <option key={y} value={y}>
                                    {y}
                                </option>
                            );
                        })}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    {/* <label className="text-sm text-gray-600">Trạng thái</label> */}
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="border p-2 rounded-lg">
                        <option value="all">Tất cả</option>
                        <option value="pending">Chờ xử lý</option>
                        <option value="processing">Đang xử lý</option>
                        <option value="completed">Hoàn thành</option>
                        <option value="cancelled">Đã hủy</option>
                    </select>
                </div>

                <div className="flex-1 flex items-center gap-2">
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Tìm kiếm mã đơn / địa chỉ / khách hàng..."
                        className="border p-2 rounded-lg w-120"
                    />
                    <button
                        onClick={() => {
                            setSearch("");
                            setPage(1);
                        }}
                        className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                    >
                        Làm mới
                    </button>
                </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow p-4 text-center">
                    <div className="text-sm text-gray-500">Tổng doanh thu (kỳ chọn)</div>
                    <div className="text-2xl font-bold text-green-700">{totalRevenue.toLocaleString()}₫</div>
                </div>
                <div className="bg-white rounded-xl shadow p-4 text-center">
                    <div className="text-sm text-gray-500">Tổng số đơn</div>
                    <div className="text-2xl font-bold text-blue-700">{totalOrders}</div>
                </div>
                <div className="bg-white rounded-xl shadow p-4 text-center">
                    <div className="text-sm text-gray-500">Tỷ lệ hoàn thành</div>
                    <div className="text-2xl font-bold text-yellow-700">{completedRate}%</div>
                </div>
            </div>

            {/* Charts area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2 bg-white rounded-2xl shadow p-4 h-80">
                    <div className="mb-2 font-semibold">Doanh thu (6 tháng gần nhất)</div>
                    <div className="h-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="label" tickFormatter={(v) => String(v).split(" ")[0]} />
                                <YAxis tickFormatter={(v) => `${(Number(v) / 1_000_000).toFixed(1)}tr`} />
                                <Tooltip formatter={(v: number) => `${v.toLocaleString()}₫`} />
                                <Line type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={3} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow p-4 h-80">
                    <div className="mb-2 font-semibold">Top sản phẩm (số lượng)</div>
                    <div className="h-full overflow-auto">
                        {topProducts.length === 0 ? (
                            <div className="text-gray-500">Không có dữ liệu</div>
                        ) : (
                            <BarChart width={300} height={220} data={topProducts}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="quantity" fill="#3b82f6" />
                            </BarChart>
                        )}
                    </div>
                </div>
            </div>

            {/* Orders table */}
            <div className="bg-white rounded-2xl shadow overflow-x-auto">
                {loading ? (
                    <div className="p-8 text-center text-gray-500 flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin" /> Đang tải...
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-blue-200">
                            <tr>
                                <th className="p-3 text-center w-16">#</th>
                                <th className="p-3 text-left">Mã đơn</th>
                                <th className="p-3 text-left">Ngày</th>
                                <th className="p-3 text-right">Tổng tiền</th>
                                <th className="p-3 text-center">Trạng thái</th>
                                {/* <th className="p-3 text-center">Thanh toán</th> */}
                                <th className="p-3 text-center">Hành động</th>

                            </tr>
                        </thead>
                        <tbody>
                            {ordersList.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-6 text-center text-gray-500">
                                        Không có đơn hàng
                                    </td>
                                </tr>
                            ) : (
                                ordersList.map((o, index) => (
                                    <tr key={o.id} className="hover:bg-gray-50">
                                        <td className="p-3 text-center font-medium">
                                            {(page - 1) * perPage + index + 1}
                                        </td>
                                        <td className="p-3 font-medium">{o.order_code}</td>
                                        <td className="p-3">{new Date(o.created_at).toLocaleString()}</td>
                                        <td className="p-3 text-right">{o.amount.toLocaleString()}₫</td>
                                        <td className="p-3 text-center">
                                            {o.status === "completed"
                                                ? "Hoàn thành"
                                                : o.status === "pending"
                                                    ? "Đang xử lý"
                                                    : o.status === "waiting_payment"
                                                        ? "Chờ thanh toán"
                                                        : "Không xác định"}
                                        </td>
                                        <td className="p-3 text-center">

                                            {/* 👁 Xem chi tiết */}
                                            <button
                                                title="Xem chi tiết"
                                                onClick={() => {
                                                }}
                                                className="text-blue-600 hover:text-blue-800 transition"
                                            >
                                                <FontAwesomeIcon icon={faBoxOpen} />
                                            </button>
                                            
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-600">
                    Tổng: {totalOrdersCount} đơn
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1 rounded border disabled:opacity-50"
                    >
                        Prev
                    </button>
                    <div className="px-3 py-1 border rounded">{page}</div>
                    <button
                        onClick={() => setPage((p) => p + 1)}
                        className="px-3 py-1 rounded border"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
