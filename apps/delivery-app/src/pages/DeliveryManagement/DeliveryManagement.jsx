import { useEffect, useState } from "react";
import {
  Truck, RefreshCw, MapPin, Phone, ArrowRight,
  CheckCircle, Clock, Package, Navigation, Shield,
} from "lucide-react";
import { getMyTasks, updateTaskStatus } from "../../services/delivery.api.js";
import "./DeliveryManagement.css";

/* ─── Column config (unchanged logic) ─── */
const CONFIGS = [
  {
    key:       "pending",
    label:     "Pending",
    accent:    "#854d0e",
    chipBg:    "#fef9c3",
    headerBg:  "#fffde7",
    icon:      Clock,
    next:      "accepted",
    action:    "Accept Delivery",
    actionIcon: CheckCircle,
  },
  {
    key:       "accepted",
    label:     "Accepted",
    accent:    "#1d4ed8",
    chipBg:    "#dbeafe",
    headerBg:  "#eff6ff",
    icon:      Package,
    next:      "in_progress",
    action:    "Start Delivery",
    actionIcon: Truck,
  },
  {
    key:       "in_progress",
    label:     "Out for Delivery",
    accent:    "#c2410c",
    chipBg:    "#ffedd5",
    headerBg:  "#fff7ed",
    icon:      Navigation,
    next:      "completed",
    action:    "Mark Delivered",
    actionIcon: CheckCircle,
  },
  {
    key:       "completed",
    label:     "Delivered",
    accent:    "#15803d",
    chipBg:    "#dcfce7",
    headerBg:  "#f0fdf4",
    icon:      CheckCircle,
    next:      null,
    action:    "",
    actionIcon: null,
  },
];

export default function DeliveryManagement() {
  const [tasks,    setTasks]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [actionId, setActionId] = useState(null);

  /* ── Data loading (unchanged) ── */
  const load = async () => {
    setLoading(true);
    try {
      const data = await getMyTasks();
      setTasks((data ?? []).filter(t => t.taskType === "delivery"));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  /* ── Status transition (unchanged) ── */
  const handleAction = async (task, nextStatus) => {
    setActionId(task._id);
    try {
      await updateTaskStatus(task._id, nextStatus);
      load();
    } catch (err) {
      console.error(err);
    } finally { setActionId(null); }
  };

  /* ── Grouped tasks ── */
  const groups = {
    pending:     tasks.filter(t => t.status === "pending"),
    accepted:    tasks.filter(t => t.status === "accepted"),
    in_progress: tasks.filter(t => t.status === "in_progress"),
    completed:   tasks.filter(t => t.status === "completed"),
  };

  return (
    <div className="dm-root">

      {/* ── Page Header ── */}
      <div className="dm-header">
        <div>
          <h1 className="dm-page-title">Delivery Management</h1>
          <p className="dm-page-sub">Track and manage all delivery tasks</p>
        </div>
        <div className="dm-header-right">
          <div className="dm-stat-chip dm-chip--orange">
            <Truck size={12} />
            {groups.in_progress.length} Out for delivery
          </div>
          <div className="dm-stat-chip dm-chip--green">
            <CheckCircle size={12} />
            {groups.completed.length} Delivered
          </div>
          <button onClick={load} className="dm-refresh-btn">
            <RefreshCw size={13} className={loading ? "dm-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Kanban Board ── */}
      {loading ? (
        <div className="dm-loading">
          <RefreshCw size={24} className="dm-spin" />
          <p>Loading deliveries…</p>
        </div>
      ) : (
        <div className="dm-kanban">
          {CONFIGS.map(cfg => {
            const ColIcon  = cfg.icon;
            return (
              <div key={cfg.key} className="dm-col" style={{ "--col-accent": cfg.accent }}>

                {/* Column Header */}
                <div className="dm-col-head" style={{ background: cfg.headerBg }}>
                  <div className="dm-col-head-left">
                    <div className="dm-col-icon" style={{ color: cfg.accent, background: cfg.chipBg }}>
                      <ColIcon size={13} />
                    </div>
                    <span className="dm-col-title" style={{ color: cfg.accent }}>
                      {cfg.label}
                    </span>
                  </div>
                  <span className="dm-col-count" style={{ background: cfg.chipBg, color: cfg.accent }}>
                    {groups[cfg.key].length}
                  </span>
                </div>

                {/* Task List */}
                <div className="dm-col-body">
                  {groups[cfg.key].length === 0 ? (
                    <div className="dm-col-empty">
                      <Truck size={22} className="dm-empty-icon" />
                      <span>No deliveries</span>
                    </div>
                  ) : (
                    groups[cfg.key].map(task => {
                      const ActionIcon = cfg.actionIcon;
                      const busy       = actionId === task._id;
                      return (
                        <div key={task._id} className="dm-task">

                          {/* Task top row */}
                          <div className="dm-task-top">
                            <span className="dm-task-id">{task.order?.orderNumber}</span>
                            <span className="dm-otp-badge">
                              <Shield size={9} />
                              {task.otp}
                            </span>
                          </div>

                          {/* Task details */}
                          <div className="dm-task-rows">
                            <div className="dm-task-row">
                              <Phone size={11} />
                              <span>{task.order?.customer?.name} · {task.order?.customer?.phone}</span>
                            </div>
                            <div className="dm-task-row">
                              <MapPin size={11} />
                              <span>{task.order?.customer?.address}</span>
                            </div>
                            {task.order?.deviceDetails && (
                              <div className="dm-task-row">
                                <Package size={11} />
                                <span>
                                  {task.order.deviceDetails.brand} {task.order.deviceDetails.model}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Action button */}
                          {cfg.next && (
                            <button
                              onClick={() => handleAction(task, cfg.next)}
                              disabled={busy}
                              className="dm-action-btn"
                              style={{
                                background: cfg.chipBg,
                                color:      cfg.accent,
                                borderColor: `${cfg.accent}35`,
                              }}
                            >
                              {busy
                                ? <RefreshCw size={11} className="dm-spin" />
                                : ActionIcon && <ActionIcon size={11} />
                              }
                              {busy ? "Updating…" : cfg.action}
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}