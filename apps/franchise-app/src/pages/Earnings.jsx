import { useEffect, useState, useMemo } from "react";
import { IndianRupee, RefreshCw, TrendingUp, Package, Calendar } from "lucide-react";
import { getMyEarnings } from "../services/franchise.api.js";

const RANGE_OPTIONS = [
  { label: "Today",        value: "today"   },
  { label: "This Week",    value: "week"    },
  { label: "This Month",   value: "month"   },
  { label: "Last 3 Months",value: "3months" },
  { label: "Custom Range", value: "custom"  },
];

function getDateRange(range) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  switch (range) {
    case "today":
      return { from: today, to: now };
    case "week": {
      const d = new Date(today); d.setDate(d.getDate() - 7);
      return { from: d, to: now };
    }
    case "month": {
      const d = new Date(today); d.setDate(1);
      return { from: d, to: now };
    }
    case "3months": {
      const d = new Date(today); d.setMonth(d.getMonth() - 3);
      return { from: d, to: now };
    }
    default: return null;
  }
}

export default function Earnings() {
  const [data,        setData]       = useState(null);
  const [loading,     setLoading]    = useState(true);
  const [range,       setRange]      = useState("month");
  const [customFrom,  setCustomFrom] = useState("");
  const [customTo,    setCustomTo]   = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await getMyEarnings();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Filter orders client-side by date range
  const filteredOrders = useMemo(() => {
    if (!data?.orders) return [];
    let from, to;
    if (range === "custom") {
      if (!customFrom || !customTo) return data.orders;
      from = new Date(customFrom);
      to   = new Date(customTo); to.setHours(23, 59, 59);
    } else {
      const dr = getDateRange(range);
      if (!dr) return data.orders;
      from = dr.from; to = dr.to;
    }
    return data.orders.filter(o => {
      const d = new Date(o.createdAt);
      return d >= from && d <= to;
    });
  }, [data, range, customFrom, customTo]);

  const filteredRevenue    = filteredOrders.reduce((s, o) => s + Number(o.price       ?? 0), 0);
  const filteredCommission = filteredOrders.reduce((s, o) => s + Number(o.commission  ?? 0), 0);

  if (loading) return (
    <div className="content-shell p-6 flex items-center justify-center py-24 text-slate-400">
      <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading earnings...
    </div>
  );

  return (
    <div className="content-shell p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Earnings</h1>
          <p className="text-slate-500 text-sm mt-1">Your commission earnings from completed repairs</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white rounded-xl text-slate-600 text-sm hover:bg-slate-50 transition shadow-sm">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <Calendar className="w-4 h-4" /> Filter by period:
          </div>
          <div className="flex gap-2 flex-wrap">
            {RANGE_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => setRange(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  range === opt.value
                    ? "bg-blue-500 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {range === "custom" && (
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500 font-medium">From:</label>
              <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500 font-medium">To:</label>
              <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
            </div>
          </div>
        )}
      </div>

      {/* Stats — removed commission rate card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Revenue",    value: `₹${filteredRevenue.toLocaleString("en-IN")}`,    icon: IndianRupee, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" },
          { label: "Your Commission",  value: `₹${filteredCommission.toLocaleString("en-IN")}`, icon: TrendingUp,  color: "text-green-600",  bg: "bg-green-50",  border: "border-green-100"  },
          { label: "Completed Orders", value: filteredOrders.length,                             icon: Package,     color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100" },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`bg-white border ${stat.border} rounded-2xl p-5 shadow-sm`}>
              <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
              <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Orders table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-800">Earnings Breakdown</h3>
            <p className="text-xs text-slate-400 mt-0.5">Per completed order · {filteredOrders.length} orders in selected period</p>
          </div>
        </div>

        {!filteredOrders.length ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <IndianRupee className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">No orders in this period</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {["Order", "Customer", "Service", "Revenue", "Commission", "Date"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map(order => (
                  <tr key={order._id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-3.5 font-semibold text-slate-800 font-mono text-xs">{order.orderNumber}</td>
                    <td className="px-5 py-3.5 text-slate-600">{order.customer?.name}</td>
                    <td className="px-5 py-3.5 text-slate-500">{order.serviceType}</td>
                    <td className="px-5 py-3.5 font-medium text-slate-700">₹{Number(order.price).toLocaleString("en-IN")}</td>
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-green-700">₹{Number(order.commission ?? 0).toLocaleString("en-IN")}</span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 text-xs">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 border-t border-slate-200">
                  <td colSpan={3} className="px-5 py-3 text-sm font-semibold text-slate-700">Total</td>
                  <td className="px-5 py-3 font-bold text-slate-800">₹{filteredRevenue.toLocaleString("en-IN")}</td>
                  <td className="px-5 py-3 font-bold text-green-700">₹{filteredCommission.toLocaleString("en-IN")}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}