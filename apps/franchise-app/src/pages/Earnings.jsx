import { useEffect, useState } from "react";
import { IndianRupee, RefreshCw, TrendingUp, Package, Percent } from "lucide-react";
import { getMyEarnings } from "../services/franchise.api.js";

export default function Earnings() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return (
    <div className="content-shell p-6 flex items-center justify-center py-24 text-slate-400">
      <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading earnings...
    </div>
  );

  return (
    <div className="content-shell p-6 space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Earnings</h1>
          <p className="text-slate-500 text-sm mt-1">Your commission earnings from completed repairs</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white rounded-xl text-slate-600 text-sm hover:bg-slate-50 transition shadow-sm">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: `₹${Number(data?.totalRevenue ?? 0).toLocaleString("en-IN")}`, icon: IndianRupee, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" },
          { label: "Your Commission", value: `₹${Number(data?.totalCommission ?? 0).toLocaleString("en-IN")}`, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50", border: "border-green-100" },
          { label: "Commission Rate", value: `${data?.commissionPercent ?? 0}%`, icon: Percent, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
          { label: "Completed Orders", value: data?.totalOrders ?? 0, icon: Package, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100" },
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
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Earnings Breakdown</h3>
          <p className="text-xs text-slate-400 mt-0.5">Per completed order</p>
        </div>

        {!data?.orders?.length ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <IndianRupee className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">No completed orders yet</p>
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
                {data.orders.map(order => (
                  <tr key={order._id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-3.5 font-semibold text-slate-800">{order.orderNumber}</td>
                    <td className="px-5 py-3.5 text-slate-600">{order.customer?.name}</td>
                    <td className="px-5 py-3.5 text-slate-500">{order.serviceType}</td>
                    <td className="px-5 py-3.5 font-medium text-slate-700">₹{Number(order.price).toLocaleString("en-IN")}</td>
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-green-700">₹{Number(order.commission).toLocaleString("en-IN")}</span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 text-xs">
                      {new Date(order.createdAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 border-t border-slate-200">
                  <td colSpan={3} className="px-5 py-3 text-sm font-semibold text-slate-700">Total</td>
                  <td className="px-5 py-3 font-bold text-slate-800">₹{Number(data.totalRevenue).toLocaleString("en-IN")}</td>
                  <td className="px-5 py-3 font-bold text-green-700">₹{Number(data.totalCommission).toLocaleString("en-IN")}</td>
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