/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useState } from "react";
import {
  Bell, ShoppingCart, Wrench, CheckCircle,
  XCircle, Package, RefreshCw, Check, Trash2,
  AlertCircle, Clock,
} from "lucide-react";
import { getMyStats } from "../services/franchise.api.js";

const STORAGE_KEY = "erh_notifications_state";

const TYPE_CONFIG = {
  new_order: { icon: ShoppingCart, color: "#1d4ed8", bg: "#eff6ff", label: "New Order"  },
  repairing: { icon: Wrench,       color: "#854d0e", bg: "#fefce8", label: "Repairing"  },
  completed: { icon: CheckCircle,  color: "#15803d", bg: "#f0fdf4", label: "Completed"  },
  cancelled: { icon: XCircle,      color: "#b91c1c", bg: "#fef2f2", label: "Cancelled"  },
  delivered: { icon: Package,      color: "#0e7490", bg: "#ecfeff", label: "Delivered"  },
  system:    { icon: AlertCircle,  color: "#7c3aed", bg: "#f5f3ff", label: "System"     },
};

function buildNotifications(recentOrders = []) {
  const notifs = recentOrders.map((o, i) => {
    const type =
      o.status === "placed" || o.status === "assigned" ? "new_order"
      : o.status === "repairing" ? "repairing"
      : o.status === "completed" ? "completed"
      : o.status === "cancelled" ? "cancelled"
      : o.status === "delivered" ? "delivered"
      : "system";
    return {
      id:      o._id || `n_${i}`,
      type,
      title:
        type === "new_order" ? "New order assigned to you"
        : type === "repairing" ? "Repair in progress"
        : type === "completed" ? "Repair completed"
        : type === "cancelled" ? "Order cancelled"
        : type === "delivered" ? "Order delivered"
        : "Order update",
      message: `${o.orderNumber} — ${o.customer?.name ?? "Customer"} · ${o.deviceDetails?.model ?? "Device"} · ₹${o.price ?? 0}`,
      time:    o.updatedAt || o.createdAt,
      orderId: o._id,
    };
  });
  return [
    {
      id:      "sys_welcome",
      type:    "system",
      title:   "Welcome to E-RepairHub Franchise Portal",
      message: "Your franchise panel is active. Manage orders, track repairs and view earnings.",
      time:    new Date(Date.now() - 7200000).toISOString(),
    },
    ...notifs,
  ];
}

// ── localStorage helpers ──────────────────────────────────────────────────────
function loadSavedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { dismissed: [], read: [] };
  } catch {
    return { dismissed: [], read: [] };
  }
}

function saveState(dismissed, read) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ dismissed, read }));
  } catch {
    /* storage unavailable */
  }
}

function timeAgo(time) {
  if (!time) return "—";
  const diff = Math.floor((Date.now() - new Date(time).getTime()) / 1000);
  if (diff < 60)    return "Just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(time).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [dismissed,     setDismissed]     = useState(() => loadSavedState().dismissed);
  const [readIds,       setReadIds]        = useState(() => loadSavedState().read);
  const [loading,       setLoading]        = useState(true);
  const [filter,        setFilter]         = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const stats = await getMyStats();
      const all   = buildNotifications(stats.recentOrders ?? []);
      setNotifications(all);
    } catch {
      setNotifications(buildNotifications([]));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const markRead = (id) => {
    const newRead = [...new Set([...readIds, id])];
    setReadIds(newRead);
    saveState(dismissed, newRead);
  };

  const markAllRead = () => {
    const newRead = notifications.map(n => n.id);
    setReadIds(newRead);
    saveState(dismissed, newRead);
  };

  const remove = (id) => {
    const newDismissed = [...new Set([...dismissed, id])];
    setDismissed(newDismissed);
    saveState(newDismissed, readIds);
  };

  const clearAll = () => {
    if (!window.confirm("Clear all notifications?")) return;
    const allIds = notifications.map(n => n.id);
    setDismissed(allIds);
    saveState(allIds, readIds);
  };

  // ── Derived state ─────────────────────────────────────────────────────────
  const visible = notifications
    .filter(n => !dismissed.includes(n.id))
    .map(n => ({ ...n, read: readIds.includes(n.id) }));

  const unread = visible.filter(n => !n.read).length;

  const filtered = visible.filter(n => {
    if (filter === "unread") return !n.read;
    if (filter === "orders") return n.type !== "system";
    if (filter === "system") return n.type === "system";
    return true;
  });

  const FILTERS = [
    { key: "all",    label: "All",    count: visible.length },
    { key: "unread", label: "Unread", count: unread },
    { key: "orders", label: "Orders", count: visible.filter(n => n.type !== "system").length },
    { key: "system", label: "System", count: visible.filter(n => n.type === "system").length },
  ];

  return (
    <div className="content-shell p-6">
      <div style={{ maxWidth: 760, margin: "0 auto", width: "100%" }}>

        {/* Header */}
        <div className="flex justify-between items-start mb-6 flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
              {unread > 0 && (
                <span className="bg-blue-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {unread} new
                </span>
              )}
            </div>
            <p className="text-slate-500 text-sm mt-1">Order updates and system alerts</p>
          </div>
          <div className="flex gap-2">
            <button onClick={load}
              className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition">
              <RefreshCw size={15} className="text-slate-500" />
            </button>
            {unread > 0 && (
              <button onClick={markAllRead}
                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition">
                <Check size={13} /> Mark all read
              </button>
            )}
            {visible.length > 0 && (
              <button onClick={clearAll}
                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-red-200 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-50 transition">
                <Trash2 size={13} /> Clear all
              </button>
            )}
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                filter === f.key
                  ? "bg-slate-800 text-white border-slate-800"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}>
              {f.label}
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                filter === f.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
              }`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>

        {/* Notifications list */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <RefreshCw className="w-5 h-5 animate-spin mb-3" />
            <p className="text-sm">Loading notifications...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Bell className="w-10 h-10 mb-3 opacity-20" />
            <p className="text-sm font-semibold text-slate-500">
              {filter === "unread" ? "All caught up!" : "No notifications"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map(notif => {
              const cfg  = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.system;
              const Icon = cfg.icon;
              return (
                <div key={notif.id}
                  className={`flex items-start gap-4 p-4 rounded-2xl border transition ${
                    notif.read ? "bg-white border-slate-200" : "bg-blue-50 border-blue-200"
                  }`}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: cfg.bg }}>
                    <Icon size={16} color={cfg.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-3 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm text-slate-800">{notif.title}</p>
                          <span className="text-xs font-semibold px-1.5 py-0.5 rounded-md"
                            style={{ background: cfg.bg, color: cfg.color }}>
                            {cfg.label}
                          </span>
                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{notif.message}</p>
                      </div>
                      <span className="text-xs text-slate-400 flex items-center gap-1 flex-shrink-0">
                        <Clock size={10} /> {timeAgo(notif.time)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {!notif.read && (
                      <button onClick={() => markRead(notif.id)} title="Mark read"
                        className="p-1.5 rounded-lg text-green-500 hover:bg-green-50 transition">
                        <Check size={13} />
                      </button>
                    )}
                    <button onClick={() => remove(notif.id)} title="Remove"
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}