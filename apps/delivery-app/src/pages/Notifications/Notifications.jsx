import { useEffect, useState } from "react";
import { Bell, RefreshCw, Check, Trash2, Package, Truck, CheckCircle, Clock } from "lucide-react";
import { getMyTasks } from "../../services/delivery.api.js";

export default function Notifications() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    try {
      const tasks = await getMyTasks();
      const built = tasks.map((t, i) => ({
        id: t._id,
        type: t.status === "completed" ? "completed" : t.taskType === "pickup" ? "pickup" : "delivery",
        title: t.status === "completed" ? "Task Completed" : t.taskType === "pickup" ? "Pickup Task Assigned" : "Delivery Task Assigned",
        message: `${t.order?.orderNumber} · ${t.order?.customer?.name} · ${t.order?.deviceDetails?.model}`,
        time: t.createdAt,
        read: i > 2,
      }));
      setNotifs(built);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const markRead   = (id) => setNotifs(p => p.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setNotifs(p => p.map(n => ({ ...n, read: true })));
  const remove     = (id) => setNotifs(p => p.filter(n => n.id !== id));

  const filtered = notifs.filter(n => {
    if (filter === "unread") return !n.read;
    if (filter === "pickup") return n.type === "pickup";
    if (filter === "delivery") return n.type === "delivery";
    return true;
  });

  const unread = notifs.filter(n => !n.read).length;

  const ICON_MAP = { pickup: Package, delivery: Truck, completed: CheckCircle };
  const COLOR_MAP = { pickup: { color: "#7c3aed", bg: "#f5f3ff" }, delivery: { color: "#059669", bg: "#ecfdf5" }, completed: { color: "#15803d", bg: "#dcfce7" } };

  const timeAgo = (t) => {
    const diff = (Date.now() - new Date(t)) / 1000;
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(t).toLocaleDateString("en-IN");
  };

  return (
    <div style={{ padding: 20, maxWidth: 680 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "#1e293b", margin: 0 }}>Notifications</h1>
            {unread > 0 && <span style={{ background: "#f97316", color: "#fff", borderRadius: 999, padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>{unread}</span>}
          </div>
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Task alerts and updates</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={load} style={{ padding: 8, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, cursor: "pointer" }}>
            <RefreshCw size={15} color="#64748b" />
          </button>
          {unread > 0 && (
            <button onClick={markAllRead} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#475569", cursor: "pointer" }}>
              <Check size={14} /> Mark all read
            </button>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {["all", "unread", "pickup", "delivery"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "6px 14px", borderRadius: 10, border: "none", fontWeight: 600, fontSize: 12,
            cursor: "pointer", background: filter === f ? "#f97316" : "#f1f5f9",
            color: filter === f ? "#fff" : "#64748b",
          }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: "#94a3b8" }}>
          <RefreshCw size={20} style={{ animation: "spin 1s linear infinite" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: "#94a3b8" }}>
          <Bell size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
          <p style={{ fontSize: 14, color: "#475569" }}>No notifications</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(n => {
            const Icon = ICON_MAP[n.type] ?? Bell;
            const cfg = COLOR_MAP[n.type] ?? { color: "#64748b", bg: "#f1f5f9" };
            return (
              <div key={n.id} style={{
                display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px",
                background: n.read ? "#fff" : "#fff7ed",
                border: `1px solid ${n.read ? "#e2e8f0" : "#fed7aa"}`,
                borderRadius: 14, transition: "all .15s",
              }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={16} color={cfg.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", margin: 0 }}>{n.title}</p>
                    <span style={{ fontSize: 11, color: "#94a3b8", flexShrink: 0, marginLeft: 8 }}>{timeAgo(n.time)}</span>
                  </div>
                  <p style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{n.message}</p>
                </div>
                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                  {!n.read && (
                    <button onClick={() => markRead(n.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#22c55e", padding: 4 }}>
                      <Check size={14} />
                    </button>
                  )}
                  <button onClick={() => remove(n.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4 }}>
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