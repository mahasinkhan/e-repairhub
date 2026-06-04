import { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck, Package, Truck, RefreshCw,
  ChevronRight, MapPin, Phone, CheckCircle2,
} from "lucide-react";
import { getMyTasks } from "../../services/delivery.api.js";
import OtpVerification from "./OtpVerification.jsx";
import "./OtpVerificationPage.css";

/* ── Status config ── */
const STATUS = {
  pending:     { label: "Pending",     color: "#854d0e", bg: "#fef9c3" },
  accepted:    { label: "Accepted",    color: "#1d4ed8", bg: "#dbeafe" },
  in_progress: { label: "In Progress", color: "#c2410c", bg: "#ffedd5" },
  completed:   { label: "Completed",   color: "#15803d", bg: "#dcfce7" },
  failed:      { label: "Failed",      color: "#b91c1c", bg: "#fee2e2" },
};

function TaskRow({ task, onSelect }) {
  const isPickup = task.taskType === "pickup";
  const st       = STATUS[task.status] ?? STATUS.pending;

  return (
    <div className="ovp-task-row" onClick={() => onSelect(task)}>
      <div className="ovp-task-row-left">
        {/* Type icon */}
        <div className={`ovp-task-icon ${isPickup ? "ovp-ti-pickup" : "ovp-ti-delivery"}`}>
          {isPickup ? <Package size={16} /> : <Truck size={16} />}
        </div>

        {/* Info */}
        <div className="ovp-task-info">
          <div className="ovp-task-top-row">
            <span className="ovp-task-id">{task.order?.orderNumber}</span>
            <span className="ovp-type-badge">{isPickup ? "PICKUP" : "DELIVERY"}</span>
            <span className="ovp-status-pill" style={{ color: st.color, background: st.bg }}>
              {st.label}
            </span>
          </div>
          <div className="ovp-task-meta">
            <span className="ovp-meta-item">
              <Phone size={11} />{task.order?.customer?.name} · {task.order?.customer?.phone}
            </span>
            <span className="ovp-meta-item">
              <MapPin size={11} />{task.order?.customer?.address}
            </span>
          </div>
          <p className="ovp-task-device">
            {task.order?.deviceDetails?.brand} {task.order?.deviceDetails?.model}
          </p>
        </div>
      </div>

      <div className="ovp-task-row-right">
        <button className="ovp-verify-btn">
          <ShieldCheck size={14} /> Verify OTP
        </button>
        <ChevronRight size={16} className="ovp-chevron" />
      </div>
    </div>
  );
}

export default function OtpVerificationPage() {
  const [tasks,        setTasks]       = useState([]);
  const [loading,      setLoading]     = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [doneTask,     setDoneTask]    = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyTasks();
      setTasks(data ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* Tasks that still need OTP */
  const pending  = tasks.filter(t => ["accepted", "in_progress"].includes(t.status));
  const done     = tasks.filter(t => t.status === "completed");

  /* ── If a task is selected, show the OTP flow ── */
  if (selectedTask) {
    return (
      <OtpVerification
        task={selectedTask}
        flowType={selectedTask.taskType === "pickup" ? "pickup" : "delivery"}
        onBack={() => setSelectedTask(null)}
        onComplete={(updated) => {
          setDoneTask(updated ?? selectedTask);
          setSelectedTask(null);
          load();
        }}
      />
    );
  }

  return (
    <div className="ovp-root">

      {/* ── Page header ── */}
      <div className="ovp-header">
        <div className="ovp-header-left">
          <div className="ovp-header-icon">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h1 className="ovp-title">OTP Verification</h1>
            <p className="ovp-subtitle">Select a task to verify and complete</p>
          </div>
        </div>
        <button onClick={load} className="ovp-refresh-btn">
          <RefreshCw size={13} className={loading ? "ovp-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ── Success toast ── */}
      {doneTask && (
        <div className="ovp-toast" onClick={() => setDoneTask(null)}>
          <CheckCircle2 size={16} />
          <span>Order <strong>{doneTask.order?.orderNumber ?? doneTask.id}</strong> marked as completed.</span>
          <span className="ovp-toast-close">✕</span>
        </div>
      )}

      {/* ── Stats strip ── */}
      <div className="ovp-stats">
        <div className="ovp-stat">
          <strong className="ovp-stat-num ovp-stat-orange">{pending.length}</strong>
          <span>Awaiting OTP</span>
        </div>
        <div className="ovp-stat-div" />
        <div className="ovp-stat">
          <strong className="ovp-stat-num ovp-stat-green">{done.length}</strong>
          <span>Verified today</span>
        </div>
        <div className="ovp-stat-div" />
        <div className="ovp-stat">
          <strong className="ovp-stat-num">{tasks.length}</strong>
          <span>Total assigned</span>
        </div>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="ovp-state-center">
          <div className="ovp-spinner" />
          <p>Loading tasks…</p>
        </div>
      )}

      {/* ── Pending OTP tasks ── */}
      {!loading && (
        <>
          <section className="ovp-section">
            <div className="ovp-section-head">
              <div className="ovp-section-dot ovp-dot-orange" />
              <h2 className="ovp-section-title">Needs Verification</h2>
              <span className="ovp-section-count">{pending.length}</span>
            </div>

            {pending.length === 0 ? (
              <div className="ovp-empty">
                <div className="ovp-empty-icon"><ShieldCheck size={28} /></div>
                <p className="ovp-empty-title">All caught up!</p>
                <span className="ovp-empty-sub">No tasks are waiting for OTP verification</span>
              </div>
            ) : (
              <div className="ovp-task-list">
                {pending.map(task => (
                  <TaskRow key={task._id} task={task} onSelect={setSelectedTask} />
                ))}
              </div>
            )}
          </section>

          {/* ── Completed tasks ── */}
          {done.length > 0 && (
            <section className="ovp-section">
              <div className="ovp-section-head">
                <div className="ovp-section-dot ovp-dot-green" />
                <h2 className="ovp-section-title">Completed</h2>
                <span className="ovp-section-count ovp-section-count-green">{done.length}</span>
              </div>
              <div className="ovp-task-list ovp-task-list-done">
                {done.map(task => {
                  const isPickup = task.taskType === "pickup";
                  return (
                    <div className="ovp-done-row" key={task._id}>
                      <div className={`ovp-task-icon ${isPickup ? "ovp-ti-pickup" : "ovp-ti-delivery"} ovp-icon-sm`}>
                        {isPickup ? <Package size={13} /> : <Truck size={13} />}
                      </div>
                      <div className="ovp-task-info">
                        <div className="ovp-task-top-row">
                          <span className="ovp-task-id">{task.order?.orderNumber}</span>
                          <span className="ovp-type-badge">{isPickup ? "PICKUP" : "DELIVERY"}</span>
                        </div>
                        <div className="ovp-task-meta">
                          <span className="ovp-meta-item">
                            <Phone size={11} />{task.order?.customer?.name} · {task.order?.customer?.phone}
                          </span>
                          <span className="ovp-meta-item">
                            <MapPin size={11} />{task.order?.customer?.address}
                          </span>
                        </div>
                      </div>
                      <span className="ovp-done-pill">
                        <CheckCircle2 size={12} /> Verified
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}