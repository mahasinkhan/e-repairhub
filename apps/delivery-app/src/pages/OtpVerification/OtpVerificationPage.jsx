import { useState, useEffect, useCallback, useRef } from "react";
import {
  ShieldCheck, Package, Truck, RefreshCw,
  ChevronRight, MapPin, Phone, CheckCircle2,
  ArrowLeft, Send, AlertCircle, User, Wrench,
} from "lucide-react";
import { getMyTasks, updateTaskStatus } from "../../services/delivery.api.js";
import "./OtpVerificationPage.css";

/* ── Status config ── */
const STATUS = {
  pending:     { label: "Pending",     color: "#854d0e", bg: "#fef9c3" },
  accepted:    { label: "Accepted",    color: "#1d4ed8", bg: "#dbeafe" },
  in_progress: { label: "In Progress", color: "#c2410c", bg: "#ffedd5" },
  completed:   { label: "Completed",   color: "#15803d", bg: "#dcfce7" },
  failed:      { label: "Failed",      color: "#b91c1c", bg: "#fee2e2" },
};

/* ── 6-digit OTP Input ── */
function OtpInput({ value, onChange, disabled }) {
  const refs  = useRef([]);
  const digits = value.split("").concat(Array(6).fill("")).slice(0, 6);

  const handleChange = (i, v) => {
    if (!/^\d*$/.test(v)) return;
    const next = [...digits]; next[i] = v.slice(-1);
    onChange(next.join(""));
    if (v && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const handlePaste = (e) => {
    const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(p);
    if (p.length === 6) refs.current[5]?.focus();
  };

  return (
    <div className="ovp-otp-boxes">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el; }}
          type="text" inputMode="numeric" maxLength={1}
          value={d} disabled={disabled}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={`ovp-otp-box ${d ? "ovp-otp-box--filled" : ""}`}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   INLINE OTP FLOW  (replaces OtpVerification.jsx)
   Uses real API + Twilio — no taskStore.js
───────────────────────────────────────────── */
function TaskOtpFlow({ task, onBack, onComplete }) {
  const isPickup  = task.taskType === "pickup";
  const phone     = task.order?.customer?.phone;
  const alreadyIn = task.status === "in_progress"; // OTP already sent by Twilio

  /*
   * step:
   *  'ready'     — task is 'accepted', agent must start it (triggers Twilio OTP)
   *  'enter-otp' — task is 'in_progress', OTP sent, agent waits for customer to share it
   *  'success'   — completed
   */
  const [step,    setStep]    = useState(alreadyIn ? "enter-otp" : "ready");
  const [otp,     setOtp]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [resend,  setResend]  = useState(0); // countdown
  const timerRef = useRef(null);

  useEffect(() => {
    if (resend > 0) {
      timerRef.current = setTimeout(() => setResend(r => r - 1), 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [resend]);

  /* Step 1: accepted → in_progress (Twilio sends OTP to customer) */
  const handleStart = async () => {
    setLoading(true); setError("");
    try {
      await updateTaskStatus(task._id, "in_progress");
      setStep("enter-otp");
      setResend(60); // 60s before resend allowed
    } catch (e) {
      setError(e.message || "Failed to start task. Try again.");
    } finally { setLoading(false); }
  };

  /* Resend OTP: move back to in_progress triggers Twilio again */
  const handleResend = async () => {
    if (resend > 0) return;
    setLoading(true); setError("");
    try {
      await updateTaskStatus(task._id, "in_progress");
      setResend(60);
      setOtp("");
    } catch (e) {
      setError(e.message || "Failed to resend OTP.");
    } finally { setLoading(false); }
  };

  /* Step 2: completed (backend verifies OTP via Twilio) */
  const handleVerify = async () => {
    if (otp.length !== 6) { setError("Enter the full 6-digit OTP."); return; }
    setLoading(true); setError("");
    try {
      const updated = await updateTaskStatus(task._id, "completed", undefined, otp);
      setStep("success");
      setTimeout(() => onComplete(updated), 1200);
    } catch (e) {
      setError(e.message || "OTP verification failed. Check the code and retry.");
      setOtp("");
    } finally { setLoading(false); }
  };

  const order = task.order;

  return (
    <div className="ovp-root">
      <button className="ovp-back-btn" onClick={onBack}>
        <ArrowLeft size={15} /> Back to tasks
      </button>

      {/* Task summary card */}
      <div className="ovp-flow-card">
        <div className="ovp-flow-card-head">
          <div className={`ovp-task-icon ${isPickup ? "ovp-ti-pickup" : "ovp-ti-delivery"}`}
               style={{ width: 40, height: 40 }}>
            {isPickup ? <Package size={18} /> : <Truck size={18} />}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="ovp-task-id">{order?.orderNumber}</span>
              <span className="ovp-type-badge">{isPickup ? "PICKUP" : "DELIVERY"}</span>
            </div>
            <p className="ovp-flow-sub">
              {order?.deviceDetails?.brand} {order?.deviceDetails?.model}
            </p>
          </div>
        </div>
        <div className="ovp-flow-rows">
          <div className="ovp-flow-row"><User size={12} />{order?.customer?.name}</div>
          <div className="ovp-flow-row"><Phone size={12} />{phone}</div>
          <div className="ovp-flow-row"><MapPin size={12} />{order?.customer?.address}</div>
        </div>
      </div>

      {/* ── Step: ready (accepted) ── */}
      {step === "ready" && (
        <div className="ovp-step-card">
          <div className="ovp-step-icon ovp-step-icon-orange">
            <Send size={22} />
          </div>
          <h2 className="ovp-step-title">Start Task & Send OTP</h2>
          <p className="ovp-step-desc">
            Tapping below will mark this task as <strong>In Progress</strong> and
            send a one-time code to the customer's phone via SMS.
          </p>
          <div className="ovp-step-phone-box">
            <Phone size={14} />
            OTP will be sent to <strong>{phone?.slice(0,4)}****{phone?.slice(-2)}</strong>
          </div>

          {error && (
            <div className="ovp-msg ovp-msg-error">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <button className="ovp-action-btn" onClick={handleStart} disabled={loading}>
            {loading ? <RefreshCw size={15} className="ovp-spin" /> : <Send size={15} />}
            {loading ? "Starting…" : "Start Task & Send OTP to Customer"}
          </button>
        </div>
      )}

      {/* ── Step: enter-otp (in_progress) ── */}
      {step === "enter-otp" && (
        <div className="ovp-step-card">
          <div className="ovp-step-icon ovp-step-icon-purple">
            <ShieldCheck size={22} />
          </div>
          <h2 className="ovp-step-title">Enter Customer OTP</h2>
          <p className="ovp-step-desc">
            A 6-digit code has been sent to the customer's phone. Ask them for it and
            enter it below to verify and complete this {isPickup ? "pickup" : "delivery"}.
          </p>

          <div className="ovp-otp-sent-info">
            <CheckCircle2 size={14} />
            OTP sent to {phone?.slice(0,4)}****{phone?.slice(-2)} via SMS
          </div>

          <OtpInput value={otp} onChange={setOtp} disabled={loading} />

          <div className="ovp-resend-row">
            {resend > 0
              ? <span className="ovp-resend-timer">Resend available in {resend}s</span>
              : <button className="ovp-resend-btn" onClick={handleResend} disabled={loading}>
                  <RefreshCw size={12} /> Resend OTP
                </button>
            }
          </div>

          {error && (
            <div className="ovp-msg ovp-msg-error">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <button
            className="ovp-action-btn"
            onClick={handleVerify}
            disabled={loading || otp.length !== 6}
          >
            {loading ? <RefreshCw size={15} className="ovp-spin" /> : <ShieldCheck size={15} />}
            {loading ? "Verifying…" : `Verify OTP & Complete ${isPickup ? "Pickup" : "Delivery"}`}
          </button>
        </div>
      )}

      {/* ── Step: success ── */}
      {step === "success" && (
        <div className="ovp-step-card ovp-step-card-success">
          <CheckCircle2 size={48} className="ovp-success-icon" />
          <h2 className="ovp-step-title ovp-success-title">
            {isPickup ? "Pickup Complete!" : "Delivery Complete!"}
          </h2>
          <p className="ovp-step-desc">
            Order {order?.orderNumber} has been verified and marked as completed.
          </p>
        </div>
      )}
    </div>
  );
}

/* ── Task row in list ── */
function TaskRow({ task, onSelect }) {
  const isPickup = task.taskType === "pickup";
  const st       = STATUS[task.status] ?? STATUS.pending;

  return (
    <div className="ovp-task-row" onClick={() => onSelect(task)}>
      <div className="ovp-task-row-left">
        <div className={`ovp-task-icon ${isPickup ? "ovp-ti-pickup" : "ovp-ti-delivery"}`}>
          {isPickup ? <Package size={16} /> : <Truck size={16} />}
        </div>
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
          <ShieldCheck size={14} />
          {task.status === "in_progress" ? "Enter OTP" : "Start & Verify"}
        </button>
        <ChevronRight size={16} className="ovp-chevron" />
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function OtpVerificationPage() {
  const [tasks,        setTasks]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [doneTask,     setDoneTask]     = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyTasks();
      setTasks(data ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const pending = tasks.filter(t => ["accepted", "in_progress"].includes(t.status));
  const done    = tasks.filter(t => t.status === "completed");

  /* Show inline OTP flow (Twilio-backed, no OtpVerification.jsx) */
  if (selectedTask) {
    return (
      <TaskOtpFlow
        task={selectedTask}
        onBack={() => { setSelectedTask(null); load(); }}
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

      {/* Header */}
      <div className="ovp-header">
        <div className="ovp-header-left">
          <div className="ovp-header-icon"><ShieldCheck size={20} /></div>
          <div>
            <h1 className="ovp-title">OTP Verification</h1>
            <p className="ovp-subtitle">Verify tasks using Twilio SMS OTP</p>
          </div>
        </div>
        <button onClick={load} className="ovp-refresh-btn">
          <RefreshCw size={13} className={loading ? "ovp-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Success toast */}
      {doneTask && (
        <div className="ovp-toast" onClick={() => setDoneTask(null)}>
          <CheckCircle2 size={16} />
          <span>Order <strong>{doneTask.order?.orderNumber ?? doneTask.id}</strong> completed.</span>
          <span className="ovp-toast-close">✕</span>
        </div>
      )}

      {/* Stats */}
      <div className="ovp-stats">
        <div className="ovp-stat">
          <strong className="ovp-stat-num ovp-stat-orange">{pending.length}</strong>
          <span>Awaiting OTP</span>
        </div>
        <div className="ovp-stat-div" />
        <div className="ovp-stat">
          <strong className="ovp-stat-num ovp-stat-green">{done.length}</strong>
          <span>Verified</span>
        </div>
        <div className="ovp-stat-div" />
        <div className="ovp-stat">
          <strong className="ovp-stat-num">{tasks.length}</strong>
          <span>Total</span>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="ovp-state-center">
          <div className="ovp-spinner" />
          <p>Loading tasks…</p>
        </div>
      )}

      {!loading && (
        <>
          {/* Needs verification */}
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
                <span className="ovp-empty-sub">No tasks awaiting OTP verification</span>
              </div>
            ) : (
              <div className="ovp-task-list">
                {pending.map(task => (
                  <TaskRow key={task._id} task={task} onSelect={setSelectedTask} />
                ))}
              </div>
            )}
          </section>

          {/* Completed */}
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