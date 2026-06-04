import { useEffect, useState } from "react";
import {
  Package, RefreshCw, MapPin, Phone, ArrowRight,
  CheckCircle, Clock, Navigation, Shield,
} from "lucide-react";
import { getMyTasks, updateTaskStatus } from "../../services/delivery.api.js";
import "./PickupManagement.css";

/* ─── Column config ─── */
const CONFIGS = [
  {
    key:        "pending",
    label:      "Pending",
    accent:     "#854d0e",
    chipBg:     "#fef9c3",
    headerBg:   "#fffde7",
    icon:       Clock,
    next:       "accepted",
    action:     "Accept Task",
    actionIcon: CheckCircle,
  },
  {
    key:        "accepted",
    label:      "Accepted",
    accent:     "#1d4ed8",
    chipBg:     "#dbeafe",
    headerBg:   "#eff6ff",
    icon:       Package,
    next:       "in_progress",
    action:     "Start Pickup",
    actionIcon: Navigation,
  },
  {
    key:        "in_progress",
    label:      "In Progress",
    accent:     "#c2410c",
    chipBg:     "#ffedd5",
    headerBg:   "#fff7ed",
    icon:       Navigation,
    next:       "completed",
    action:     "Complete Pickup",
    actionIcon: CheckCircle,
  },
  {
    key:        "completed",
    label:      "Completed",
    accent:     "#15803d",
    chipBg:     "#dcfce7",
    headerBg:   "#f0fdf4",
    icon:       CheckCircle,
    next:       null,
    action:     "",
    actionIcon: null,
  },
];

export default function PickupManagement() {
  const [tasks,    setTasks]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [actionId, setActionId] = useState(null);
  const [messages, setMessages] = useState({});

  /* ── Data loading (unchanged) ── */
  const load = async () => {
    setLoading(true);
    try {
      const data = await getMyTasks();
      setTasks((data ?? []).filter(t => t.taskType === "pickup"));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  /* ── Status transition (unchanged) ── */
  const handleAction = async (task, nextStatus) => {
    setActionId(task._id);
    try {
      await updateTaskStatus(task._id, nextStatus);
      setMessages(m => ({ ...m, [task._id]: `Updated to ${nextStatus}` }));
      load();
    } catch (err) {
      setMessages(m => ({ ...m, [task._id]: err.message }));
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
    <div className="pm-root">

      {/* ── Page Header ── */}
      <div className="pm-header">
        <div>
          <h1 className="pm-title">Pickup Management</h1>
          <p className="pm-sub">Track and manage all pickup tasks</p>
        </div>
        <div className="pm-header-right">
          <div className="pm-chip pm-chip--orange">
            <Navigation size={12} />
            {groups.in_progress.length} In Progress
          </div>
          <div className="pm-chip pm-chip--green">
            <CheckCircle size={12} />
            {groups.completed.length} Completed
          </div>
          <button onClick={load} className="pm-refresh-btn">
            <RefreshCw size={13} className={loading ? "pm-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Kanban Board ── */}
      {loading ? (
        <div className="pm-loading">
          <RefreshCw size={24} className="pm-spin" />
          <p>Loading pickups…</p>
        </div>
      ) : (
        <div className="pm-kanban">
          {CONFIGS.map(cfg => {
            const ColIcon = cfg.icon;
            return (
              <div key={cfg.key} className="pm-col" style={{ "--col-accent": cfg.accent }}>

                {/* Column Header */}
                <div className="pm-col-head" style={{ background: cfg.headerBg }}>
                  <div className="pm-col-head-left">
                    <div className="pm-col-icon" style={{ color: cfg.accent, background: cfg.chipBg }}>
                      <ColIcon size={13} />
                    </div>
                    <span className="pm-col-title" style={{ color: cfg.accent }}>
                      {cfg.label}
                    </span>
                  </div>
                  <span className="pm-col-count" style={{ background: cfg.chipBg, color: cfg.accent }}>
                    {groups[cfg.key].length}
                  </span>
                </div>

                {/* Tasks */}
                <div className="pm-col-body">
                  {groups[cfg.key].length === 0 ? (
                    <div className="pm-col-empty">
                      <Package size={22} className="pm-empty-icon" />
                      <span>No pickups</span>
                    </div>
                  ) : (
                    groups[cfg.key].map(task => {
                      const ActionIcon = cfg.actionIcon;
                      const busy       = actionId === task._id;
                      const msg        = messages[task._id];
                      const isOk       = msg && !msg.toLowerCase().includes("error");

                      return (
                        <div key={task._id} className="pm-task">

                          {/* Task top row */}
                          <div className="pm-task-top">
                            <span className="pm-task-id">{task.order?.orderNumber}</span>
                            <span className="pm-otp-badge">
                              <Shield size={9} />
                              {task.otp}
                            </span>
                          </div>

                          {/* Task details */}
                          <div className="pm-task-rows">
                            <div className="pm-task-row">
                              <Phone size={11} />
                              <span>{task.order?.customer?.name} · {task.order?.customer?.phone}</span>
                            </div>
                            <div className="pm-task-row">
                              <MapPin size={11} />
                              <span>{task.order?.customer?.address}</span>
                            </div>
                            {task.order?.deviceDetails && (
                              <div className="pm-task-row">
                                <Package size={11} />
                                <span>
                                  {task.order.deviceDetails.brand} {task.order.deviceDetails.model}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Status message */}
                          {msg && (
                            <p className={`pm-task-msg ${isOk ? "pm-task-msg--ok" : "pm-task-msg--err"}`}>
                              {msg}
                            </p>
                          )}

                          {/* Action button */}
                          {cfg.next && (
                            <button
                              onClick={() => handleAction(task, cfg.next)}
                              disabled={busy}
                              className="pm-action-btn"
                              style={{
                                background:  cfg.chipBg,
                                color:       cfg.accent,
                                borderColor: `${cfg.accent}35`,
                              }}
                            >
                              {busy
                                ? <RefreshCw size={11} className="pm-spin" />
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