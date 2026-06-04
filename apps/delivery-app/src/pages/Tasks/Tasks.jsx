import { useEffect, useState, useCallback, useRef } from "react";
import {
  Search, RefreshCw, Package, Truck, ChevronRight,
  CheckCircle, Clock, XCircle, MapPin, Phone,
  Send, ShieldCheck, User, Wrench, BadgeIndianRupee,
  ArrowLeft, AlertCircle,
} from "lucide-react";
import { getMyTasks, updateTaskStatus, sendDeliveryOtp } from "../../services/delivery.api.js";
import { toast } from "sonner";
import "./Tasks.css";

/* ─── Status config ─── */
const STATUS_CONFIG = {
  pending:     { label: "Pending",     color: "#854d0e", bg: "#fef9c3", border: "#fde047" },
  accepted:    { label: "Accepted",    color: "#1d4ed8", bg: "#dbeafe", border: "#93c5fd" },
  in_progress: { label: "In Progress", color: "#c2410c", bg: "#ffedd5", border: "#fdba74" },
  completed:   { label: "Completed",   color: "#15803d", bg: "#dcfce7", border: "#86efac" },
  failed:      { label: "Failed",      color: "#b91c1c", bg: "#fee2e2", border: "#fca5a5" },
  rejected:    { label: "Rejected",    color: "#475569", bg: "#f1f5f9", border: "#cbd5e1" },
};

const TABS = [
  { key: "all",         label: "All"         },
  { key: "pending",     label: "Pending"     },
  { key: "accepted",    label: "Accepted"    },
  { key: "in_progress", label: "In Progress" },
  { key: "completed",   label: "Completed"   },
  { key: "failed",      label: "Failed"      },
];

const NEXT_STATUS = { pending: "accepted", accepted: "in_progress", in_progress: "completed" };

const ACTION_CFG = {
  pending:     { label: "Accept Task",               Icon: CheckCircle  },
  accepted:    { label: "Start & Notify Customer",   Icon: Send         },
  in_progress: { label: "Verify OTP & Complete",     Icon: ShieldCheck  },
};

/* ─── Status Pill ─── */
function StatusPill({ status }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: "#475569", bg: "#f1f5f9", border: "#cbd5e1" };
  return (
    <span className="tsk-pill" style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}>
      <span className="tsk-pill-dot" style={{ background: cfg.color }} />
      {cfg.label}
    </span>
  );
}

/* ─── 6-digit OTP Input ─── */
function OtpInput({ value, onChange, disabled }) {
  const refs = useRef([]);
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
    <div className="tskd-otp-boxes">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el; }}
          type="text" inputMode="numeric" maxLength={1}
          value={d} disabled={disabled}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={`tskd-otp-box ${d ? "tskd-otp-box--filled" : ""}`}
        />
      ))}
    </div>
  );
}

/* ─── Task Detail Panel ─── */
function TaskDetail({ task, onBack, onRefresh }) {
  const [actionLoading, setActionLoading] = useState(false);
  const [showFail,      setShowFail]      = useState(false);
  const [failReason,    setFailReason]    = useState("");
  const [otpInput,      setOtpInput]      = useState("");
  const [showOtp,       setShowOtp]       = useState(false);
  const [message,       setMessage]       = useState(null); // { text, type }
  const [sendingOtp,    setSendingOtp]    = useState(false);
  const [countdown,     setCountdown]     = useState(0);
  const timerRef = useRef(null);

  const showMsg = (text, type = "error") => setMessage({ text, type });

  const phone      = task?.order?.customer?.phone;
  const isPickup   = task?.taskType === "pickup";
  const order      = task?.order;
  const canAct     = ["pending", "accepted", "in_progress"].includes(task?.status);

  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setTimeout(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [countdown]);

  const handleSendOtp = async () => {
    if (!phone) { showMsg("No customer phone number"); return; }
    setSendingOtp(true); setMessage(null);
    try {
      await sendDeliveryOtp(phone);
      setCountdown(60);
      showMsg(`OTP sent to ${phone.slice(0, 4)}****${phone.slice(-2)}`, "success");
    } catch (e) {
      showMsg(`Failed to send OTP: ${e.message}`);
    } finally { setSendingOtp(false); }
  };

  const handleAction = async () => {
    const next = NEXT_STATUS[task.status];
    if (!next) return;

    if (next === "in_progress") {
      setActionLoading(true);
      try {
        await updateTaskStatus(task._id, "in_progress");
        setShowOtp(true);
        showMsg(`Task started! OTP sent to customer. Ask them for the code.`, "success");
        onRefresh();
      } catch (e) { showMsg(e.message || "Failed to start task"); }
      finally { setActionLoading(false); }
      return;
    }

    if (next === "completed") {
      if (!showOtp) { setShowOtp(true); return; }
      if (otpInput.length !== 6) { showMsg("Enter the 6-digit OTP"); return; }
      setActionLoading(true); setMessage(null);
      try {
        await updateTaskStatus(task._id, "completed", undefined, otpInput);
        toast.success(`${isPickup ? "Pickup" : "Delivery"} completed!`);
        onRefresh(); onBack();
      } catch (e) {
        showMsg(e.message || "OTP verification failed");
        setOtpInput("");
      } finally { setActionLoading(false); }
      return;
    }

    setActionLoading(true);
    try {
      await updateTaskStatus(task._id, next);
      toast.success("Task accepted!");
      onRefresh();
    } catch (e) { showMsg(e.message || "Action failed"); }
    finally { setActionLoading(false); }
  };

  const handleFail = async () => {
    if (!failReason.trim()) { showMsg("Please enter a reason"); return; }
    setActionLoading(true);
    try {
      await updateTaskStatus(task._id, "failed", failReason);
      toast.error("Task marked as failed");
      onRefresh(); onBack();
    } catch (e) { showMsg(e.message || "Failed"); }
    finally { setActionLoading(false); }
  };

  /* Progress stepper */
  const steps = ["Assigned", "Accepted", "In Progress", "Completed"];
  const statusOrder = ["pending", "accepted", "in_progress", "completed"];
  const curIdx = statusOrder.indexOf(task.status);

  const cfg = ACTION_CFG[task.status];
  const ActionIcon = cfg?.Icon;

  return (
    <div className="tskd-root">

      {/* Back */}
      <button className="tskd-back" onClick={onBack}>
        <ArrowLeft size={15} /> Back to Tasks
      </button>

      {/* Dark header */}
      <div className="tskd-header">
        <div className="tskd-header-top">
          <div className="tskd-header-type">
            {isPickup
              ? <Package size={16} className="tskd-type-icon-pickup" />
              : <Truck    size={16} className="tskd-type-icon-delivery" />
            }
            <span className={`tskd-type-label ${isPickup ? "tskd-type-pickup" : "tskd-type-delivery"}`}>
              {isPickup ? "Pickup Task" : "Delivery Task"}
            </span>
          </div>
          <StatusPill status={task.status} />
        </div>
        <h2 className="tskd-order-num">{order?.orderNumber}</h2>
        {order?.serviceType && <p className="tskd-service">{order.serviceType}</p>}

        {/* Stepper */}
        <div className="tskd-stepper">
          {steps.map((s, i) => {
            const done   = i < curIdx || (task.status === "completed" && i === curIdx);
const active = i === curIdx && task.status !== "completed";
            return (
              <div key={s} className="tskd-step">
                <div className={`tskd-step-circle ${done ? "step-done" : active ? "step-active" : "step-idle"}`}>
                  {done ? <CheckCircle size={13} /> : <span>{i + 1}</span>}
                </div>
                <p className={`tskd-step-label ${done ? "step-lbl-done" : active ? "step-lbl-active" : ""}`}>
                  {s}
                </p>
                {i < steps.length - 1 && (
                  <div className={`tskd-step-line ${i < curIdx ? "line-done" : ""}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Info cards */}
      <div className="tskd-cards">
        {/* Customer */}
        <div className="tskd-card">
          <h3 className="tskd-card-title">Customer</h3>
          <div className="tskd-customer-head">
            <div className="tskd-avatar">
              {order?.customer?.name?.charAt(0)?.toUpperCase() ?? "?"}
            </div>
            <div>
              <p className="tskd-customer-name">{order?.customer?.name}</p>
              <p className="tskd-customer-phone">{phone}</p>
            </div>
            <a href={`tel:${phone}`} className="tskd-call-btn">
              <Phone size={13} /> Call
            </a>
          </div>
          <div className="tskd-address-row">
            <MapPin size={13} className="tskd-map-pin" />
            <span>{order?.customer?.address}</span>
          </div>
        </div>

        {/* Device */}
        <div className="tskd-card">
          <h3 className="tskd-card-title">Device</h3>
          <div className="tskd-device-grid">
            {[
              { label: "Brand",   value: order?.deviceDetails?.brand },
              { label: "Model",   value: order?.deviceDetails?.model },
              { label: "Issue",   value: order?.deviceDetails?.issue },
              { label: "Service", value: order?.serviceType },
              { label: "Price",   value: `₹${Number(order?.price ?? 0).toLocaleString("en-IN")}` },
              { label: "Color",   value: order?.deviceDetails?.color || "—" },
            ].map(({ label, value }) => (
              <div key={label} className="tskd-device-cell">
                <span className="tskd-cell-label">{label}</span>
                <span className="tskd-cell-val">{value || "—"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* OTP Section */}
      {(task.status === "in_progress" || showOtp) && (
        <div className="tskd-otp-card">
          <div className="tskd-otp-head">
            <ShieldCheck size={20} className="tskd-otp-icon" />
            <div>
              <h3 className="tskd-otp-title">OTP Verification</h3>
              <p className="tskd-otp-sub">
                {isPickup ? "Ask customer for their OTP" : "OTP sent to customer when you started the task"}
              </p>
            </div>
          </div>

          {task.status === "in_progress" && (
            <div className="tskd-otp-sent-info">
              <CheckCircle size={14} />
              OTP sent to {phone?.slice(0,4)}****{phone?.slice(-2)} — ask the customer for it
            </div>
          )}

          <div className="tskd-otp-resend-row">
            {countdown > 0
              ? <span className="tskd-otp-timer">Resend in {countdown}s</span>
              : <button className="tskd-resend-btn" onClick={handleSendOtp} disabled={sendingOtp}>
                  <Send size={12} /> {sendingOtp ? "Sending…" : "Resend OTP"}
                </button>
            }
          </div>

          <p className="tskd-otp-prompt">Enter OTP provided by customer:</p>
          <OtpInput value={otpInput} onChange={setOtpInput} disabled={actionLoading} />
        </div>
      )}

      {/* Message banner */}
      {message && (
        <div className={`tskd-msg tskd-msg-${message.type}`}>
          {message.type === "error"
            ? <AlertCircle size={14} />
            : <CheckCircle size={14} />
          }
          {message.text}
        </div>
      )}

      {/* Completed state */}
      {task.status === "completed" && (
        <div className="tskd-done-card">
          <CheckCircle size={38} className="tskd-done-icon" />
          <h3>{isPickup ? "Pickup Completed!" : "Delivery Completed!"}</h3>
          <p>{isPickup ? "Device picked up and sent for repair" : "Order delivered successfully"}</p>
          {task.completedAt && (
            <span className="tskd-done-time">
              {new Date(task.completedAt).toLocaleString("en-IN")}
            </span>
          )}
        </div>
      )}

      {/* Action buttons */}
      {canAct && !showFail && (
        <div className="tskd-action-row">
          <button
            className="tskd-action-btn tskd-btn-primary"
            onClick={handleAction}
            disabled={actionLoading}
          >
            {actionLoading
              ? <RefreshCw size={15} className="tskd-spin" />
              : cfg && <ActionIcon size={15} />
            }
            {actionLoading ? "Processing…" : cfg?.label ?? "Next Step"}
          </button>

          {task.status !== "pending" && (
            <button className="tskd-action-btn tskd-btn-fail" onClick={() => setShowFail(true)}>
              <XCircle size={15} />
            </button>
          )}
        </div>
      )}

      {/* Fail form */}
      {showFail && (
        <div className="tskd-fail-card">
          <h3 className="tskd-fail-title">Report Failure</h3>
          <textarea
            className="tskd-fail-textarea"
            value={failReason}
            onChange={e => setFailReason(e.target.value)}
            placeholder="Reason (e.g. customer not available, wrong address…)"
            rows={3}
          />
          <div className="tskd-fail-btns">
            <button className="tskd-action-btn tskd-btn-ghost" onClick={() => setShowFail(false)}>
              Cancel
            </button>
            <button className="tskd-action-btn tskd-btn-confirm-fail" onClick={handleFail} disabled={actionLoading}>
              {actionLoading ? "Submitting…" : "Confirm Failure"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main Tasks Page ─── */
export default function Tasks() {
  const [tasks,        setTasks]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [activeTab,    setActiveTab]    = useState("all");
  const [search,       setSearch]       = useState("");
  const [selectedTask, setSelectedTask] = useState(null);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyTasks();
      setTasks(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("[tasks]", e);
      setTasks([]);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const filtered = tasks.filter(t => {
    const tabOk    = activeTab === "all" || t.status === activeTab;
    const searchOk = !search || [t.order?.orderNumber, t.order?.customer?.name, t.order?.customer?.phone]
      .some(f => f?.toLowerCase().includes(search.toLowerCase()));
    return tabOk && searchOk;
  });

  const tabCounts = TABS.reduce((acc, tab) => {
    acc[tab.key] = tab.key === "all" ? tasks.length : tasks.filter(t => t.status === tab.key).length;
    return acc;
  }, {});

  /* ── Detail view ── */
  if (selectedTask) {
    return (
      <div className="tsk-root">
        <TaskDetail
          task={selectedTask}
          onBack={() => { setSelectedTask(null); loadTasks(); }}
          onRefresh={loadTasks}
        />
      </div>
    );
  }

  /* ── List view ── */
  return (
    <div className="tsk-root">

      {/* Header */}
      <div className="tsk-page-head">
        <div>
          <h1 className="tsk-title">My Tasks</h1>
          <p className="tsk-subtitle">All your pickup and delivery assignments</p>
        </div>
        <button className="tsk-refresh-btn" onClick={loadTasks} disabled={loading}>
          <RefreshCw size={14} className={loading ? "tsk-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="tsk-tabs">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`tsk-tab ${activeTab === tab.key ? "tsk-tab--active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            <span className={`tsk-tab-count ${activeTab === tab.key ? "tsk-tab-count--active" : ""}`}>
              {tabCounts[tab.key] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="tsk-search-wrap">
        <Search size={14} className="tsk-search-ico" />
        <input
          className="tsk-search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search order, customer, phone…"
        />
        {search && (
          <button className="tsk-search-clear" onClick={() => setSearch("")}>
            <XCircle size={14} />
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="tsk-state-center">
          <div className="tsk-spinner" />
          <p>Loading tasks…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="tsk-state-center">
          <div className="tsk-empty-icon"><Package size={28} /></div>
          <p className="tsk-empty-title">No tasks found</p>
          <span className="tsk-empty-sub">
            {search ? `No results for "${search}"` : "Tasks assigned by admin will appear here"}
          </span>
        </div>
      ) : (
        <div className="tsk-list">
          {filtered.map(task => {
            const order    = task.order;
            const isPickup = task.taskType === "pickup";
            return (
              <div
                key={task._id}
                className="tsk-row"
                onClick={() => setSelectedTask(task)}
              >
                <div className={`tsk-row-icon ${isPickup ? "tsk-icon-pickup" : "tsk-icon-delivery"}`}>
                  {isPickup ? <Package size={17} /> : <Truck size={17} />}
                </div>

                <div className="tsk-row-info">
                  <div className="tsk-row-top">
                    <span className="tsk-row-id">{order?.orderNumber}</span>
                    <span className={`tsk-type-chip ${isPickup ? "tsk-type-pickup" : "tsk-type-delivery"}`}>
                      {task.taskType?.toUpperCase()}
                    </span>
                  </div>
                  <p className="tsk-row-customer">
                    {order?.customer?.name} · {order?.customer?.phone}
                  </p>
                  <p className="tsk-row-device">
                    {order?.deviceDetails?.brand} {order?.deviceDetails?.model}
                  </p>
                </div>

                <div className="tsk-row-right">
                  <StatusPill status={task.status} />
                  <p className="tsk-row-addr">
                    {order?.customer?.address?.slice(0, 28)}
                    {(order?.customer?.address?.length ?? 0) > 28 ? "…" : ""}
                  </p>
                </div>

                <ChevronRight size={16} className="tsk-row-arrow" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}