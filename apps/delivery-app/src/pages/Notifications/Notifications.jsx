import { useState, useMemo } from "react";
import "./Notifications.css";

// ── SVG helper ───────────────────────────────────────────────────────────────
const Svg = ({ d, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const IC = {
  bell:    "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0",
  search:  "M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z",
  chevron: "M6 9l6 6 6-6",
  check:   "M20 6L9 17l-5-5",
  trash:   "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  truck:   "M1 3h15v13H1zM16 8h4l3 3v5h-7V8zM5.5 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm13 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z",
  box:     "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z",
  pickup:  "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  map:     "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
  device:  "M12 18h.01M8 21h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z",
};

// ── Notification Types config ─────────────────────────────────────────────────
const TYPE_CONFIG = {
  "Pickup Assigned":     { icon: IC.pickup,  color: "#7c3aed", bg: "#faf5ff" },
  "Delivery Started":    { icon: IC.truck,   color: "#0284c7", bg: "#f0f9ff" },
  "Device Picked":       { icon: IC.device,  color: "#ea580c", bg: "#fff7ed" },
  "Out For Delivery":    { icon: IC.map,     color: "#2563eb", bg: "#eff6ff" },
  "Delivered Successfully": { icon: IC.check, color: "#16a34a", bg: "#f0fdf4" },
};

const TYPES = ["All Types", ...Object.keys(TYPE_CONFIG)];
const FILTER_STATUS = ["All", "Unread", "Read"];

// ── Dummy Data ────────────────────────────────────────────────────────────────
let _id = 1;
const mk = (type, title, msg, time, read = false) =>
  ({ id: _id++, type, title, msg, time, read });

const INIT_NOTIFICATIONS = [
  mk("Pickup Assigned",       "New Pickup Assigned",           "Order ORD-4831 has been assigned to you. Pick up a Laptop from 12 MG Road, Buxar.",         "2 min ago",  false),
  mk("Delivery Started",      "Delivery Started",              "You have started delivery for Order ORD-4822. Customer: Arjun Mehta.",                        "15 min ago", false),
  mk("Device Picked",         "Device Picked Up",              "Smartphone for Order ORD-4828 successfully picked from 45 Park Street, Patna.",               "32 min ago", false),
  mk("Out For Delivery",      "Out For Delivery",              "Order ORD-4825 is now out for delivery. Destination: 3 Ashoka Road, Ghazipur.",                "1 hr ago",   false),
  mk("Delivered Successfully","Package Delivered",             "Order ORD-4823 delivered to Sunita Verma at 7 Civil Lines, Varanasi. Great job!",             "2 hrs ago",  true),
  mk("Pickup Assigned",       "Pickup Task Ready",             "Order ORD-4832 awaiting pickup. Device: Tablet at 22 Park Ave, Chapra.",                      "3 hrs ago",  true),
  mk("Delivery Started",      "Delivery Initiated",            "Order ORD-4819 delivery started for customer Meena Dubey.",                                   "4 hrs ago",  true),
  mk("Delivered Successfully","Successful Delivery",           "Order ORD-4815 delivered to Amit Kumar at 19 Station Road, Motihari.",                        "5 hrs ago",  true),
  mk("Out For Delivery",      "En Route to Customer",          "Order ORD-4810 is on the way to Kavita Singh, ETA 20 minutes.",                               "6 hrs ago",  true),
  mk("Device Picked",         "Smartwatch Collected",          "Smartwatch for Order ORD-4807 collected from 14 Raja Park, Bhagalpur.",                       "Yesterday",  true),
  mk("Pickup Assigned",       "Pickup Assigned – Earbuds",     "Order ORD-4801 earbuds pickup assigned. Location: 9 Ashoka Road, Ghazipur.",                  "Yesterday",  true),
  mk("Delivered Successfully","Order Completed",               "Order ORD-4796 has been successfully delivered to Suresh Pandey.",                             "2 days ago", true),
];

// ── Card Component ────────────────────────────────────────────────────────────
function NotificationCard({ notif, onMarkRead, onDelete }) {
  const cfg = TYPE_CONFIG[notif.type];
  return (
    <div className={`notification-page-card${notif.read ? "" : " unread"}`}>
      {/* Icon */}
      <div className="notification-page-icon"
        style={{ background: cfg.bg, color: cfg.color }}>
        <Svg d={cfg.icon} />
      </div>

      <div className="notification-page-card-body">
        {/* Top row */}
        <div className="notification-page-card-top">
          <div className="notification-page-card-title-wrap">
            {!notif.read && <span className="notification-page-unread-dot" />}
            <span className="notification-page-card-title">{notif.title}</span>
            <span className="notification-page-type-badge"
              style={{ background: cfg.bg, color: cfg.color }}>
              {notif.type}
            </span>
          </div>
        </div>

        {/* Message */}
        <div className="notification-page-card-msg">{notif.msg}</div>

        {/* Footer */}
        <div className="notification-page-card-footer">
          <span className="notification-page-card-time">{notif.time}</span>
          <div className="notification-page-card-btns">
            {!notif.read && (
              <button
                className="notification-page-btn notification-page-btn-primary notification-page-btn-sm"
                onClick={() => onMarkRead(notif.id)}>
                Mark Read
              </button>
            )}
            <button
              className="notification-page-btn notification-page-btn-ghost notification-page-btn-sm"
              onClick={() => onDelete(notif.id)}>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Notifications() {
  const [notifications, setNotifications] = useState(INIT_NOTIFICATIONS);
  const [search,     setSearch]     = useState("");
  const [typeFilt,   setTypeFilt]   = useState("All Types");
  const [statusFilt, setStatusFilt] = useState("All");

  const unreadCount = notifications.filter(n => !n.read).length;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return notifications.filter(n => {
      const matchQ = !q ||
        n.title.toLowerCase().includes(q) ||
        n.msg.toLowerCase().includes(q) ||
        n.type.toLowerCase().includes(q);
      const matchType   = typeFilt === "All Types" || n.type === typeFilt;
      const matchStatus = statusFilt === "All" ||
        (statusFilt === "Unread" && !n.read) ||
        (statusFilt === "Read"   &&  n.read);
      return matchQ && matchType && matchStatus;
    });
  }, [notifications, search, typeFilt, statusFilt]);

  const markRead   = (id) => setNotifications(p => p.map(n => n.id === id ? { ...n, read: true } : n));
  const deleteOne  = (id) => setNotifications(p => p.filter(n => n.id !== id));
  const markAllRead = ()  => setNotifications(p => p.map(n => ({ ...n, read: true })));
  const deleteAll   = ()  => setNotifications(p => p.filter(n => n.read));

  return (
    <div className="notification-page-wrapper">

  

      <main className="notification-page-container">

        {/* Top Section */}
  

        {/* Toolbar */}
        <div className="notification-page-toolbar">
          <div className="notification-page-search-wrap">
            <svg className="notification-page-search-icon" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={IC.search} />
            </svg>
            <input
              className="notification-page-search"
              type="text"
              placeholder="Search notifications…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Type filter */}
          <div className="notification-page-select-wrap">
            <select className="notification-page-select"
              value={typeFilt} onChange={e => setTypeFilt(e.target.value)}>
              {TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <svg className="notification-page-select-arrow" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={IC.chevron} />
            </svg>
          </div>

          {/* Status filter */}
          <div className="notification-page-select-wrap">
            <select className="notification-page-select"
              value={statusFilt} onChange={e => setStatusFilt(e.target.value)}>
              {FILTER_STATUS.map(s => <option key={s}>{s}</option>)}
            </select>
            <svg className="notification-page-select-arrow" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={IC.chevron} />
            </svg>
          </div>
        </div>

        {/* Bulk Actions + Count */}
        <div className="notification-page-actions">
          <div className="notification-page-count">
            Showing {filtered.length} of {notifications.length} notifications
          </div>
          <div className="notification-page-bulk">
            {unreadCount > 0 && (
              <button className="notification-page-btn notification-page-btn-primary"
                onClick={markAllRead}>
                Mark All Read
              </button>
            )}
            <button className="notification-page-btn notification-page-btn-ghost"
              onClick={deleteAll}>
              Delete Read
            </button>
          </div>
        </div>

        {/* List */}
        <div className="notification-page-list">
          {filtered.length === 0 ? (
            <div className="notification-page-empty">
              <div className="notification-page-empty-icon">🔔</div>
              <div className="notification-page-empty-title">No notifications found</div>
              <div className="notification-page-empty-text">Try adjusting your search or filters.</div>
            </div>
          ) : (
            filtered.map(n => (
              <NotificationCard
                key={n.id}
                notif={n}
                onMarkRead={markRead}
                onDelete={deleteOne}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
