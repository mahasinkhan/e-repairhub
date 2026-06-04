import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Truck, Package, CheckCircle, XCircle,
  Clock, TrendingUp, RefreshCw, ArrowRight,
  MapPin, Phone, Calendar, Navigation, Hash, Zap,
} from "lucide-react";
import { getMyTasks, getMyStats } from "../../services/delivery.api.js";
import "./Dashboard.css";

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
    <span className="dp-pill" style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}>
      {cfg.label}
    </span>
  );
}

function TaskCard({ task, onClick }) {
  const isPickup = task.taskType === "pickup";
  return (
    <div className="dp-task-card" onClick={onClick}>
      <div className="dp-tc-top">
        <div className="dp-tc-identity">
          <div className={`dp-tc-icon ${isPickup ? "tc-pickup" : "tc-delivery"}`}>
            {isPickup ? <Package size={14} /> : <Truck size={14} />}
          </div>
          <div>
            <p className="dp-order-id">{task.order?.orderNumber}</p>
            <p className="dp-task-type">{isPickup ? "↑ Pickup" : "↓ Delivery"}</p>
          </div>
        </div>
        <StatusPill status={task.status} />
      </div>
      <div className="dp-tc-body">
        <div className="dp-tc-row">
          <Phone size={11} className="dp-row-icon" />
          <span>{task.order?.customer?.name} · {task.order?.customer?.phone}</span>
        </div>
        <div className="dp-tc-row">
          <MapPin size={11} className="dp-row-icon" />
          <span>{task.order?.customer?.address}</span>
        </div>
        <div className="dp-tc-row">
          <Package size={11} className="dp-row-icon" />
          <span>{task.order?.deviceDetails?.brand} {task.order?.deviceDetails?.model}</span>
        </div>
      </div>
      {task.scheduledTime && (
        <div className="dp-tc-scheduled">
          <Calendar size={11} />
          Scheduled: {new Date(task.scheduledTime).toLocaleString("en-IN")}
        </div>
      )}
      <div className="dp-tc-footer">
        <button className="dp-tc-btn dp-tc-btn--ghost">View details</button>
        <button className="dp-tc-btn dp-tc-btn--primary">
          <Navigation size={11} /> Navigate
        </button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const user = (() => { try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; } })();

  const [stats,       setStats]       = useState(null);
  const [activeTasks, setActiveTasks] = useState([]);
  const [loading,     setLoading]     = useState(true);

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

  const successRate = stats?.total > 0
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  const STATS = [
    { label: "Total Tasks",    value: stats?.total     ?? 0, icon: Hash,        variant: "purple" },
    { label: "Active",         value: stats?.active    ?? 0, icon: Zap,         variant: "orange" },
    { label: "Completed",      value: stats?.completed ?? 0, icon: CheckCircle, variant: "green"  },
    { label: "Failed",         value: stats?.failed    ?? 0, icon: XCircle,     variant: "red"    },
    { label: "Pickup Tasks",   value: stats?.pickup    ?? 0, icon: Package,     variant: "blue"   },
    { label: "Delivery Tasks", value: stats?.delivery  ?? 0, icon: Truck,       variant: "teal"   },
  ];

  return (
    <div className="dp-root">

      {/* ── Banner ── */}
      <div className="dp-banner">
        <div className="dp-banner-body">

          {/* Left: greeting + name */}
          <div className="dp-banner-left">
            <p className="dp-banner-greeting">{greeting()} ☀️</p>
            <h1 className="dp-banner-name">{user.name ?? "Agent"}</h1>

            {/* Inline KPI strip */}
            <div className="dp-banner-kpis">
              <div className="dp-kpi">
                <strong>{stats?.active ?? 0}</strong>
                <span>Active</span>
              </div>
              <div className="dp-kpi-div" />
              <div className="dp-kpi">
                <strong>{stats?.completedToday ?? 0}</strong>
                <span>Done today</span>
              </div>
              <div className="dp-kpi-div" />
              <div className="dp-kpi">
                <strong>{loading ? "—" : `${successRate}%`}</strong>
                <span>Success rate</span>
              </div>
            </div>
          </div>

          {/* Right: action buttons */}
          <div className="dp-banner-actions">
            <button onClick={load} className="dp-banner-btn">
              <RefreshCw size={13} className={loading ? "dp-spin" : ""} />
              Refresh
            </button>
            <button className="dp-banner-btn dp-banner-btn--solid" onClick={() => navigate("/tasks")}>
              <Navigation size={13} />
              My Tasks
            </button>
          </div>

        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="dp-stats-grid">
        {STATS.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`dp-stat dp-stat--${s.variant}`}>
              <div className="dp-stat-icon-wrap">
                <Icon size={18} />
              </div>
              <div className="dp-stat-body">
                <p className="dp-stat-value">{loading ? "—" : s.value}</p>
                <p className="dp-stat-label">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Active Tasks ── */}
      <div className="dp-tasks-section">
        <div className="dp-section-head">
          <div>
            <h2 className="dp-section-title">Active Tasks</h2>
            <p className="dp-section-sub">
              {activeTasks.length} task{activeTasks.length !== 1 ? "s" : ""} require your attention
            </p>
          </div>
          <button onClick={() => navigate("/tasks")} className="dp-view-all-btn">
            View all <ArrowRight size={13} />
          </button>
        </div>

        {loading ? (
          <div className="dp-state-center">
            <div className="dp-spinner-ring" />
            <p>Loading tasks…</p>
          </div>
        ) : activeTasks.length === 0 ? (
          <div className="dp-state-center">
            <div className="dp-empty-icon-wrap"><Truck size={28} /></div>
            <p className="dp-empty-title">No active tasks</p>
            <span className="dp-empty-sub">All caught up — check back later</span>
          </div>
        ) : (
          <div className="dp-task-grid">
            {activeTasks.slice(0, 6).map(task => (
              <TaskCard key={task._id} task={task} onClick={() => navigate("/tasks")} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}