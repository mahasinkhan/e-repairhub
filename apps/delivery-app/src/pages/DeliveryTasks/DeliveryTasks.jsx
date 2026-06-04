import { useState, useEffect, useCallback } from "react";
import { getMyTasks, updateTaskStatus } from "../../services/delivery.api.js";
import "./DeliveryTasks.css";

/* ── Inline SVG icons ── */
const Icon = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const Icons = {
  truck:    "M1 3h15v13H1zM16 8h4l3 3v5h-7V8zM5.5 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm13 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z",
  package:  "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z",
  user:     "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  phone:    "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12 19.79 19.79 0 0 1 1.08 3.18 2 2 0 0 1 3.05 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z",
  map:      "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
  device:   "M12 18h.01M8 21h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z",
  clock:    "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2",
  shield:   "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  search:   "M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z",
  navigate: "M3 11l19-9-9 19-2-8-8-2z",
  check:    "M20 6L9 17l-5-5",
  x:        "M18 6L6 18M6 6l12 12",
  refresh:  "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15",
  id:       "M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM8 10h8M8 14h4",
};

/* ── Backend → display status mapping ── */
const BACKEND_STATUS = {
  pending:     "Pending",
  accepted:    "Accepted",
  in_progress: "Out For Delivery",
  completed:   "Delivered",
  failed:      "Failed",
  rejected:    "Rejected",
};

/* ── Status visual config ── */
const STATUS = {
  "Pending":          { color: "#92400E", bg: "#FEF3C7", border: "#FCD34D", dot: "#F59E0B" },
  "Accepted":         { color: "#1D4ED8", bg: "#DBEAFE", border: "#93C5FD", dot: "#3B82F6" },
  "Out For Delivery": { color: "#C2410C", bg: "#FFF7ED", border: "#FED7AA", dot: "#F97316" },
  "Delivered":        { color: "#15803D", bg: "#DCFCE7", border: "#86EFAC", dot: "#22C55E" },
  "Failed":           { color: "#B91C1C", bg: "#FEE2E2", border: "#FCA5A5", dot: "#EF4444" },
  "Rejected":         { color: "#475569", bg: "#F1F5F9", border: "#CBD5E1", dot: "#94A3B8" },
};

/* ── Action button config per raw backend status ── */
const ACTION_CFG = {
  pending:     { label: "Accept Task",    icon: Icons.check,    variant: "dt-btn-accept"   },
  accepted:    { label: "Start Delivery", icon: Icons.truck,    variant: "dt-btn-primary"  },
  in_progress: { label: "Navigate",       icon: Icons.navigate, variant: "dt-btn-navigate" },
};

const FILTERS = ["All", "Pending", "Accepted", "Out For Delivery", "Delivered", "Failed"];

/* ── Normalise backend task → component shape ── */
function normalise(t) {
  const brand = t.order?.deviceDetails?.brand  ?? "";
  const model = t.order?.deviceDetails?.model  ?? "";
  const sched = t.scheduledTime
    ? new Date(t.scheduledTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    : "—";
  return {
    _id:       t._id,
    id:        t.order?.orderNumber ?? t._id,
    taskType:  t.taskType,
    rawStatus: t.status,
    status:    BACKEND_STATUS[t.status] ?? t.status,
    customer:  t.order?.customer?.name  ?? "—",
    phone:     t.order?.customer?.phone ?? "",
    address:   t.order?.customer?.address ?? "—",
    device:    [brand, model].filter(Boolean).join(" ") || "—",
    time:      sched,
    otp:       t.otp ?? null,
  };
}

/* ── Details Modal ── */
function DetailsModal({ task, onClose }) {
  const st = STATUS[task.status] ?? {};
  const rows = [
    { icon: Icons.id,     label: "Order ID",    value: task.id,       mono: true  },
    { icon: Icons.user,   label: "Customer",    value: task.customer              },
    { icon: Icons.phone,  label: "Phone",       value: task.phone || "—"          },
    { icon: Icons.map,    label: "Address",     value: task.address               },
    { icon: Icons.device, label: "Device",      value: task.device                },
    { icon: Icons.clock,  label: "Scheduled",   value: task.time                  },
    ...(task.otp ? [{ icon: Icons.shield, label: "OTP Code", value: task.otp, mono: true }] : []),
  ];
  return (
    <div className="dt-overlay" onClick={onClose}>
      <div className="dt-modal" onClick={e => e.stopPropagation()}>
        <div className="dt-modal-head">
          <div className="dt-modal-head-left">
            <div className={`dt-modal-icon ${task.taskType === "pickup" ? "dt-modal-icon-pickup" : ""}`}>
              <Icon d={task.taskType === "pickup" ? Icons.package : Icons.truck} size={18} />
            </div>
            <div>
              <h2 className="dt-modal-title">Order Details</h2>
              <p className="dt-modal-sub">{task.id}</p>
            </div>
          </div>
          <button className="dt-modal-close" onClick={onClose}>
            <Icon d={Icons.x} size={14} />
          </button>
        </div>

        <div className="dt-modal-status-bar">
          <span className="dt-badge"
            style={{ background: st.bg, color: st.color, borderColor: st.border }}>
            <span className="dt-badge-dot" style={{ background: st.dot }} />
            {task.status}
          </span>
          <span className="dt-modal-type-tag">
            {task.taskType === "pickup" ? "↑ Pickup" : "↓ Delivery"}
          </span>
        </div>

        <div className="dt-modal-body">
          {rows.map(r => (
            <div className="dt-modal-row" key={r.label}>
              <div className="dt-modal-row-icon"><Icon d={r.icon} size={14} /></div>
              <div>
                <p className="dt-modal-row-label">{r.label}</p>
                <p className={`dt-modal-row-val ${r.mono ? "dt-mono" : ""}`}>{r.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="dt-modal-foot">
          <button className="dt-btn dt-btn-ghost" onClick={onClose}>Close</button>
          {task.address && task.address !== "—" && (
            <button className="dt-btn dt-btn-navigate"
              onClick={() => window.open(
                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(task.address)}`,
                "_blank"
              )}>
              <Icon d={Icons.navigate} size={12} /> Open Maps
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Skeleton Card ── */
function SkeletonCard() {
  return (
    <div className="dt-card dt-skeleton">
      <div className="dt-card-head">
        <div className="dt-skel dt-skel-pill" />
        <div className="dt-skel dt-skel-badge" />
      </div>
      <div className="dt-card-info">
        {[1, 2, 3, 4].map(i => (
          <div className="dt-info-row" key={i}>
            <div className="dt-skel dt-skel-icon" />
            <div className="dt-info-text" style={{ flex: 1 }}>
              <div className="dt-skel dt-skel-label" />
              <div className="dt-skel dt-skel-val" style={{ width: i % 2 === 0 ? "70%" : "55%" }} />
            </div>
          </div>
        ))}
      </div>
      <div className="dt-card-foot">
        <div className="dt-skel dt-skel-btn" />
        <div className="dt-skel dt-skel-btn dt-skel-btn-wide" />
      </div>
    </div>
  );
}

/* ── Task Card ── */
function DeliveryCard({ task, onViewDetails, onAction, isActing }) {
  const st  = STATUS[task.status] ?? {};
  const cfg = ACTION_CFG[task.rawStatus] ?? null;

  return (
    <div className="dt-card" style={{ "--st-color": st.dot }}>
      <div className="dt-card-head">
        <div className="dt-card-head-left">
          <div className={`dt-type-icon ${task.taskType === "pickup" ? "dt-ti-pickup" : "dt-ti-delivery"}`}>
            <Icon d={task.taskType === "pickup" ? Icons.package : Icons.truck} size={13} />
          </div>
          <span className="dt-order-id">{task.id}</span>
          <span className="dt-type-tag">{task.taskType === "pickup" ? "PICKUP" : "DELIVERY"}</span>
        </div>
        <span className="dt-badge"
          style={{ background: st.bg, color: st.color, borderColor: st.border }}>
          <span className="dt-badge-dot" style={{ background: st.dot }} />
          {task.status}
        </span>
      </div>

      <div className="dt-card-info">
        {[
          { icon: Icons.user,   label: "Customer", value: `${task.customer}${task.phone ? " · " + task.phone : ""}` },
          { icon: Icons.map,    label: "Address",  value: task.address  },
          { icon: Icons.device, label: "Device",   value: task.device   },
          { icon: Icons.clock,  label: "Time",     value: task.time     },
        ].map(r => (
          <div className="dt-info-row" key={r.label}>
            <div className="dt-info-icon"><Icon d={r.icon} size={13} /></div>
            <div className="dt-info-text">
              <span className="dt-info-label">{r.label}</span>
              <span className="dt-info-val">{r.value}</span>
            </div>
          </div>
        ))}
      </div>

      {task.otp && (
        <div className="dt-otp-strip">
          <Icon d={Icons.shield} size={12} />
          OTP: <strong className="dt-otp-code">{task.otp}</strong>
        </div>
      )}

      <div className="dt-card-foot">
        <button className="dt-btn dt-btn-ghost" onClick={() => onViewDetails(task)}>
          Details
        </button>
        {cfg ? (
          <button
            className={`dt-btn ${cfg.variant}`}
            disabled={isActing}
            onClick={() => onAction(task)}
          >
            {isActing
              ? <span className="dt-btn-spinner" />
              : <Icon d={cfg.icon} size={12} />
            }
            {isActing ? "Updating…" : cfg.label}
          </button>
        ) : (task.rawStatus === "completed" || task.rawStatus === "delivered") ? (
          <button className="dt-btn dt-btn-done" disabled>
            <Icon d={Icons.check} size={12} /> Delivered
          </button>
        ) : null}
      </div>
    </div>
  );
}

/* ── Main Component ── */
export default function DeliveryTasks() {
  const [tasks,        setTasks]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [actionId,     setActionId]     = useState(null);
  const [search,       setSearch]       = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [modal,        setModal]        = useState(null);

  /* ── Fetch & normalise ── */
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyTasks();
      setTasks((data ?? []).map(normalise));
    } catch (err) {
      console.error("Failed to load tasks:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── Status action → API ── */
  const handleAction = useCallback(async (task) => {
    if (task.rawStatus === "in_progress") {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(task.address)}`,
        "_blank"
      );
      return;
    }
    const nextMap = { pending: "accepted", accepted: "in_progress" };
    const next = nextMap[task.rawStatus];
    if (!next) return;

    setActionId(task._id);
    try {
      await updateTaskStatus(task._id, next);
      await load();
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setActionId(null);
    }
  }, [load]);

  /* ── Filtered list ── */
  const filtered = tasks.filter(t => {
    const q = search.toLowerCase();
    const matchSearch =
      t.id.toLowerCase().includes(q)       ||
      t.customer.toLowerCase().includes(q) ||
      t.address.toLowerCase().includes(q)  ||
      t.device.toLowerCase().includes(q)   ||
      t.phone.toLowerCase().includes(q);
    const matchFilter = activeFilter === "All" || t.status === activeFilter;
    return matchSearch && matchFilter;
  });

  /* ── Counts ── */
  const counts = FILTERS.reduce((acc, f) => {
    acc[f] = f === "All" ? tasks.length : tasks.filter(t => t.status === f).length;
    return acc;
  }, {});

  /* ── Stats strip data (top 3 active states) ── */
  const stripStats = [
    { key: "Pending",          dot: STATUS["Pending"]?.dot          },
    { key: "Out For Delivery", dot: STATUS["Out For Delivery"]?.dot  },
    { key: "Delivered",        dot: STATUS["Delivered"]?.dot         },
  ];

  return (
    <div className="dt-root">

      {/* ── Stats strip ── */}
      <div className="dt-stats-strip">
        {stripStats.map(({ key, dot }) => (
          <div className="dt-strip-item" key={key}>
            <span className="dt-strip-dot" style={{ background: dot }} />
            <strong style={{ color: STATUS[key]?.color }}>{counts[key] ?? 0}</strong>
            <span>{key}</span>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="dt-toolbar">
        <div className="dt-search-wrap">
          <svg className="dt-search-icon" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={Icons.search} />
          </svg>
          <input
            className="dt-search"
            type="text"
            placeholder="Search order, customer, address, device…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="dt-search-clear" onClick={() => setSearch("")}>
              <Icon d={Icons.x} size={13} />
            </button>
          )}
        </div>

        <div className="dt-filters">
          {FILTERS.map(f => (
            <button
              key={f}
              className={`dt-filter-btn ${activeFilter === f ? "dt-filter-btn--active" : ""}`}
              onClick={() => setActiveFilter(f)}
            >
              {f}
              <span className="dt-filter-count">{counts[f] ?? 0}</span>
            </button>
          ))}
        </div>

        <button className="dt-refresh-btn" onClick={load} disabled={loading}>
          <Icon d={Icons.refresh} size={14} />
        </button>
      </div>

      {/* ── Results label ── */}
      {!loading && (
        <p className="dt-results-label">
          Showing <strong>{filtered.length}</strong> of {tasks.length} tasks
        </p>
      )}

      {/* ── Cards grid ── */}
      <div className="dt-grid">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : filtered.length === 0 ? (
          <div className="dt-empty">
            <div className="dt-empty-icon-wrap">
              <Icon d={search ? Icons.search : Icons.truck} size={28} />
            </div>
            <p className="dt-empty-title">
              {search ? "No results found" : "No tasks here"}
            </p>
            <span className="dt-empty-sub">
              {search
                ? `No tasks match "${search}"`
                : activeFilter !== "All"
                  ? `No ${activeFilter.toLowerCase()} tasks right now`
                  : "You have no assigned tasks"
              }
            </span>
            {(search || activeFilter !== "All") && (
              <button className="dt-empty-reset"
                onClick={() => { setSearch(""); setActiveFilter("All"); }}>
                Clear filters
              </button>
            )}
          </div>
        ) : (
          filtered.map(task => (
            <DeliveryCard
              key={task._id}
              task={task}
              onViewDetails={setModal}
              onAction={handleAction}
              isActing={actionId === task._id}
            />
          ))
        )}
      </div>

      {modal && <DetailsModal task={modal} onClose={() => setModal(null)} />}
    </div>
  );
}