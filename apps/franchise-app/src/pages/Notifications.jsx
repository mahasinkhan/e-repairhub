import { useEffect, useState } from "react";
import {
  Bell, ShoppingCart, Wrench, CheckCircle,
  XCircle, Package, RefreshCw, Check, Trash2,
  AlertCircle, Clock,
} from "lucide-react";
import { getMyStats } from "../services/franchise.api.js";

const TYPE_CONFIG = {
  new_order:   { icon: ShoppingCart, color: "#1d4ed8", bg: "#eff6ff", label: "New Order" },
  repairing:   { icon: Wrench,       color: "#854d0e", bg: "#fefce8", label: "Repairing" },
  completed:   { icon: CheckCircle,  color: "#15803d", bg: "#f0fdf4", label: "Completed" },
  cancelled:   { icon: XCircle,      color: "#b91c1c", bg: "#fef2f2", label: "Cancelled" },
  delivered:   { icon: Package,      color: "#0e7490", bg: "#ecfeff", label: "Delivered" },
  system:      { icon: AlertCircle,  color: "#7c3aed", bg: "#f5f3ff", label: "System" },
};

function buildNotifications(recentOrders = []) {
  const notifs = recentOrders.map((o, i) => {
    const type = o.status === "placed" || o.status === "assigned" ? "new_order"
      : o.status === "repairing"  ? "repairing"
      : o.status === "completed"  ? "completed"
      : o.status === "cancelled"  ? "cancelled"
      : o.status === "delivered"  ? "delivered"
      : "system";

    return {
      id: o._id || `n_${i}`,
      type,
      title: type === "new_order" ? "New order assigned to you"
           : type === "repairing" ? "Repair in progress"
           : type === "completed" ? "Repair completed"
           : type === "cancelled" ? "Order cancelled"
           : type === "delivered" ? "Order delivered"
           : "Order update",
      message: `${o.orderNumber} — ${o.customer?.name ?? "Customer"} · ${o.deviceDetails?.model ?? "Device"} · ₹${o.price ?? 0}`,
      time: o.updatedAt || o.createdAt,
      read: i > 1,
      orderId: o._id,
    };
  });

  return [
    {
      id: "sys_welcome",
      type: "system",
      title: "Welcome to E-RepairHub Franchise Portal",
      message: "Your franchise panel is active. Manage orders, track repairs and view earnings.",
      time: new Date(Date.now() - 7200000).toISOString(),
      read: true,
    },
    ...notifs,
  ];
}

function timeAgo(time) {
  if (!time) return "—";
  const d = new Date(time);
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    try {
      const stats = await getMyStats();
      setNotifications(buildNotifications(stats.recentOrders ?? []));
    } catch {
      setNotifications(buildNotifications([]));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const markRead = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const remove = (id) => setNotifications(prev => prev.filter(n => n.id !== id));
  const clearAll = () => { if (window.confirm("Clear all notifications?")) setNotifications([]); };

  const unread = notifications.filter(n => !n.read).length;

  const filtered = notifications.filter(n => {
    if (filter === "unread") return !n.read;
    if (filter === "orders") return n.type !== "system";
    if (filter === "system") return n.type === "system";
    return true;
  });

  const FILTERS = [
    { key: "all",    label: "All",    count: notifications.length },
    { key: "unread", label: "Unread", count: unread },
    { key: "orders", label: "Orders", count: notifications.filter(n => n.type !== "system").length },
    { key: "system", label: "System", count: notifications.filter(n => n.type === "system").length },
  ];

  return (
    <div className="content-shell" style={{ padding: "24px 28px", maxWidth: 720 }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1e293b", margin: 0 }}>Notifications</h1>
            {unread > 0 && (
              <span style={{ background: "#3b82f6", color: "#fff", borderRadius: 999, padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>
                {unread} new
              </span>
            )}
          </div>
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Order updates and system alerts</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={load} style={{ padding: "8px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, cursor: "pointer" }}>
            <RefreshCw size={15} color="#64748b" />
          </button>
          {unread > 0 && (
            <button onClick={markAllRead} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
              background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10,
              fontSize: 13, fontWeight: 600, color: "#475569", cursor: "pointer",
            }}>
              <Check size={14} /> Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button onClick={clearAll} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
              background: "#fff", border: "1px solid #fecaca", borderRadius: 10,
              fontSize: 13, fontWeight: 600, color: "#ef4444", cursor: "pointer",
            }}>
              <Trash2 size={14} /> Clear all
            </button>
          )}
        </div>
      </div>

      {/* Filter pills */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            display: "flex", alignItems: "center", gap: 6, padding: "7px 14px",
            borderRadius: 10, border: "none", fontWeight: 600, fontSize: 12,
            cursor: "pointer", transition: "all .15s",
            background: filter === f.key ? "#1e293b" : "#f1f5f9",
            color: filter === f.key ? "#fff" : "#64748b",
          }}>
            {f.label}
            <span style={{
              background: filter === f.key ? "rgba(255,255,255,0.2)" : "#e2e8f0",
              color: filter === f.key ? "#fff" : "#64748b",
              borderRadius: 999, padding: "1px 7px", fontSize: 11,
            }}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Notifications */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "50px 0", color: "#94a3b8" }}>
          <RefreshCw size={20} style={{ animation: "spin 1s linear infinite", marginBottom: 8 }} />
          <p style={{ fontSize: 14 }}>Loading notifications...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
          <Bell size={36} style={{ opacity: 0.3, marginBottom: 10 }} />
          <p style={{ fontSize: 14, fontWeight: 600, color: "#475569" }}>
            {filter === "unread" ? "All caught up!" : "No notifications"}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(notif => {
            const cfg = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.system;
            const Icon = cfg.icon;
            return (
              <div key={notif.id} style={{
                display: "flex", alignItems: "flex-start", gap: 14,
                padding: "14px 16px", borderRadius: 14,
                background: notif.read ? "#fff" : "#f0f9ff",
                border: notif.read ? "1px solid #e2e8f0" : "1px solid #bae6fd",
                transition: "all .15s",
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: cfg.bg, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon size={16} color={cfg.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <p style={{ fontWeight: 600, fontSize: 13, color: "#1e293b", margin: 0 }}>{notif.title}</p>
                        <span style={{ background: cfg.bg, color: cfg.color, borderRadius: 6, padding: "1px 7px", fontSize: 10, fontWeight: 600 }}>
                          {cfg.label}
                        </span>
                        {!notif.read && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#3b82f6", display: "inline-block" }} />}
                      </div>
                      <p style={{ fontSize: 12, color: "#64748b", marginTop: 3, lineHeight: 1.4 }}>{notif.message}</p>
                    </div>
                    <span style={{ fontSize: 11, color: "#94a3b8", flexShrink: 0, display: "flex", alignItems: "center", gap: 3 }}>
                      <Clock size={10} /> {timeAgo(notif.time)}
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                  {!notif.read && (
                    <button onClick={() => markRead(notif.id)} title="Mark read" style={{
                      background: "none", border: "none", cursor: "pointer",
                      padding: 6, borderRadius: 8, color: "#22c55e",
                    }}>
                      <Check size={14} />
                    </button>
                  )}
                  <button onClick={() => remove(notif.id)} title="Remove" style={{
                    background: "none", border: "none", cursor: "pointer",
                    padding: 6, borderRadius: 8, color: "#94a3b8",
                  }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}