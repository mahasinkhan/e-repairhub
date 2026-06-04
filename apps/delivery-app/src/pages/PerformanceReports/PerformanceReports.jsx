import { useEffect, useState, useCallback } from "react";
import {
  BarChart3, RefreshCw, CheckCircle2, XCircle,
  Truck, Package, TrendingUp, Award, Download, Calendar,
} from "lucide-react";
import * as XLSX from "xlsx";
import { getMyStats, getMyTasks } from "../../services/delivery.api.js";
import "./PerformanceReports.css";

function KpiCard({ label, value, icon: Icon, color, bg, loading }) {
  return (
    <div className="pr-kpi">
      <div className="pr-kpi-icon" style={{ background: bg, color }}>
        <Icon size={17} />
      </div>
      <p className="pr-kpi-val">{loading ? "—" : value}</p>
      <p className="pr-kpi-lbl">{label}</p>
    </div>
  );
}

function RateBar({ label, value, total, color }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="pr-rate-row">
      <div className="pr-rate-head">
        <span className="pr-rate-label">{label}</span>
        <span className="pr-rate-right">
          <strong style={{ color: "#0F172A" }}>{value}</strong>
          <span className="pr-rate-pct">{pct}%</span>
        </span>
      </div>
      <div className="pr-rate-track">
        <div className="pr-rate-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export default function PerformanceReports() {
  const [stats,       setStats]       = useState(null);
  const [tasks,       setTasks]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [monthFilter, setMonthFilter] = useState("All");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, t] = await Promise.all([getMyStats(), getMyTasks()]);
      setStats(s); setTasks(t ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── Month filter ── */
  const availableMonths = ["All", ...Array.from(new Set(
    tasks.map(t => {
      const d = new Date(t.createdAt ?? t.updatedAt);
      return isNaN(d) ? null : d.toLocaleString("en-IN", { month: "short", year: "numeric" });
    }).filter(Boolean)
  )).sort((a, b) => new Date("1 " + b) - new Date("1 " + a))];

  const filtered = monthFilter === "All" ? tasks : tasks.filter(t => {
    const d = new Date(t.createdAt ?? t.updatedAt);
    return !isNaN(d) && d.toLocaleString("en-IN", { month: "short", year: "numeric" }) === monthFilter;
  });

  /* ── Derived stats for selected month ── */
  const filteredStats = {
    total:          filtered.length,
    completed:      filtered.filter(t => t.status === "completed").length,
    active:         filtered.filter(t => ["pending","accepted","in_progress"].includes(t.status)).length,
    failed:         filtered.filter(t => t.status === "failed").length,
    pickup:         filtered.filter(t => t.taskType === "pickup").length,
    delivery:       filtered.filter(t => t.taskType === "delivery").length,
    completedToday: filtered.filter(t => {
      const today = new Date(); today.setHours(0,0,0,0);
      return t.status === "completed" && t.completedAt && new Date(t.completedAt) >= today;
    }).length,
  };

  const rate      = filteredStats.total > 0 ? Math.round((filteredStats.completed / filteredStats.total) * 100) : 0;
  const completed = filtered.filter(t => t.status === "completed");

  /* ── XLSX export ── */
  const exportXLSX = () => {
    const rows = filtered.map(t => ({
      "Order ID":       t.order?.orderNumber ?? t._id,
      "Type":           t.taskType ?? "—",
      "Status":         t.status   ?? "—",
      "Customer Name":  t.order?.customer?.name  ?? "—",
      "Customer Phone": t.order?.customer?.phone ?? "—",
      "Address":        t.order?.customer?.address ?? "—",
      "Device Brand":   t.order?.deviceDetails?.brand ?? "—",
      "Device Model":   t.order?.deviceDetails?.model ?? "—",
      "Service Type":   t.order?.serviceType ?? "—",
      "Price (₹)":      t.order?.price ?? "—",
      "Completed At":   t.completedAt ? new Date(t.completedAt).toLocaleString("en-IN") : "—",
      "Created At":     t.createdAt   ? new Date(t.createdAt).toLocaleString("en-IN")   : "—",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Performance");
    XLSX.writeFile(wb, `performance_${monthFilter.replace(" ","_")}_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  return (
    <div className="pr-root">

      {/* Header */}
      <div className="pr-head">
        <div>
          <h1 className="pr-title">Performance Reports</h1>
          <p className="pr-subtitle">
            {monthFilter === "All" ? "Your delivery performance overview" : `Showing data for ${monthFilter}`}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Month filter */}
          <div className="pr-month-wrap">
            <Calendar size={13} className="pr-month-icon" />
            <select
              className="pr-month-select"
              value={monthFilter}
              onChange={e => setMonthFilter(e.target.value)}
            >
              {availableMonths.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          {/* Export */}
          <button
            className="pr-export-btn"
            onClick={exportXLSX}
            disabled={filtered.length === 0}
            title={`Export ${filtered.length} tasks`}
          >
            <Download size={13} /> Export
          </button>
          <button className="pr-refresh-btn" onClick={load}>
            <RefreshCw size={13} className={loading ? "pr-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* KPI grid */}
      <div className="pr-kpi-grid">
        <KpiCard label="Total Tasks"     value={filteredStats.total          } icon={BarChart3}   color="#7C3AED" bg="#EDE9FE" loading={loading} />
        <KpiCard label="Completed"       value={filteredStats.completed      } icon={CheckCircle2} color="#16A34A" bg="#F0FDF4" loading={loading} />
        <KpiCard label="Active"          value={filteredStats.active         } icon={TrendingUp}   color="#C2410C" bg="#FFF7ED" loading={loading} />
        <KpiCard label="Failed"          value={filteredStats.failed         } icon={XCircle}      color="#B91C1C" bg="#FEF2F2" loading={loading} />
        <KpiCard label="Pickup Tasks"    value={filteredStats.pickup         } icon={Package}      color="#1D4ED8" bg="#EFF6FF" loading={loading} />
        <KpiCard label="Delivery Tasks"  value={filteredStats.delivery       } icon={Truck}        color="#0E7490" bg="#ECFEFF" loading={loading} />
        <KpiCard label="Done Today"      value={filteredStats.completedToday } icon={Award}        color="#B45309" bg="#FEF9C3" loading={loading} />
        <KpiCard label="Success Rate"    value={`${rate}%`}                   icon={TrendingUp}   color="#16A34A" bg="#F0FDF4" loading={loading} />
      </div>

      {/* Completion rate bars */}
      <div className="pr-card">
        <h3 className="pr-card-title">Task Completion Breakdown</h3>
        {loading ? (
          <div className="pr-loading"><RefreshCw size={16} className="pr-spin" /></div>
        ) : filteredStats.total > 0 ? (
          <div className="pr-rates">
            <RateBar label="Completed" value={filteredStats.completed} total={filteredStats.total} color="#22C55E" />
            <RateBar label="Active"    value={filteredStats.active}    total={filteredStats.total} color="#F97316" />
            <RateBar label="Failed"    value={filteredStats.failed}    total={filteredStats.total} color="#EF4444" />
          </div>
        ) : (
          <p className="pr-no-data">No task data{monthFilter !== "All" ? ` for ${monthFilter}` : " yet"}</p>
        )}
      </div>

      {/* Completed tasks table */}
      {completed.length > 0 && (
        <div className="pr-card pr-table-card">
          <h3 className="pr-card-title">
            Completed Tasks ({completed.length}){monthFilter !== "All" ? ` — ${monthFilter}` : ""}
          </h3>
          <div className="pr-table-wrap">
            <table className="pr-table">
              <thead>
                <tr>
                  {["Type", "Order ID", "Customer", "Device", "Service", "Completed"].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {completed.slice(0, 25).map(t => (
                  <tr key={t._id}>
                    <td>
                      <span className={`pr-type-chip ${t.taskType === "pickup" ? "pr-chip-pickup" : "pr-chip-delivery"}`}>
                        {t.taskType === "pickup" ? "↑ Pickup" : "↓ Delivery"}
                      </span>
                    </td>
                    <td className="pr-order-id">{t.order?.orderNumber ?? "—"}</td>
                    <td>{t.order?.customer?.name ?? "—"}</td>
                    <td className="pr-muted">{`${t.order?.deviceDetails?.brand ?? ""} ${t.order?.deviceDetails?.model ?? ""}`.trim() || "—"}</td>
                    <td className="pr-muted">{t.order?.serviceType ?? "—"}</td>
                    <td className="pr-muted pr-date">
                      {t.completedAt ? new Date(t.completedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}
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