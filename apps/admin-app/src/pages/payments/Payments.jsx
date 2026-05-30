import { useEffect, useState, useCallback } from "react";
import {
  IndianRupee, RefreshCw, CheckCircle, XCircle, Clock,
  Search, CreditCard, Banknote, X, TrendingUp,
  AlertCircle, RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import httpClient from "../../services/httpClient.js";

const STATUS_CONFIG = {
  paid:     { label: "Paid",     color: "text-green-700",  bg: "bg-green-100",  border: "border-green-200",  dot: "bg-green-500"  },
  pending:  { label: "Pending",  color: "text-yellow-700", bg: "bg-yellow-100", border: "border-yellow-200", dot: "bg-yellow-400" },
  failed:   { label: "Failed",   color: "text-red-700",    bg: "bg-red-100",    border: "border-red-200",    dot: "bg-red-500"    },
  refunded: { label: "Refunded", color: "text-slate-600",  bg: "bg-slate-100",  border: "border-slate-200",  dot: "bg-slate-400"  },
};

const METHOD_CONFIG = {
  razorpay: { label: "Razorpay", color: "text-blue-700",   bg: "bg-blue-50",   icon: CreditCard  },
  cash:     { label: "Cash",     color: "text-green-700",  bg: "bg-green-50",  icon: Banknote    },
  manual:   { label: "Manual",   color: "text-purple-700", bg: "bg-purple-50", icon: CheckCircle },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function MethodBadge({ method }) {
  const cfg = METHOD_CONFIG[method] ?? METHOD_CONFIG.manual;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function StatCard({ label, value, icon: Icon, color, bg, border, sub }) {
  return (
    <div className={`bg-white border ${border} rounded-xl p-5 shadow-sm`}>
      <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-sm text-slate-500 mt-1">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function MarkPaidModal({ open, order, onClose, onSuccess }) {
  const [method, setMethod] = useState("manual");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { setMethod("manual"); setNote(""); }, [open]);

  if (!open || !order) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const endpoint = method === "cash" ? "/payments/mark-cash" : "/payments/mark-paid";
      await httpClient.post(endpoint, { orderId: order._id, note });
      toast.success(`Payment marked as ${method === "cash" ? "cash paid" : "paid"}`);
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="font-semibold text-slate-800">Record Payment</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Order: <span className="font-semibold text-orange-500">{order.orderNumber}</span> · ₹{Number(order.price).toLocaleString("en-IN")}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <p className="text-xs text-green-600 font-medium mb-1">Payment Amount</p>
            <p className="text-3xl font-bold text-green-700">₹{Number(order.price).toLocaleString("en-IN")}</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Payment Method</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "manual", label: "Bank/Online", icon: CreditCard, desc: "UPI, bank transfer" },
                { value: "cash",   label: "Cash",        icon: Banknote,   desc: "Physical cash"     },
              ].map(m => {
                const Icon = m.icon;
                return (
                  <label key={m.value} className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition ${method === m.value ? "border-orange-500 bg-orange-50" : "border-slate-200 hover:border-slate-300"}`}>
                    <input type="radio" name="method" value={m.value} checked={method === m.value} onChange={() => setMethod(m.value)} className="sr-only" />
                    <Icon className={`w-5 h-5 ${method === m.value ? "text-orange-500" : "text-slate-400"}`} />
                    <span className={`text-sm font-semibold ${method === m.value ? "text-orange-600" : "text-slate-600"}`}>{m.label}</span>
                    <span className="text-xs text-slate-400">{m.desc}</span>
                  </label>
                );
              })}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Note (optional)</label>
            <input value={note} onChange={e => setNote(e.target.value)}
              placeholder="e.g. UPI ref: 123456789"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition" />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium rounded-xl py-2.5 text-sm transition">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-semibold rounded-xl py-2.5 text-sm transition">
              {saving ? "Recording..." : "Confirm Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RazorpayModal({ open, order, onClose, onSuccess }) {
  const [creating, setCreating] = useState(false);

  useEffect(() => {}, [open]);

  if (!open || !order) return null;

  const handleCreate = async () => {
    setCreating(true);
    try {
      const { data } = await httpClient.post("/payments/create-order", { orderId: order._id });

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        const options = {
          key: data.data.keyId,
          amount: data.data.razorpayOrder.amount,
          currency: "INR",
          name: "E-RepairHub",
          description: `Payment for ${order.orderNumber}`,
          order_id: data.data.razorpayOrder.id,
          prefill: {
            name: order.customer?.name,
            contact: order.customer?.phone,
          },
          theme: { color: "#f97316" },
          handler: async (response) => {
            try {
              await httpClient.post("/payments/verify", {
                razorpayOrderId:   response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              toast.success("Payment successful!");
              onSuccess();
              onClose();
            } catch (err) {
              toast.error("Payment verification failed: " + err.message);
            }
          },
          modal: { ondismiss: () => toast.info("Payment cancelled") },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      };
      document.head.appendChild(script);
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    } finally { setCreating(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="font-semibold text-slate-800">Collect via Razorpay</h3>
            <p className="text-xs text-slate-400 mt-0.5">Order: {order.orderNumber}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
            <p className="text-xs text-blue-600 font-medium mb-1">Amount to Collect</p>
            <p className="text-3xl font-bold text-blue-700">₹{Number(order.price).toLocaleString("en-IN")}</p>
            <p className="text-xs text-blue-500 mt-1">Customer: {order.customer?.name}</p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-sm">
            <p className="text-slate-600">This will open the Razorpay checkout where you can:</p>
            <ul className="text-slate-500 text-xs space-y-1.5 mt-2">
              <li>✅ Accept UPI, cards, net banking</li>
              <li>✅ Payment automatically recorded on success</li>
              <li>✅ Order status updated to paid</li>
            </ul>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium rounded-xl py-2.5 text-sm transition">Cancel</button>
            <button onClick={handleCreate} disabled={creating}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-xl py-2.5 text-sm transition flex items-center justify-center gap-2">
              {creating
                ? <><RefreshCw className="w-4 h-4 animate-spin" /> Creating...</>
                : <><CreditCard className="w-4 h-4" /> Open Razorpay</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RefundModal({ open, payment, onClose, onSuccess }) {
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  if (!open || !payment) return null;

  const handleRefund = async () => {
    setSaving(true);
    try {
      await httpClient.post(`/payments/refund/${payment._id}`, { note });
      toast.success("Payment refunded");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Refund Payment</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
            <p className="text-sm font-semibold text-red-700">₹{Number(payment.amount).toLocaleString("en-IN")}</p>
            <p className="text-xs text-red-500 mt-1">This will mark the payment as refunded</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Refund Reason</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
              placeholder="Reason for refund..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 resize-none transition" />
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium rounded-xl py-2.5 text-sm transition">Cancel</button>
            <button onClick={handleRefund} disabled={saving} className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-semibold rounded-xl py-2.5 text-sm transition">
              {saving ? "Processing..." : "Confirm Refund"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function fmt(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function Payments() {
  const [stats,        setStats]        = useState(null);
  const [payments,     setPayments]     = useState([]);
  const [total,        setTotal]        = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [search,       setSearch]       = useState("");
  const [page,         setPage]         = useState(1);
  const [pendingOrders,  setPendingOrders]  = useState([]);
  const [markPaidModal,  setMarkPaidModal]  = useState({ open: false, order: null });
  const [razorpayModal,  setRazorpayModal]  = useState({ open: false, order: null });
  const [refundModal,    setRefundModal]    = useState({ open: false, payment: null });

  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const { data } = await httpClient.get("/payments/stats");
      setStats(data?.data ?? null);
    } catch {}
    finally { setStatsLoading(false); }
  };

  const loadPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (statusFilter !== "all") params.status = statusFilter;
      if (methodFilter !== "all") params.method = methodFilter;
      if (search.trim()) params.search = search.trim();
      const { data } = await httpClient.get("/payments", { params });
      setPayments(data?.data?.payments ?? []);
      setTotal(data?.data?.total ?? 0);
    } catch {}
    finally { setLoading(false); }
  }, [statusFilter, methodFilter, search, page]);

  const loadPendingOrders = async () => {
    try {
      const { data } = await httpClient.get("/orders", { params: { limit: 50 } });
      const orders = data?.data?.orders ?? [];
      setPendingOrders(orders.filter(o => o.paymentStatus === "pending"));
    } catch {}
  };

  const loadAll = useCallback(async () => {
    await Promise.all([loadStats(), loadPayments(), loadPendingOrders()]);
  }, [loadPayments]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const TABS = [
    { key: "all",      label: "All",      count: total },
    { key: "pending",  label: "Pending",  count: stats?.totalPending  ?? 0 },
    { key: "paid",     label: "Paid",     count: stats?.totalPaid     ?? 0 },
    { key: "failed",   label: "Failed",   count: stats?.totalFailed   ?? 0 },
    { key: "refunded", label: "Refunded", count: stats?.totalRefunded ?? 0 },
  ];

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Payment Management</h2>
          <p className="text-slate-500 text-sm mt-1">Track and manage all payments with Razorpay integration</p>
        </div>
        <button onClick={loadAll}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-medium hover:bg-slate-50 transition shadow-sm">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard label="Total Revenue"  value={`₹${(stats?.totalRevenue   ?? 0).toLocaleString("en-IN")}`} icon={TrendingUp}  color="text-purple-600"  bg="bg-purple-50"  border="border-purple-100"  sub="From paid orders"    />
        <StatCard label="Pending Amount" value={`₹${(stats?.pendingRevenue ?? 0).toLocaleString("en-IN")}`} icon={Clock}       color="text-yellow-600"  bg="bg-yellow-50"  border="border-yellow-100"  sub="Awaiting collection" />
        <StatCard label="Paid"           value={stats?.totalPaid     ?? 0}                                   icon={CheckCircle} color="text-green-600"   bg="bg-green-50"   border="border-green-100"   sub="Successful payments" />
        <StatCard label="Pending"        value={stats?.totalPending  ?? 0}                                   icon={AlertCircle} color="text-orange-600"  bg="bg-orange-50"  border="border-orange-100"  sub="Not yet collected"   />
        <StatCard label="Refunded"       value={stats?.totalRefunded ?? 0}                                   icon={RotateCcw}   color="text-slate-600"   bg="bg-slate-50"   border="border-slate-200"   sub="Returned to customer"/>
      </div>

      {/* Pending Orders */}
      {pendingOrders.length > 0 && (
        <div className="bg-white border border-orange-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-orange-100 bg-orange-50">
            <h3 className="font-semibold text-orange-800 text-sm">⚡ Orders Awaiting Payment</h3>
            <p className="text-xs text-orange-600 mt-0.5">{pendingOrders.length} orders with pending payment</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {["Order", "Customer", "Device", "Amount", "Collect"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingOrders.slice(0, 5).map(order => (
                  <tr key={order._id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-semibold text-slate-800">{order.orderNumber}</td>
                    <td className="px-4 py-3 text-slate-600">{order.customer?.name}</td>
                    <td className="px-4 py-3 text-slate-500">{order.deviceDetails?.model}</td>
                    <td className="px-4 py-3 font-bold text-slate-800">₹{Number(order.price).toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => setRazorpayModal({ open: true, order })}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition">
                          <CreditCard className="w-3 h-3" /> Razorpay
                        </button>
                        <button onClick={() => setMarkPaidModal({ open: true, order })}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition">
                          <Banknote className="w-3 h-3" /> Mark Paid
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment history */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

        {/* Tabs */}
        <div className="border-b border-slate-200 overflow-x-auto">
          <div className="flex min-w-max">
            {TABS.map(tab => (
              <button key={tab.key} onClick={() => { setStatusFilter(tab.key); setPage(1); }}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                  statusFilter === tab.key
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}>
                {tab.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${statusFilter === tab.key ? "bg-orange-100 text-orange-600" : "bg-slate-100 text-slate-500"}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search order, customer, payment ID..."
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-1 focus:ring-orange-400 w-60 transition" />
          </div>
          <select value={methodFilter} onChange={e => { setMethodFilter(e.target.value); setPage(1); }}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-600 focus:outline-none transition">
            <option value="all">All Methods</option>
            <option value="razorpay">Razorpay</option>
            <option value="cash">Cash</option>
            <option value="manual">Manual</option>
          </select>
          <span className="text-xs text-slate-400 ml-auto">{total} total payments</span>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading...
          </div>
        ) : payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <IndianRupee className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm font-medium text-slate-500">No payments found</p>
            <p className="text-xs mt-1 opacity-70">Payments will appear here once orders are paid</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {["Order", "Customer", "Amount", "Method", "Status", "Payment ID", "Date", "Actions"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map(payment => (
                    <tr key={payment._id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3.5 font-bold text-slate-800 whitespace-nowrap">
                        {payment.order?.orderNumber ?? "—"}
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-slate-700">{payment.order?.customer?.name ?? "—"}</p>
                        <p className="text-xs text-slate-400">{payment.order?.customer?.phone}</p>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-800">
                        ₹{Number(payment.amount).toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3.5"><MethodBadge method={payment.method} /></td>
                      <td className="px-4 py-3.5"><StatusBadge status={payment.status} /></td>
                      <td className="px-4 py-3.5 text-xs text-slate-400 font-mono">
                        {payment.razorpayPaymentId
                          ? <span title={payment.razorpayPaymentId}>{payment.razorpayPaymentId.slice(0, 16)}...</span>
                          : payment.note
                          ? <span className="text-slate-500">{payment.note.slice(0, 20)}</span>
                          : "—"
                        }
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-400 whitespace-nowrap">
                        {fmt(payment.paidAt || payment.createdAt)}
                      </td>
                      <td className="px-4 py-3.5">
                        {payment.status === "paid" && (
                          <button onClick={() => setRefundModal({ open: true, payment })}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition whitespace-nowrap">
                            <RotateCcw className="w-3 h-3" /> Refund
                          </button>
                        )}
                        {payment.status === "pending" && (
                          <button onClick={() => setMarkPaidModal({ open: true, order: payment.order })}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition whitespace-nowrap">
                            <CheckCircle className="w-3 h-3" /> Mark Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {total > 15 && (
              <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
                <p className="text-xs text-slate-400">Page {page} of {Math.ceil(total / 15)}</p>
                <div className="flex gap-2">
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                    className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition">
                    Prev
                  </button>
                  <button disabled={page >= Math.ceil(total / 15)} onClick={() => setPage(p => p + 1)}
                    className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition">
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <MarkPaidModal
        open={markPaidModal.open} order={markPaidModal.order}
        onClose={() => setMarkPaidModal({ open: false, order: null })}
        onSuccess={loadAll}
      />
      <RazorpayModal
        open={razorpayModal.open} order={razorpayModal.order}
        onClose={() => setRazorpayModal({ open: false, order: null })}
        onSuccess={loadAll}
      />
      <RefundModal
        open={refundModal.open} payment={refundModal.payment}
        onClose={() => setRefundModal({ open: false, payment: null })}
        onSuccess={loadAll}
      />
    </div>
  );
}