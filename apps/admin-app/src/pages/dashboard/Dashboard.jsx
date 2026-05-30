import { useEffect, useState } from "react";
import {
  ShoppingCart, Clock, Wrench, CheckCircle,
  XCircle, IndianRupee, Eye, ArrowRight, RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../features/auth/auth.store.js";
import { getDashboardStatsApi } from "../../features/orders/orders.api.js";

const FALLBACK_STATS = {
  totalOrders: 0, newOrders: 0, ongoingOrders: 0,
  completedOrders: 0, cancelledOrders: 0, totalRevenue: 0,
  recentOrders: [], franchiseSummary: [], deliverySummary: [],
};

const franchiseSummary = [
  { name: "Delhi Central", active: 12, completed: 98 },
  { name: "Mumbai West", active: 8, completed: 74 },
  { name: "Bangalore Tech", active: 15, completed: 112 },
];

const deliverySummary = [
  { name: "Arun Das", tasks: 4, completed: 22 },
  { name: "Suresh Yadav", tasks: 2, completed: 18 },
  { name: "Mohan Lal", tasks: 6, completed: 31 },
];

const STATUS_CLASS = {
  placed:    "text-orange-700 bg-orange-100",
  confirmed: "text-blue-700 bg-blue-100",
  assigned:  "text-indigo-700 bg-indigo-100",
  repairing: "text-yellow-700 bg-yellow-100",
  completed: "text-green-700 bg-green-100",
  delivered: "text-teal-700 bg-teal-100",
  cancelled: "text-red-700 bg-red-100",
};

export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState(FALLBACK_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStatsApi()
      .then(setStats)
      .catch(() => setStats(FALLBACK_STATS))
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: "Total Orders", value: stats.totalOrders, icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
    { label: "New Orders", value: stats.newOrders, icon: Clock, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100" },
    { label: "Ongoing", value: stats.ongoingOrders, icon: Wrench, color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-100" },
    { label: "Completed", value: stats.completedOrders, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50", border: "border-green-100" },
    { label: "Cancelled", value: stats.cancelledOrders, icon: XCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-100" },
    { label: "Total Revenue", value: `₹${Number(stats.totalRevenue).toLocaleString("en-IN")}`, icon: IndianRupee, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">
          Welcome back, {user?.name || user?.username || "Admin"} 👋
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Here's what's happening with your repair business today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`bg-white border ${stat.border} rounded-xl p-4 shadow-sm`}>
              <div className={`w-9 h-9 ${stat.bg} rounded-lg flex items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              {loading
                ? <div className="h-7 w-16 bg-slate-100 rounded animate-pulse mb-1" />
                : <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
              }
              <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">Recent Orders</h3>
            <button
              onClick={() => navigate("/orders")}
              className="text-orange-500 text-sm hover:text-orange-600 transition flex items-center gap-1 font-medium"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Loading...
            </div>
          ) : stats.recentOrders.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-slate-400 text-sm">
              No orders yet
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {stats.recentOrders.map((order) => (
                <div key={order._id} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 transition">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{order.orderNumber}</p>
                    <p className="text-xs text-slate-500">{order.customer?.name}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_CLASS[order.status] ?? "bg-slate-100 text-slate-600"}`}>
                      {order.status}
                    </span>
                    <span className="text-sm font-semibold text-slate-700 w-20 text-right">
                      ₹{order.price}
                    </span>
                    <button
                      onClick={() => navigate(`/orders/${order._id}`)}
                      className="text-slate-400 hover:text-orange-500 transition"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">Franchise Summary</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {franchiseSummary.map((f) => (
                <div key={f.name} className="px-6 py-3.5">
                  <p className="text-sm font-medium text-slate-800 mb-1.5">{f.name}</p>
                  <div className="flex gap-4 text-xs">
                    <span className="text-orange-600 font-medium">{f.active} active</span>
                    <span className="text-green-600 font-medium">{f.completed} completed</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">Delivery Summary</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {deliverySummary.map((d) => (
                <div key={d.name} className="px-6 py-3.5">
                  <p className="text-sm font-medium text-slate-800 mb-1.5">{d.name}</p>
                  <div className="flex gap-4 text-xs">
                    <span className="text-yellow-600 font-medium">{d.tasks} active</span>
                    <span className="text-green-600 font-medium">{d.completed} completed</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}