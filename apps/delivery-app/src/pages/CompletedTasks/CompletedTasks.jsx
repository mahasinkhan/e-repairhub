import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Package, Truck, CheckCircle2, Search, X, RefreshCw,
  User, MapPin, Wrench, Clock, Phone, Hash, Eye,
  ChevronDown,
} from "lucide-react";
import { getMyTasks } from "../../services/delivery.api.js";
import "./CompletedTasks.css";

/* ── Date helpers ── */
function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d    = new Date(dateStr);
  const now  = new Date();
  const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff <= 7)  return `${diff} days ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function matchesDateFilter(task, filter) {
  if (filter === "All Time") return true;
  if (filter === "Today")     return task.date === "Today";
  if (filter === "Yesterday") return task.date === "Yesterday";
  if (filter === "This Week") {
    if (!task.completedAt) return false;
    return (Date.now() - new Date(task.completedAt)) / 86400000 <= 7;
  }
  return true;
}

/* ── Normalise backend task ── */
function normalise(t) {
  const brand       = t.order?.deviceDetails?.brand ?? "";
  const model       = t.order?.deviceDetails?.model ?? "";
  const completedAt = t.completedAt ?? t.updatedAt;
  return {
    _id:         t._id,
    id:          t.order?.orderNumber ?? t._id,
    taskType:    t.taskType,
    customer:    t.order?.customer?.name    ?? "—",
    phone:       t.order?.customer?.phone   ?? "",
    device:      [brand, model].filter(Boolean).join(" ") || "—",
    address:     t.order?.customer?.address ?? "—",
    service:     t.order?.serviceType ?? "—",
    price:       t.order?.price ?? null,
    completedAt,
    time:        completedAt
                   ? new Date(completedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
                   : "—",
    date:        formatDate(completedAt),
  };
}

/* ── Skeleton card ── */
function Skeleton() {
  return (
    <div className="cpt-card cpt-skeleton">
      <div className="cpt-card-head">
        <div className="cpt-skel cpt-skel-pill" />
        <div className="cpt-skel cpt-skel-badge" />
      </div>
      {[1,2,3,4].map(i => (
        <div className="cpt-info-row" key={i}>
          <div className="cpt-skel cpt-skel-icon" />
          <div style={{ flex:1 }}>
            <div className="cpt-skel cpt-skel-lbl" />
            <div className="cpt-skel cpt-skel-val" style={{ width: i%2===0 ? "65%" : "50%" }} />
          </div>
        </div>
      ))}
      <div className="cpt-card-foot">
        <div className="cpt-skel cpt-skel-btn" />
      </div>
    </div>
  );
}

/* ── Task Card ── */
function TaskCard({ task, onView }) {
  const isPickup = task.taskType === "pickup";
  return (
    <div className="cpt-card">
      <div className="cpt-card-head">
        <div className="cpt-card-head-left">
          <div className={`cpt-type-icon ${isPickup ? "cpt-ti-pickup" : "cpt-ti-delivery"}`}>
            {isPickup ? <Package size={13} /> : <Truck size={13} />}
          </div>
          <span className="cpt-order-id">{task.id}</span>
          <span className={`cpt-type-chip ${isPickup ? "cpt-chip-pickup" : "cpt-chip-delivery"}`}>
            {isPickup ? "PICKUP" : "DELIVERY"}
          </span>
        </div>
        <span className="cpt-done-badge">
          <CheckCircle2 size={11} /> Completed
        </span>
      </div>

      <div className="cpt-info-rows">
        {[
          { icon: User,   label: "Customer", value: `${task.customer}${task.phone ? " · " + task.phone : ""}` },
          { icon: Wrench, label: "Device",   value: task.device  },
          { icon: MapPin, label: "Address",  value: task.address },
          { icon: Clock,  label: "Completed",value: `${task.date} · ${task.time}`, green: true },
        ].map(r => (
          <div className="cpt-info-row" key={r.label}>
            <div className="cpt-info-icon"><r.icon size={13} /></div>
            <div className="cpt-info-text">
              <span className="cpt-info-lbl">{r.label}</span>
              <span className={`cpt-info-val ${r.green ? "cpt-info-val-green" : ""}`}>{r.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="cpt-card-foot">
        <button className="cpt-view-btn" onClick={() => onView(task)}>
          <Eye size={13} /> View Details
        </button>
      </div>
    </div>
  );
}

/* ── Details Modal ── */
function Modal({ task, onClose }) {
  const isPickup = task.taskType === "pickup";
  const rows = [
    { icon: Hash,    label: "Order ID",    value: task.id,       mono: true },
    { icon: User,    label: "Customer",    value: task.customer              },
    { icon: Phone,   label: "Phone",       value: task.phone || "—"          },
    { icon: Wrench,  label: "Device",      value: task.device                },
    { icon: MapPin,  label: "Address",     value: task.address               },
    { icon: Wrench,  label: "Service",     value: task.service               },
    ...(task.price != null ? [{ icon: Hash, label: "Price", value: `₹${Number(task.price).toLocaleString("en-IN")}` }] : []),
    { icon: Clock,   label: "Completed",  value: `${task.date} · ${task.time}` },
  ];

  return (
    <div className="cpt-overlay" onClick={onClose}>
      <div className="cpt-modal" onClick={e => e.stopPropagation()}>
        <div className="cpt-modal-head">
          <div className="cpt-modal-head-left">
            <div className={`cpt-modal-icon ${isPickup ? "cpt-mi-pickup" : "cpt-mi-delivery"}`}>
              {isPickup ? <Package size={16} /> : <Truck size={16} />}
            </div>
            <div>
              <h2 className="cpt-modal-title">Completed Task</h2>
              <p className="cpt-modal-sub">{task.id}</p>
            </div>
          </div>
          <button className="cpt-modal-close" onClick={onClose}><X size={14} /></button>
        </div>

        <div className="cpt-modal-status-bar">
          <span className="cpt-done-badge">
            <CheckCircle2 size={11} /> Completed
          </span>
          <span className="cpt-modal-type">
            {isPickup ? "↑ Pickup" : "↓ Delivery"}
          </span>
        </div>

        <div className="cpt-modal-body">
          {rows.map(r => (
            <div className="cpt-modal-row" key={r.label}>
              <div className="cpt-modal-row-icon"><r.icon size={13} /></div>
              <div>
                <p className="cpt-modal-row-lbl">{r.label}</p>
                <p className={`cpt-modal-row-val ${r.mono ? "cpt-mono" : ""}`}>{r.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="cpt-modal-foot">
          <button className="cpt-btn cpt-btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ── */
export default function CompletedTasks() {
  const [tasks,    setTasks]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [typeFilt, setTypeFilt] = useState("All");
  const [dateFilt, setDateFilt] = useState("All Time");
  const [modal,    setModal]    = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyTasks();
      setTasks((data ?? []).filter(t => t.status === "completed").map(normalise));
    } catch (e) { console.error("Failed to load:", e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* Stats */
  const stats = useMemo(() => ({
    total:      tasks.length,
    today:      tasks.filter(t => t.date === "Today").length,
    pickups:    tasks.filter(t => t.taskType === "pickup").length,
    deliveries: tasks.filter(t => t.taskType === "delivery").length,
  }), [tasks]);

  /* Filtered list */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return tasks.filter(t => {
      const matchQ =
        !q ||
        t.id.toLowerCase().includes(q)       ||
        t.customer.toLowerCase().includes(q) ||
        t.device.toLowerCase().includes(q)   ||
        t.address.toLowerCase().includes(q)  ||
        t.phone.includes(q);
      const matchType = typeFilt === "All" || t.taskType === typeFilt.toLowerCase();
      const matchDate = matchesDateFilter(t, dateFilt);
      return matchQ && matchType && matchDate;
    });
  }, [tasks, search, typeFilt, dateFilt]);

  const TYPE_FILTERS = ["All", "Pickup", "Delivery"];
  const DATE_FILTERS = ["All Time", "Today", "Yesterday", "This Week"];

  return (
    <div className="cpt-root">

      {/* ── Page header ── */}
      <div className="cpt-page-head">
        <div>
          <h1 className="cpt-title">Completed Tasks</h1>
          <p className="cpt-subtitle">All successfully completed pickup &amp; delivery orders</p>
        </div>
        <button className="cpt-refresh-btn" onClick={load} disabled={loading}>
          <RefreshCw size={13} className={loading ? "cpt-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ── Stats strip ── */}
      <div className="cpt-stats">
        {[
          { label: "Total Completed", value: stats.total,      color: "cpt-stat-green",   sub: "All time" },
          { label: "Today",           value: stats.today,      color: "cpt-stat-orange",  sub: "Completed today" },
          { label: "Pickups",         value: stats.pickups,    color: "cpt-stat-purple",  sub: "Device collections" },
          { label: "Deliveries",      value: stats.deliveries, color: "cpt-stat-blue",    sub: "Device returns" },
        ].map(s => (
          <div key={s.label} className={`cpt-stat ${s.color}`}>
            <p className="cpt-stat-label">{s.label}</p>
            <p className="cpt-stat-val">{loading ? "—" : s.value}</p>
            <p className="cpt-stat-sub">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="cpt-toolbar">
        {/* Search */}
        <div className="cpt-search-wrap">
          <Search size={14} className="cpt-search-ico" />
          <input
            className="cpt-search"
            type="text"
            placeholder="Search order, customer, device…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="cpt-search-clear" onClick={() => setSearch("")}>
              <X size={13} />
            </button>
          )}
        </div>

        {/* Type filter */}
        <div className="cpt-filter-group">
          {TYPE_FILTERS.map(f => (
            <button
              key={f}
              className={`cpt-filter-pill ${typeFilt === f ? "cpt-pill-active" : ""}`}
              onClick={() => setTypeFilt(f)}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Date filter */}
        <div className="cpt-filter-group">
          {DATE_FILTERS.map(f => (
            <button
              key={f}
              className={`cpt-filter-pill ${dateFilt === f ? "cpt-pill-active" : ""}`}
              onClick={() => setDateFilt(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Results label ── */}
      {!loading && (
        <p className="cpt-results-lbl">
          Showing <strong>{filtered.length}</strong> of {tasks.length} completed tasks
        </p>
      )}

      {/* ── Grid ── */}
      <div className="cpt-grid">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)
        ) : filtered.length === 0 ? (
          <div className="cpt-empty">
            <div className="cpt-empty-icon"><CheckCircle2 size={28} /></div>
            <p className="cpt-empty-title">
              {search ? "No results found" : "No completed tasks yet"}
            </p>
            <span className="cpt-empty-sub">
              {search
                ? `Nothing matches "${search}"`
                : "Completed tasks will appear here"}
            </span>
            {(search || typeFilt !== "All" || dateFilt !== "All Time") && (
              <button className="cpt-empty-reset"
                onClick={() => { setSearch(""); setTypeFilt("All"); setDateFilt("All Time"); }}>
                Clear filters
              </button>
            )}
          </div>
        ) : (
          filtered.map(t => <TaskCard key={t._id} task={t} onView={setModal} />)
        )}
      </div>

      {modal && <Modal task={modal} onClose={() => setModal(null)} />}
    </div>
  );
}