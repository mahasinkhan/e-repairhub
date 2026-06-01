import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  RefreshCw, Package, Eye, CheckCircle, XCircle,
  Search, Truck,
} from "lucide-react";
import { getMyOrders, acceptOrder, rejectOrder } from "../services/franchise.api.js";

const TABS = [
  { label: "All",              value: "all"       },
  { label: "New",              value: "assigned"  },
  { label: "Confirmed",        value: "confirmed" },
  { label: "Received",         value: "picked"    },
  { label: "Repairing",        value: "repairing" },
  { label: "Ready for Pickup", value: "completed" },
  { label: "Delivered",        value: "delivered" },
  { label: "Cancelled",        value: "cancelled" },
];

const STATUS_COLORS = {
  assigned:  "bg-orange-100 text-orange-700",
  confirmed: "bg-blue-100 text-blue-700",
  picked:    "bg-cyan-100 text-cyan-700",
  repairing: "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
  delivered: "bg-teal-100 text-teal-700",
  cancelled: "bg-red-100 text-red-700",
  placed:    "bg-slate-100 text-slate-600",
};

function StatusBadge({ status }) {
  const label = status === "completed" ? "Ready for Pickup" : status;
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[status] ?? "bg-slate-100 text-slate-600"}`}>
      {label}
    </span>
  );
}

export default function Orders() {
  const navigate = useNavigate();
  const [orders,       setOrders]       = useState([]);
  const [total,        setTotal]        = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [activeTab,    setActiveTab]    = useState("all");
  const [search,       setSearch]       = useState("");
  const [actionId,     setActionId]     = useState(null);
  const [rejectModal,  setRejectModal]  = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await getMyOrders({ status: activeTab, limit: 50 });
      setOrders(res.orders ?? []);
      setTotal(res.total ?? 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [activeTab]);

  const filtered = search.trim()
    ? orders.filter(o =>
        o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
        o.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
        o.serviceType?.toLowerCase().includes(search.toLowerCase())
      )
    : orders;

  const handleAccept = async (id) => {
    setActionId(id);
    try { await acceptOrder(id); load(); }
    catch (err) { alert(err.message); }
    finally { setActionId(null); }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return alert("Reason is required");
    setActionId(rejectModal);
    try {
      await rejectOrder(rejectModal, rejectReason);
      setRejectModal(null); setRejectReason(""); load();
    } catch (err) { alert(err.message); }
    finally { setActionId(null); }
  };

  return (
    <div className="content-shell p-6 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Orders</h1>
          <p className="text-slate-500 text-sm mt-1">Manage orders assigned to your franchise</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white rounded-xl text-slate-600 text-sm hover:bg-slate-50 transition shadow-sm">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

        {/* Tabs */}
        <div className="border-b border-slate-200 overflow-x-auto">
          <div className="flex px-4 min-w-max">
            {TABS.map(tab => (
              <button key={tab.value} onClick={() => setActiveTab(tab.value)}
                className={`px-4 py-3.5 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                  activeTab === tab.value
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}>
                {tab.label}
                {tab.value === "completed" && (
                  <span className="ml-1.5 bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded-full font-semibold">
                    Assign
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search order, customer, service..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition" />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Package className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">No orders found</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {["Order", "Customer", "Device", "Service Type", "Amount", "Status", "Date", "Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(order => (
                  <tr key={order._id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3.5 font-semibold text-slate-800 whitespace-nowrap font-mono text-xs">
                      {order.orderNumber}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-slate-700">{order.customer?.name}</p>
                      <p className="text-xs text-slate-400">{order.customer?.phone}</p>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">
                      <p>{order.deviceDetails?.brand}</p>
                      <p className="text-xs text-slate-400">{order.deviceDetails?.model}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium whitespace-nowrap">
                        {order.serviceType}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-700 whitespace-nowrap">
                      ₹{Number(order.price).toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3.5"><StatusBadge status={order.status} /></td>
                    <td className="px-4 py-3.5 text-xs text-slate-400 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {["assigned", "placed"].includes(order.status) && (
                          <>
                            <button onClick={() => handleAccept(order._id)} disabled={actionId === order._id}
                              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-green-500 hover:bg-green-600 rounded-lg transition disabled:opacity-50">
                              <CheckCircle className="w-3 h-3" /> Accept
                            </button>
                            <button onClick={() => { setRejectModal(order._id); setRejectReason(""); }}
                              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition">
                              <XCircle className="w-3 h-3" /> Reject
                            </button>
                          </>
                        )}
                        {order.status === "completed" && (
                          <button onClick={() => navigate(`/repair?orderId=${order._id}`)}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition">
                            <Truck className="w-3 h-3" /> Assign Delivery
                          </button>
                        )}
                        <button onClick={() => navigate(`/repair?orderId=${order._id}`)}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition">
                          <Eye className="w-3 h-3" /> View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-4 py-3 border-t border-slate-100">
          <p className="text-xs text-slate-400">Showing {filtered.length} of {total} orders</p>
        </div>
      </div>

      {/* Reject modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Reject Order</h3>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..." rows={3}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 resize-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setRejectModal(null)}
                className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium rounded-lg py-2.5 text-sm transition">Cancel</button>
              <button onClick={handleReject} disabled={!!actionId}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-semibold rounded-lg py-2.5 text-sm transition">Confirm Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}