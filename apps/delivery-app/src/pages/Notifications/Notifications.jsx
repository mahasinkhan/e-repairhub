import { useEffect, useState, useCallback } from "react";
import {
  Bell, RefreshCw, Check, Trash2,
  Package, Truck, CheckCircle2, AlertCircle,
} from "lucide-react";
import { getMyTasks } from "../../services/delivery.api.js";
import "./Notifications.css";

const TYPE_CONFIG = {
  pickup:    { label: "Pickup Task",    Icon: Package,       color: "#7C3AED", bg: "#EDE9FE" },
  delivery:  { label: "Delivery Task",  Icon: Truck,         color: "#059669", bg: "#ECFDF5" },
  completed: { label: "Task Completed", Icon: CheckCircle2,  color: "#16A34A", bg: "#F0FDF4" },
  failed:    { label: "Task Failed",    Icon: AlertCircle,   color: "#B91C1C", bg: "#FEF2F2" },
};

function timeAgo(ts) {
  const d = (Date.now() - new Date(ts)) / 1000;
  if (d < 60)    return "Just now";
  if (d < 3600)  return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function buildNotifs(tasks) {
  return tasks.map(t => ({
    id:      t._id,
    type:    t.status === "completed" ? "completed"
           : t.status === "failed"    ? "failed"
           : t.taskType === "pickup"  ? "pickup"
           : "delivery",
    title:   t.status === "completed" ? "Task Completed ✓"
           : t.status === "failed"    ? "Task Failed"
           : t.taskType === "pickup"  ? "Pickup Task Assigned"
           : "Delivery Task Assigned",
    message: `${t.order?.orderNumber ?? "—"} · ${t.order?.customer?.name ?? "—"} · ${t.order?.deviceDetails?.brand ?? ""} ${t.order?.deviceDetails?.model ?? ""}`.trim(),
    time:    t.updatedAt ?? t.createdAt,
    read:    ["completed", "failed"].includes(t.status),
  }));
}

const FILTERS = ["All", "Unread", "Pickup", "Delivery", "Completed"];

export default function Notifications() {
  const [notifs,  setNotifs]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("All");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const tasks = await getMyTasks();
      setNotifs(buildNotifs(tasks ?? []));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const markRead    = id  => setNotifs(p => p.map(n => n.id === id ? { ...n, read: true } : n));
  const markAll     = ()  => setNotifs(p => p.map(n => ({ ...n, read: true })));
  const remove      = id  => setNotifs(p => p.filter(n => n.id !== id));

  const unread = notifs.filter(n => !n.read).length;

  const filtered = notifs.filter(n => {
    if (filter === "Unread")    return !n.read;
    if (filter === "Pickup")    return n.type === "pickup";
    if (filter === "Delivery")  return n.type === "delivery";
    if (filter === "Completed") return n.type === "completed";
    return true;
  });

  return (
    <div className="nf-root">

      {/* Header */}
      <div className="nf-header">
        <div className="nf-header-left">
          <div className="nf-header-icon"><Bell size={18} /></div>
          <div>
            <div className="nf-title-row">
              <h1 className="nf-title">Notifications</h1>
              {unread > 0 && <span className="nf-badge">{unread}</span>}
            </div>
            <p className="nf-subtitle">Task alerts and status updates</p>
          </div>
        </div>
        <div className="nf-header-actions">
          <button className="nf-icon-btn" onClick={load} title="Refresh">
            <RefreshCw size={14} className={loading ? "nf-spin" : ""} />
          </button>
          {unread > 0 && (
            <button className="nf-mark-btn" onClick={markAll}>
              <Check size={13} /> Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Filter pills */}
      <div className="nf-filters">
        {FILTERS.map(f => {
          const count = f === "Unread" ? unread
                      : f === "All"   ? notifs.length
                      : notifs.filter(n => n.type === f.toLowerCase()).length;
          return (
            <button key={f}
              className={`nf-pill ${filter === f ? "nf-pill-active" : ""}`}
              onClick={() => setFilter(f)}>
              {f}
              {count > 0 && <span className="nf-pill-count">{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="nf-list">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="nf-skeleton">
              <div className="nf-skel nf-skel-icon" />
              <div className="nf-skel-body">
                <div className="nf-skel nf-skel-title" />
                <div className="nf-skel nf-skel-msg" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Notification list */}
      {!loading && filtered.length === 0 && (
        <div className="nf-empty">
          <div className="nf-empty-icon"><Bell size={28} /></div>
          <p className="nf-empty-title">No notifications</p>
          <span className="nf-empty-sub">
            {filter !== "All" ? `No ${filter.toLowerCase()} notifications` : "You're all caught up!"}
          </span>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="nf-list">
          {filtered.map(n => {
            const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.delivery;
            const { Icon } = cfg;
            return (
              <div key={n.id} className={`nf-card ${n.read ? "" : "nf-card-unread"}`}>
                {/* Unread stripe */}
                {!n.read && <div className="nf-unread-stripe" />}

                <div className="nf-card-icon" style={{ background: cfg.bg, color: cfg.color }}>
                  <Icon size={16} />
                </div>

                <div className="nf-card-body">
                  <div className="nf-card-top">
                    <span className="nf-card-title">{n.title}</span>
                    <span className="nf-card-time">{timeAgo(n.time)}</span>
                  </div>
                  <p className="nf-card-msg">{n.message}</p>
                </div>

                <div className="nf-card-actions">
                  {!n.read && (
                    <button className="nf-action-btn nf-check" onClick={() => markRead(n.id)} title="Mark read">
                      <Check size={13} />
                    </button>
                  )}
                  <button className="nf-action-btn nf-del" onClick={() => remove(n.id)} title="Dismiss">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}