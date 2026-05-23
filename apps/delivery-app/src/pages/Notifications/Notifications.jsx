import { useState, useEffect } from "react";
import {
  getNotifications,
  subscribeNotifications,
  markAsRead,
  markAllAsRead,
} from "../../services/notificationStore.js";
import {
  ClipboardList,
  Package,
  Store,
  Truck,
  CheckCircle2,
} from "lucide-react";
import "./Notifications.css";


// ─────────────────────────────────────────────
// 🎨 Notification Icon Config (React icons)
// ─────────────────────────────────────────────

const ICON_CONFIG = {

  task: {
    bg: "#eef2ff",
    color: "#4f46e5",
    Icon: ClipboardList,
  },
  pickup: {
    bg: "#fdf2f8",
    color: "#db2777",
    Icon: Package,
  },
  franchise: {
    bg: "#f0fdf4",
    color: "#16a34a",
    Icon: Store,
  },
  delivery: {
    bg: "#f0f9ff",
    color: "#0284c7",
    Icon: Truck,
  },
  completed: {
    bg: "#fff7ed",
    color: "#ea580c",
    Icon: CheckCircle2,
  },
};


function useNotifications() {
  const [notifications, setNotifications] = useState(() => getNotifications());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => subscribeNotifications(setNotifications), []);

  const refetch = () => setNotifications(getNotifications());

  const handleMarkRead = (id) => {
    markAsRead(id);
    setNotifications(getNotifications());
  };

  const handleMarkAll = () => {
    markAllAsRead();
    setNotifications(getNotifications());
  };

  return {
    notifications,
    loading,
    error,
    markAsRead: handleMarkRead,
    markAllAsRead: handleMarkAll,
    refetch,
  };
}

// ─────────────────────────────────────────────
// 🔔 Bell SVG
// ─────────────────────────────────────────────
function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  );
}

function NotifBoxIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );
}

// ─────────────────────────────────────────────
// 💀 Skeleton Loader
// ─────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-icon" />
      <div className="skeleton-body">
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-desc" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 🃏 Single Notification Card
// ─────────────────────────────────────────────
function NotificationCard({ notification, onRead }) {
  const cfg = ICON_CONFIG[notification.type] || ICON_CONFIG.task;

  const handleClick = () => {
    if (!notification.isRead) onRead(notification.id);
  };

  return (
    <div
      className={`notif-card ${!notification.isRead ? "unread" : ""}`}
      onClick={handleClick}
      style={{ animationDelay: `${notification.id * 60}ms` }}
    >
      <div
        className="notif-card-icon"
        style={{ background: cfg.bg, color: cfg.color }}
      >
        {cfg.Icon ? <cfg.Icon size={18} /> : null}
      </div>


      <div className="notif-card-body">
        <div className="notif-card-title">{notification.title}</div>
        <div className="notif-card-desc">{notification.description}</div>
      </div>

      <div className="notif-card-meta">
        <span className="notif-card-time">{notification.time}</span>
        {!notification.isRead && <span className="unread-dot" />}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 🏠 Main Page Component
// ─────────────────────────────────────────────

// 🔌 BACKEND READY: Replace with real user from auth context / API
const USER = {
  name: "Ramesh Kumar",
  role: "Delivery Agent",
  avatarUrl: null, // Set to image URL string when available
};

const TABS = [
  { key: "all",     label: "All" },
  { key: "unread",  label: "Unread" },
  { key: "updates", label: "Updates" },
  { key: "alerts",  label: "Alerts" },
];

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const { notifications, loading, error, markAsRead, markAllAsRead, refetch } =
    useNotifications();

  // ── Derived counts
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // ── Filtered list based on active tab
  const filtered = notifications.filter((n) => {
    if (activeTab === "all")    return true;
    if (activeTab === "unread") return !n.isRead;
    return n.category === activeTab;
  });

  // ── Tab label with dynamic count
  const getTabLabel = (tab) => {
    if (tab.key === "unread" && unreadCount > 0) return `Unread (${unreadCount})`;
    return tab.label;
  };

  // ── Avatar initials fallback
  const initials = USER.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="notifications-page">
      <div className="notifications-container">

        {/* ── Header Card ── */}
        <div className="notif-header-card">
          <div className="notif-header-top">
            <div className="notif-header-left">
              <div className="notif-icon-box">
                <NotifBoxIcon />
              </div>
              <span className="notif-title">Notifications</span>
            </div>

            <div className="notif-header-right">
              {/* Bell */}
              <div className="bell-wrapper" onClick={refetch} title="Refresh">
                <BellIcon />
                {unreadCount > 0 && (
                  <span className="bell-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
                )}
              </div>

              {/* User */}
              <div className="user-profile">
                {USER.avatarUrl ? (
                  <img className="user-avatar" src={USER.avatarUrl} alt={USER.name} />
                ) : (
                  <div className="user-avatar-placeholder">{initials}</div>
                )}
                <div className="user-info">
                  <span className="user-name">{USER.name}</span>
                  <span className="user-role">{USER.role} <ChevronIcon /></span>
                </div>
              </div>
            </div>
          </div>

          <p className="notif-subtitle">Stay updated with your activities</p>
        </div>

        {/* ── Tabs ── */}
        <div className="notif-tabs-bar">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`tab-btn ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {getTabLabel(tab)}
            </button>
          ))}
        </div>

        {/* ── Mark All Read ── */}
        {unreadCount > 0 && !loading && (
          <div className="notif-actions">
            <button className="mark-all-btn" onClick={markAllAsRead}>
              ✓ Mark all as read
            </button>
          </div>
        )}

        {/* ── Content ── */}
        {error ? (
          <div className="notif-empty">
            <div className="notif-empty-icon">⚠️</div>
            <p className="notif-empty-text">Failed to load notifications. <br /><br />
              <button className="mark-all-btn" onClick={refetch}>Try again</button>
            </p>
          </div>
        ) : loading ? (
          <div className="notif-list">
            {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="notif-empty">
            <div className="notif-empty-icon">🔔</div>
            <p className="notif-empty-text">No notifications here</p>
          </div>
        ) : (
          <div className="notif-list">
            {filtered.map((notif) => (
              <NotificationCard
                key={notif.id}
                notification={notif}
                onRead={markAsRead}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
