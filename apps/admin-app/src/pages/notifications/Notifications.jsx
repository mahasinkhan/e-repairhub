import { useEffect, useState } from "react";
import {
  Bell, ShoppingCart, Truck, Store, CheckCircle,
  XCircle, RefreshCw, Trash2, Check, AlertCircle,
  Info, Package,
} from "lucide-react";

const NOTIFICATION_TYPES = {
  order_placed:     { icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100", label: "New Order" },
  order_assigned:   { icon: Store, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100", label: "Order Assigned" },
  order_picked:     { icon: Truck, color: "text-cyan-600", bg: "bg-cyan-50", border: "border-cyan-100", label: "Picked Up" },
  order_completed:  { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50", border: "border-green-100", label: "Completed" },
  order_delivered:  { icon: Package, color: "text-teal-600", bg: "bg-teal-50", border: "border-teal-100", label: "Delivered" },
  order_cancelled:  { icon: XCircle, color: "text-red-500", bg: "bg-red-50", border: "border-red-100", label: "Cancelled" },
  system_alert:     { icon: AlertCircle, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100", label: "System Alert" },
  info:             { icon: Info, color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-100", label: "Info" },
};

// Generate notifications from real recent orders
function buildNotificationsFromOrders(orders = []) {
  return orders.map((order, i) => ({
    id: order._id || `notif_${i}`,
    type: order.status === "placed" ? "order_placed"
      : order.status === "assigned" ? "order_assigned"
      : order.status === "picked" ? "order_picked"
      : order.status === "completed" ? "order_completed"
      : order.status === "delivered" ? "order_delivered"
      : order.status === "cancelled" ? "order_cancelled"
      : "info",
    title: order.status === "placed" ? `New order received`
      : order.status === "cancelled" ? `Order cancelled`
      : order.status === "completed" ? `Order completed`
      : order.status === "delivered" ? `Order delivered`
      : `Order ${order.status}`,
    message: `Order ${order.orderNumber} — ${order.customer?.name ?? "Customer"} · ₹${order.price ?? 0}`,
    time: order.updatedAt || order.createdAt,
    read: i > 1,
    orderId: order._id,
    orderNumber: order.orderNumber,
  }));
}

// Static system notifications
const SYSTEM_NOTIFICATIONS = [
  {
    id: "sys_1",
    type: "system_alert",
    title: "Backend connected",
    message: "E-RepairHub admin panel is running successfully",
    time: new Date().toISOString(),
    read: true,
  },
  {
    id: "sys_2",
    type: "info",
    title: "Welcome to E-RepairHub",
    message: "Admin panel is fully operational. Manage orders, franchises and delivery agents.",
    time: new Date(Date.now() - 3600000).toISOString(),
    read: true,
  },
];

function formatTime(time) {
  if (!time) return "—";
  const d = new Date(time);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

function NotificationItem({ notif, onMarkRead, onDelete }) {
  const config = NOTIFICATION_TYPES[notif.type] ?? NOTIFICATION_TYPES.info;
  const Icon = config.icon;

  return (
    <div className={`flex items-start gap-4 p-4 rounded-xl border transition group ${
      !notif.read
        ? "bg-blue-50/50 border-blue-100"
        : "bg-white border-slate-100 hover:bg-slate-50"
    }`}>
      {/* Icon */}
      <div className={`w-10 h-10 ${config.bg} border ${config.border} rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5`}>
        <Icon className={`w-4.5 h-4.5 ${config.color}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className={`text-sm font-semibold ${!notif.read ? "text-slate-900" : "text-slate-700"}`}>
                {notif.title}
              </p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.bg} ${config.color}`}>
                {config.label}
              </span>
              {!notif.read && (
                <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
          </div>
          <p className="text-xs text-slate-400 flex-shrink-0 mt-0.5">{formatTime(notif.time)}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition flex-shrink-0">
        {!notif.read && (
          <button
            onClick={() => onMarkRead(notif.id)}
            title="Mark as read"
            className="p-1.5 rounded-lg hover:bg-green-50 hover:text-green-600 text-slate-400 transition"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={() => onDelete(notif.id)}
          title="Delete"
          className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 text-slate-400 transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const { default: httpClient } = await import("../../services/httpClient.js");
      const { data } = await httpClient.get("/orders/stats/dashboard");
      const orders = data?.data?.recentOrders ?? data?.recentOrders ?? [];
      const orderNotifs = buildNotificationsFromOrders(orders);
      setNotifications([...orderNotifs, ...SYSTEM_NOTIFICATIONS]);
    } catch {
      setNotifications(SYSTEM_NOTIFICATIONS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadNotifications(); }, []);

  const handleMarkRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleDelete = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    if (!window.confirm("Clear all notifications?")) return;
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const filtered = notifications.filter(n => {
    if (filter === "unread") return !n.read;
    if (filter === "orders") return n.type.startsWith("order_");
    if (filter === "system") return n.type === "system_alert" || n.type === "info";
    return true;
  });

  const FILTERS = [
    { key: "all", label: "All", count: notifications.length },
    { key: "unread", label: "Unread", count: unreadCount },
    { key: "orders", label: "Orders", count: notifications.filter(n => n.type.startsWith("order_")).length },
    { key: "system", label: "System", count: notifications.filter(n => n.type === "system_alert" || n.type === "info").length },
  ];

  return (
    <div className="space-y-5 max-w-3xl">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-800">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-blue-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-slate-500 text-sm mt-1">System alerts and order updates</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadNotifications}
            className="p-2 border border-slate-200 bg-white rounded-xl text-slate-500 hover:bg-slate-50 transition shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 bg-white text-slate-600 text-sm font-medium hover:bg-slate-50 rounded-xl transition shadow-sm"
            >
              <Check className="w-4 h-4" />
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1.5 px-3 py-2 border border-red-200 bg-white text-red-500 text-sm font-medium hover:bg-red-50 rounded-xl transition shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm w-fit">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filter === f.key
                ? "bg-slate-800 text-white"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            {f.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              filter === f.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
            }`}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Notifications list */}
      <div className="space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" />
            Loading notifications...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 bg-white border border-dashed border-slate-200 rounded-xl">
            <Bell className="w-10 h-10 mb-3 opacity-20" />
            <p className="font-medium text-slate-500">No notifications</p>
            <p className="text-xs mt-1 opacity-70">
              {filter === "unread" ? "All caught up!" : "Nothing here yet"}
            </p>
          </div>
        ) : (
          <>
            {/* Unread section */}
            {filter === "all" && filtered.some(n => !n.read) && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide px-1">
                  Unread
                </p>
                {filtered.filter(n => !n.read).map(notif => (
                  <NotificationItem
                    key={notif.id}
                    notif={notif}
                    onMarkRead={handleMarkRead}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}

            {/* Read section */}
            {filter === "all" && filtered.some(n => n.read) && (
              <div className="space-y-2 mt-4">
                {filtered.some(n => !n.read) && (
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide px-1">
                    Earlier
                  </p>
                )}
                {filtered.filter(n => n.read).map(notif => (
                  <NotificationItem
                    key={notif.id}
                    notif={notif}
                    onMarkRead={handleMarkRead}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}

            {/* Non-"all" filter — just show flat list */}
            {filter !== "all" && filtered.map(notif => (
              <NotificationItem
                key={notif.id}
                notif={notif}
                onMarkRead={handleMarkRead}
                onDelete={handleDelete}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}