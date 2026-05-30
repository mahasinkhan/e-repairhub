import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Truck, Package, CheckCircle, XCircle,
  Clock, TrendingUp, RefreshCw, ArrowRight,
  MapPin, Phone, Calendar,
} from "lucide-react";
import { getMyTasks, getMyStats } from "../../services/delivery.api.js";

const STATUS_CONFIG = {
  pending:     { label: "Pending",     color: "#854d0e", bg: "#fef9c3", border: "#fde047" },
  accepted:    { label: "Accepted",    color: "#1d4ed8", bg: "#dbeafe", border: "#93c5fd" },
  in_progress: { label: "In Progress", color: "#c2410c", bg: "#ffedd5", border: "#fdba74" },
  completed:   { label: "Completed",   color: "#15803d", bg: "#dcfce7", border: "#86efac" },
  failed:      { label: "Failed",      color: "#b91c1c", bg: "#fee2e2", border: "#fca5a5" },
  rejected:    { label: "Rejected",    color: "#475569", bg: "#f1f5f9", border: "#cbd5e1" },
};

function StatusPill({ status }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: "#475569", bg: "#f1f5f9", border: "#cbd5e1" };
  return (
    <span style={{
      padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700,
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
      display: "inline-block",
    }}>
      {cfg.label}
    </span>
  );
}

function TaskCard({ task, onClick }) {
  const isPickup = task.taskType === "pickup";
  return (
    <div onClick={onClick} style={{
      background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16,
      padding: "16px 18px", cursor: "pointer", transition: "all .15s",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    }}
    onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)"}
    onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)"}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 32, height: 32,
            background: isPickup ? "#f5f3ff" : "#ecfdf5",
            borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {isPickup ? <Package size={16} color="#7c3aed" /> : <Truck size={16} color="#059669" />}
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", margin: 0 }}>
              {task.order?.orderNumber}
            </p>
            <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>
              {isPickup ? "↑ Pickup" : "↓ Delivery"}
            </p>
          </div>
        </div>
        <StatusPill status={task.status} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#475569" }}>
          <Phone size={11} color="#94a3b8" />
          <span>{task.order?.customer?.name} · {task.order?.customer?.phone}</span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: 12, color: "#64748b" }}>
          <MapPin size={11} color="#94a3b8" style={{ marginTop: 1, flexShrink: 0 }} />
          <span style={{ lineHeight: 1.4 }}>{task.order?.customer?.address}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b" }}>
          <Package size={11} color="#94a3b8" />
          <span>{task.order?.deviceDetails?.brand} {task.order?.deviceDetails?.model}</span>
        </div>
      </div>

      {task.scheduledTime && (
        <div style={{
          marginTop: 10, paddingTop: 10, borderTop: "1px solid #f1f5f9",
          display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#94a3b8",
        }}>
          <Calendar size={11} />
          Scheduled: {new Date(task.scheduledTime).toLocaleString("en-IN")}
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const user = (() => { try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; } })();

  const [stats, setStats] = useState(null);
  const [activeTasks, setActiveTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, tasks] = await Promise.all([getMyStats(), getMyTasks()]);
      setStats(s);
      setActiveTasks(tasks.filter(t => ["pending", "accepted", "in_progress"].includes(t.status)));
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div style={{ padding: "24px 20px", maxWidth: 900, margin: "0 auto" }}>

      {/* Header banner */}
      <div style={{
        background: "linear-gradient(135deg, #ea580c 0%, #f97316 100%)",
        borderRadius: 18, padding: "20px 24px", marginBottom: 24,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 12,
      }}>
        <div>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, margin: 0 }}>{greeting()}</p>
          <h1 style={{ color: "#fff", fontSize: 20, fontWeight: 800, margin: "4px 0 2px" }}>{user.name ?? "Agent"}</h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, margin: 0 }}>
            {stats?.active ?? 0} active task{stats?.active !== 1 ? "s" : ""} · {stats?.completedToday ?? 0} completed today
          </p>
        </div>
        <button onClick={load} style={{
          background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)",
          borderRadius: 10, padding: "8px 14px", color: "#fff", fontSize: 13,
          fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
        }}>
          <RefreshCw size={14} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
          Refresh
        </button>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Total Tasks",      value: stats?.total     ?? 0, icon: Clock,        color: "#7c3aed", bg: "#f5f3ff" },
          { label: "Active",           value: stats?.active    ?? 0, icon: Truck,        color: "#c2410c", bg: "#fff7ed" },
          { label: "Completed",        value: stats?.completed ?? 0, icon: CheckCircle,  color: "#15803d", bg: "#f0fdf4" },
          { label: "Failed",           value: stats?.failed    ?? 0, icon: XCircle,      color: "#b91c1c", bg: "#fef2f2" },
          { label: "Pickup Tasks",     value: stats?.pickup    ?? 0, icon: Package,      color: "#1d4ed8", bg: "#eff6ff" },
          { label: "Delivery Tasks",   value: stats?.delivery  ?? 0, icon: TrendingUp,   color: "#0e7490", bg: "#ecfeff" },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} style={{
              background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14,
              padding: "14px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}>
              <div style={{ width: 36, height: 36, background: s.bg, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                <Icon size={17} color={s.color} />
              </div>
              <p style={{ fontSize: 22, fontWeight: 800, color: "#1e293b", margin: 0 }}>{loading ? "—" : s.value}</p>
              <p style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Active tasks */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 18, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", margin: 0 }}>Active Tasks</h2>
            <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 3 }}>{activeTasks.length} tasks require your attention</p>
          </div>
          <button onClick={() => navigate("/tasks")} style={{
            display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600,
            color: "#f97316", background: "#fff7ed", border: "1px solid #fed7aa",
            borderRadius: 8, padding: "6px 12px", cursor: "pointer",
          }}>
            View all <ArrowRight size={13} />
          </button>
        </div>

        {loading ? (
          <div style={{ padding: "48px 0", textAlign: "center", color: "#94a3b8" }}>
            <RefreshCw size={20} style={{ animation: "spin 1s linear infinite", marginBottom: 8 }} />
            <p style={{ fontSize: 13 }}>Loading tasks...</p>
          </div>
        ) : activeTasks.length === 0 ? (
          <div style={{ padding: "48px 0", textAlign: "center", color: "#94a3b8" }}>
            <Truck size={36} style={{ opacity: 0.3, marginBottom: 10 }} />
            <p style={{ fontSize: 14, fontWeight: 600, color: "#475569" }}>No active tasks</p>
            <p style={{ fontSize: 12, marginTop: 4 }}>All caught up! Check back later.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14, padding: 16 }}>
            {activeTasks.slice(0, 6).map(task => (
              <TaskCard key={task._id} task={task} onClick={() => navigate("/tasks")} />
            ))}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}