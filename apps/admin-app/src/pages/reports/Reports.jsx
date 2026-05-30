import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  TrendingUp, ShoppingCart, IndianRupee, CheckCircle,
  XCircle, RefreshCw, Download, Calendar,
} from "lucide-react";
import httpClient from "../../services/httpClient.js";

const COLORS = ["#f97316", "#3b82f6", "#22c55e", "#eab308", "#ef4444", "#8b5cf6"];

const STATUS_LABELS = {
  placed: "New",
  confirmed: "Confirmed",
  assigned: "Assigned",
  picked: "Picked",
  repairing: "Repairing",
  completed: "Completed",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function StatCard({ label, value, icon: Icon, color, bg, border, sub }) {
  return (
    <div className={`bg-white border ${border} rounded-xl p-5 shadow-sm`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-sm text-slate-500 mt-1">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="text-xs">
          {p.name}: {p.name === "Revenue" ? `₹${Number(p.value).toLocaleString("en-IN")}` : p.value}
        </p>
      ))}
    </div>
  );
};

export default function Reports() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("all");

  const loadStats = async () => {
    setLoading(true);
    try {
      const { data } = await httpClient.get("/orders/stats/dashboard");
      setStats(data?.data ?? data);
    } catch {
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStats(); }, [period]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
        Loading reports...
      </div>
    );
  }

  // Build status distribution data for pie chart
  const statusData = stats ? [
    { name: "New", value: stats.newOrders ?? 0 },
    { name: "Ongoing", value: stats.ongoingOrders ?? 0 },
    { name: "Completed", value: stats.completedOrders ?? 0 },
    { name: "Delivered", value: stats.deliveredOrders ?? 0 },
    { name: "Cancelled", value: stats.cancelledOrders ?? 0 },
  ].filter(d => d.value > 0) : [];

  // Build bar chart data from recent orders grouped by status
  const recentOrders = stats?.recentOrders ?? [];

  // Mock monthly trend (replace with real API when available)
  const trendData = [
    { month: "Jan", Orders: 0, Revenue: 0 },
    { month: "Feb", Orders: 0, Revenue: 0 },
    { month: "Mar", Orders: 0, Revenue: 0 },
    { month: "Apr", Orders: 0, Revenue: 0 },
    { month: "May", Orders: stats?.totalOrders ?? 0, Revenue: stats?.totalRevenue ?? 0 },
  ];

  const totalRevenue = stats?.totalRevenue ?? 0;
  const totalOrders = stats?.totalOrders ?? 0;
  const completionRate = totalOrders > 0
    ? Math.round(((stats?.completedOrders ?? 0) + (stats?.deliveredOrders ?? 0)) / totalOrders * 100)
    : 0;
  const cancellationRate = totalOrders > 0
    ? Math.round((stats?.cancelledOrders ?? 0) / totalOrders * 100)
    : 0;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Reports & Analytics</h2>
          <p className="text-slate-500 text-sm mt-1">Business performance overview</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            {["all", "month", "week"].map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  period === p ? "bg-orange-500 text-white" : "text-slate-500 hover:text-slate-700"
                }`}>
                {p === "all" ? "All time" : p === "month" ? "This month" : "This week"}
              </button>
            ))}
          </div>
          <button onClick={loadStats}
            className="flex items-center gap-2 px-3 py-2 border border-slate-200 bg-white rounded-xl text-slate-600 text-sm hover:bg-slate-50 transition shadow-sm">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Revenue"
          value={`₹${totalRevenue.toLocaleString("en-IN")}`}
          icon={IndianRupee} color="text-purple-600" bg="bg-purple-50" border="border-purple-100"
          sub="From paid orders"
        />
        <StatCard
          label="Total Orders"
          value={totalOrders}
          icon={ShoppingCart} color="text-blue-600" bg="bg-blue-50" border="border-blue-100"
          sub={`${stats?.newOrders ?? 0} new`}
        />
        <StatCard
          label="Completion Rate"
          value={`${completionRate}%`}
          icon={CheckCircle} color="text-green-600" bg="bg-green-50" border="border-green-100"
          sub={`${(stats?.completedOrders ?? 0) + (stats?.deliveredOrders ?? 0)} completed`}
        />
        <StatCard
          label="Cancellation Rate"
          value={`${cancellationRate}%`}
          icon={XCircle} color="text-red-500" bg="bg-red-50" border="border-red-100"
          sub={`${stats?.cancelledOrders ?? 0} cancelled`}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Order trend line chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-slate-800">Order Trend</h3>
              <p className="text-xs text-slate-400 mt-0.5">Monthly orders and revenue</p>
            </div>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Line type="monotone" dataKey="Orders" stroke="#f97316" strokeWidth={2} dot={{ fill: "#f97316", r: 4 }} name="Orders" />
              <Line type="monotone" dataKey="Revenue" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: "#8b5cf6", r: 4 }} name="Revenue" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Status distribution pie */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <div className="mb-5">
            <h3 className="font-semibold text-slate-800">Order Status</h3>
            <p className="text-xs text-slate-400 mt-0.5">Distribution by status</p>
          </div>
          {statusData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
              <p className="text-xs">No order data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  paddingAngle={3} dataKey="value">
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Status bar chart + Recent orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Bar chart */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <div className="mb-5">
            <h3 className="font-semibold text-slate-800">Orders by Status</h3>
            <p className="text-xs text-slate-400 mt-0.5">Count per status</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={[
              { name: "New", count: stats?.newOrders ?? 0 },
              { name: "Ongoing", count: stats?.ongoingOrders ?? 0 },
              { name: "Done", count: (stats?.completedOrders ?? 0) + (stats?.deliveredOrders ?? 0) },
              { name: "Cancelled", count: stats?.cancelledOrders ?? 0 },
            ]} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Orders" radius={[6, 6, 0, 0]}>
                {["#f97316", "#3b82f6", "#22c55e", "#ef4444"].map((color, i) => (
                  <Cell key={i} fill={color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent orders table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-800">Recent Orders</h3>
              <p className="text-xs text-slate-400 mt-0.5">Last 5 orders</p>
            </div>
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>
          {recentOrders.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-slate-400 text-sm">
              No orders yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Order</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Customer</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Status</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentOrders.map(order => (
                    <tr key={order._id} className="hover:bg-slate-50 transition">
                      <td className="px-5 py-3.5 font-semibold text-slate-800">
                        {order.orderNumber}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">
                        {order.customer?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                          order.status === "completed" || order.status === "delivered" ? "bg-green-100 text-green-700" :
                          order.status === "cancelled" ? "bg-red-100 text-red-700" :
                          order.status === "repairing" ? "bg-yellow-100 text-yellow-700" :
                          "bg-blue-100 text-blue-700"
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-semibold text-slate-800">
                        ₹{Number(order.price ?? 0).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Summary cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 text-white shadow-sm">
          <p className="text-sm font-medium opacity-90 mb-1">Avg. Order Value</p>
          <p className="text-3xl font-bold">
            ₹{totalOrders > 0 ? Math.round(totalRevenue / totalOrders).toLocaleString("en-IN") : "0"}
          </p>
          <p className="text-xs opacity-70 mt-1">Per order average</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-sm">
          <p className="text-sm font-medium opacity-90 mb-1">Active Orders</p>
          <p className="text-3xl font-bold">{stats?.ongoingOrders ?? 0}</p>
          <p className="text-xs opacity-70 mt-1">Currently in progress</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-sm">
          <p className="text-sm font-medium opacity-90 mb-1">Success Rate</p>
          <p className="text-3xl font-bold">{completionRate}%</p>
          <p className="text-xs opacity-70 mt-1">Orders completed successfully</p>
        </div>
      </div>
    </div>
  );
}