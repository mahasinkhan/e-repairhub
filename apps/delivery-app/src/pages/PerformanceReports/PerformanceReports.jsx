import { useEffect, useState } from "react";
import { BarChart3, RefreshCw, CheckCircle, XCircle, Truck, Package, TrendingUp } from "lucide-react";
import { getMyTasks, getMyStats } from "../../services/delivery.api.js";

export default function PerformanceReports() {
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [s, t] = await Promise.all([getMyStats(), getMyTasks()]);
      setStats(s);
      setTasks(t);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const successRate = stats?.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const completedTasks = tasks.filter(t => t.status === "completed");

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#1e293b", margin: 0 }}>Performance Reports</h1>
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Your delivery performance overview</p>
        </div>
        <button onClick={load} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#475569", cursor: "pointer" }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, marginBottom: 20 }}>
        {[
          { label: "Total Tasks",    value: stats?.total ?? 0,     icon: BarChart3,    color: "#7c3aed", bg: "#f5f3ff" },
          { label: "Completed",      value: stats?.completed ?? 0,  icon: CheckCircle,  color: "#15803d", bg: "#f0fdf4" },
          { label: "Failed",         value: stats?.failed ?? 0,     icon: XCircle,      color: "#b91c1c", bg: "#fef2f2" },
          { label: "Pickup Tasks",   value: stats?.pickup ?? 0,     icon: Package,      color: "#1d4ed8", bg: "#eff6ff" },
          { label: "Delivery Tasks", value: stats?.delivery ?? 0,   icon: Truck,        color: "#0e7490", bg: "#ecfeff" },
          { label: "Success Rate",   value: `${successRate}%`,      icon: TrendingUp,   color: "#15803d", bg: "#f0fdf4" },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "16px" }}>
              <div style={{ width: 36, height: 36, background: s.bg, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                <Icon size={17} color={s.color} />
              </div>
              <p style={{ fontSize: 22, fontWeight: 800, color: "#1e293b", margin: 0 }}>{loading ? "—" : s.value}</p>
              <p style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Success rate bar */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "20px", marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", marginBottom: 16 }}>Task Completion Rate</h3>
        {[
          { label: "Completed",   value: stats?.completed ?? 0, total: stats?.total ?? 1, color: "#22c55e" },
          { label: "Active",      value: stats?.active ?? 0,    total: stats?.total ?? 1, color: "#f97316" },
          { label: "Failed",      value: stats?.failed ?? 0,    total: stats?.total ?? 1, color: "#ef4444" },
        ].map(item => {
          const pct = item.total > 0 ? Math.round((item.value / item.total) * 100) : 0;
          return (
            <div key={item.label} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b", marginBottom: 5 }}>
                <span>{item.label}</span>
                <span style={{ fontWeight: 700, color: "#1e293b" }}>{item.value} ({pct}%)</span>
              </div>
              <div style={{ height: 8, background: "#f1f5f9", borderRadius: 999, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: item.color, borderRadius: 999, transition: "width .5s ease" }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Completed tasks */}
      {completedTasks.length > 0 && (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", margin: 0 }}>Completed Tasks</h3>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["Type", "Order", "Customer", "Device", "Completed"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {completedTasks.slice(0, 20).map(t => (
                  <tr key={t._id} style={{ borderTop: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "10px 16px" }}>
                      <span style={{ background: t.taskType === "pickup" ? "#f5f3ff" : "#ecfdf5", color: t.taskType === "pickup" ? "#7c3aed" : "#059669", borderRadius: 999, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>
                        {t.taskType === "pickup" ? "↑ Pickup" : "↓ Delivery"}
                      </span>
                    </td>
                    <td style={{ padding: "10px 16px", fontWeight: 700 }}>{t.order?.orderNumber}</td>
                    <td style={{ padding: "10px 16px", color: "#475569" }}>{t.order?.customer?.name}</td>
                    <td style={{ padding: "10px 16px", color: "#64748b" }}>{t.order?.deviceDetails?.model}</td>
                    <td style={{ padding: "10px 16px", color: "#94a3b8", fontSize: 11 }}>
                      {t.completedAt ? new Date(t.completedAt).toLocaleDateString("en-IN") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}