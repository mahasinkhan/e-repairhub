import { useEffect, useState } from "react";
import {
  TrendingUp, Package, CheckCircle, XCircle,
  IndianRupee, RefreshCw, BarChart3, Wrench,
} from "lucide-react";
import { getMyStats, getMyEarnings } from "../services/franchise.api.js";

function StatCard({ label, value, icon: Icon, color, bg, border, sub }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${border}`, borderRadius: 16, padding: "20px 22px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
      <div style={{ width: 42, height: 42, background: bg, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
        <Icon size={20} color={color} />
      </div>
      <p style={{ fontSize: 26, fontWeight: 800, color: "#1e293b", margin: 0 }}>{value}</p>
      <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{label}</p>
      {sub && <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{sub}</p>}
    </div>
  );
}

function ProgressBar({ label, value, max, color }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: "#475569" }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{value} <span style={{ fontWeight: 400, color: "#94a3b8" }}>({pct}%)</span></span>
      </div>
      <div style={{ height: 8, background: "#f1f5f9", borderRadius: 999, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 999, transition: "width .5s ease" }} />
      </div>
    </div>
  );
}

export default function Reports() {
  const [stats, setStats] = useState(null);
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [s, e] = await Promise.all([getMyStats(), getMyEarnings()]);
      setStats(s);
      setEarnings(e);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return (
    <div className="content-shell" style={{ padding: 28, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300, gap: 10, color: "#94a3b8" }}>
      <RefreshCw size={18} style={{ animation: "spin 1s linear infinite" }} />
      <span style={{ fontSize: 14 }}>Loading reports...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const total = stats?.totalOrders ?? 0;
  const pending = stats?.pendingOrders ?? 0;
  const inRepair = stats?.inRepair ?? 0;
  const completed = stats?.completedOrders ?? 0;
  const delivered = stats?.deliveredOrders ?? 0;
  const cancelled = stats?.cancelledOrders ?? 0;
  const revenue = stats?.totalRevenue ?? 0;
  const commission = stats?.commission ?? 0;
  const commissionPct = stats?.commissionPercent ?? 0;
  const avgOrder = total > 0 ? Math.round(revenue / total) : 0;
  const successRate = total > 0 ? Math.round(((completed + delivered) / total) * 100) : 0;

  return (
    <div className="content-shell" style={{ padding: "24px 28px" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1e293b", margin: 0 }}>Reports & Analytics</h1>
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
            {stats?.franchise?.name ?? "Your franchise"} · Performance overview
          </p>
        </div>
        <button onClick={load} style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10,
          padding: "8px 16px", fontSize: 13, fontWeight: 600, color: "#475569",
          cursor: "pointer",
        }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 28 }}>
        <StatCard label="Total Orders"    value={total}     icon={Package}     color="#1d4ed8" bg="#eff6ff" border="#bfdbfe" sub="All time" />
        <StatCard label="Completed"       value={completed + delivered} icon={CheckCircle} color="#15803d" bg="#f0fdf4" border="#bbf7d0" sub="Completed + Delivered" />
        <StatCard label="Cancelled"       value={cancelled} icon={XCircle}     color="#b91c1c" bg="#fef2f2" border="#fecaca" sub="Rejected orders" />
        <StatCard label="Success Rate"    value={`${successRate}%`} icon={TrendingUp} color="#7c3aed" bg="#f5f3ff" border="#ddd6fe" sub="Completion rate" />
        <StatCard label="Total Revenue"   value={`₹${revenue.toLocaleString("en-IN")}`} icon={IndianRupee} color="#0e7490" bg="#ecfeff" border="#a5f3fc" sub="From paid orders" />
        <StatCard label="Your Commission" value={`₹${commission.toLocaleString("en-IN")}`} icon={BarChart3} color="#854d0e" bg="#fefce8" border="#fef08a" sub={`${commissionPct}% rate`} />
      </div>

      {/* Two column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 24 }}>

        {/* Order status breakdown */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "22px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", marginBottom: 20 }}>Order Status Breakdown</h3>
          <ProgressBar label="Pending / New"  value={pending}   max={total} color="#f97316" />
          <ProgressBar label="In Repair"      value={inRepair}  max={total} color="#3b82f6" />
          <ProgressBar label="Completed"      value={completed} max={total} color="#22c55e" />
          <ProgressBar label="Delivered"      value={delivered} max={total} color="#0d9488" />
          <ProgressBar label="Cancelled"      value={cancelled} max={total} color="#ef4444" />
        </div>

        {/* Earnings summary */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "22px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", marginBottom: 20 }}>Earnings Summary</h3>
          {[
            { label: "Total Revenue",    value: `₹${revenue.toLocaleString("en-IN")}`,    color: "#0e7490" },
            { label: "Your Commission",  value: `₹${commission.toLocaleString("en-IN")}`, color: "#15803d" },
            { label: "Commission Rate",  value: `${commissionPct}%`,                      color: "#7c3aed" },
            { label: "Avg Order Value",  value: `₹${avgOrder.toLocaleString("en-IN")}`,   color: "#854d0e" },
            { label: "Paid Orders",      value: earnings?.totalOrders ?? 0,               color: "#1d4ed8" },
          ].map(row => (
            <div key={row.label} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "10px 0", borderBottom: "1px solid #f1f5f9",
            }}>
              <span style={{ fontSize: 13, color: "#64748b" }}>{row.label}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: row.color }}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent earnings table */}
      {earnings?.orders?.length > 0 && (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ padding: "18px 22px", borderBottom: "1px solid #f1f5f9" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", margin: 0 }}>Recent Completed Orders</h3>
            <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>Orders that generated commission</p>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["Order", "Customer", "Device", "Revenue", "Commission", "Date"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "10px 18px", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {earnings.orders.slice(0, 10).map(o => (
                  <tr key={o._id} style={{ borderTop: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 18px", fontWeight: 700, color: "#1e293b", whiteSpace: "nowrap" }}>{o.orderNumber}</td>
                    <td style={{ padding: "12px 18px", color: "#475569" }}>{o.customer?.name}</td>
                    <td style={{ padding: "12px 18px", color: "#64748b" }}>{o.deviceDetails?.model ?? "—"}</td>
                    <td style={{ padding: "12px 18px", fontWeight: 600, color: "#1e293b" }}>₹{Number(o.price).toLocaleString("en-IN")}</td>
                    <td style={{ padding: "12px 18px" }}>
                      <span style={{ fontWeight: 700, color: "#15803d" }}>₹{Number(o.commission).toLocaleString("en-IN")}</span>
                    </td>
                    <td style={{ padding: "12px 18px", color: "#94a3b8", fontSize: 12 }}>{new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}