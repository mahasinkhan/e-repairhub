import { useEffect, useState, useCallback, useRef } from "react";
import {
  Search, RefreshCw, Package, Truck, Eye,
  CheckCircle, Clock, XCircle, MapPin, Phone,
  ArrowRight, AlertTriangle, Send, ShieldCheck,
} from "lucide-react";
import { getMyTasks, updateTaskStatus, sendDeliveryOtp, verifyDeliveryOtp } from "../../services/delivery.api.js";
import { toast } from "sonner";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

const STATUS_CONFIG = {
  pending:     { label: "Pending",     color: "#854d0e", bg: "#fef9c3", border: "#fde047" },
  accepted:    { label: "Accepted",    color: "#1d4ed8", bg: "#dbeafe", border: "#93c5fd" },
  in_progress: { label: "In Progress", color: "#c2410c", bg: "#ffedd5", border: "#fdba74" },
  completed:   { label: "Completed",   color: "#15803d", bg: "#dcfce7", border: "#86efac" },
  failed:      { label: "Failed",      color: "#b91c1c", bg: "#fee2e2", border: "#fca5a5" },
  rejected:    { label: "Rejected",    color: "#475569", bg: "#f1f5f9", border: "#cbd5e1" },
};

const TABS = [
  { key: "all",         label: "All" },
  { key: "pending",     label: "Pending" },
  { key: "accepted",    label: "Accepted" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed",   label: "Completed" },
  { key: "failed",      label: "Failed" },
];

function StatusPill({ status }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: "#475569", bg: "#f1f5f9", border: "#cbd5e1" };
  return (
    <span style={{
      padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700,
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
      display: "inline-flex", alignItems: "center", gap: 4,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.color, display: "inline-block" }} />
      {cfg.label}
    </span>
  );
}

// ── OTP Input Component ───────────────────────────────────────────────────────
function OtpInput({ value, onChange, disabled }) {
  const inputRefs = useRef([]);
  const digits = value.split("").concat(Array(6).fill("")).slice(0, 6);

  const handleChange = (index, val) => {
    if (!/^\d*$/.test(val)) return;
    const newDigits = [...digits];
    newDigits[index] = val.slice(-1);
    onChange(newDigits.join("").replace(/\s/g, ""));
    if (val && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted);
    if (pasted.length === 6) inputRefs.current[5]?.focus();
  };

  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          disabled={disabled}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          style={{
            width: 44, height: 52,
            textAlign: "center", fontSize: 20, fontWeight: 800,
            border: `2px solid ${d ? "#f97316" : "#e2e8f0"}`,
            borderRadius: 10, outline: "none",
            background: d ? "#fff7ed" : "#f8fafc",
            color: "#1e293b", transition: "all .15s",
            opacity: disabled ? 0.6 : 1,
          }}
        />
      ))}
    </div>
  );
}

// ── Task Detail Panel ─────────────────────────────────────────────────────────
function TaskDetail({ task, onBack, onRefresh }) {
  const [actionLoading, setActionLoading] = useState(false);
  const [showFail,      setShowFail]      = useState(false);
  const [failReason,    setFailReason]    = useState("");
  const [otpInput,      setOtpInput]      = useState("");
  const [showOtp,       setShowOtp]       = useState(false);
  const [message,       setMessage]       = useState("");
  const [msgType,       setMsgType]       = useState("error"); // "error" | "success" | "info"
  const [sendingOtp,    setSendingOtp]    = useState(false);
  const [otpSent,       setOtpSent]       = useState(false);
  const [countdown,     setCountdown]     = useState(0);
  const timerRef = useRef(null);

  const customerPhone = task?.order?.customer?.phone;
  const isPickup   = task?.taskType === "pickup";
  const isDelivery = task?.taskType === "delivery";

  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setTimeout(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [countdown]);

  const NEXT_STATUS = {
    pending:     "accepted",
    accepted:    "in_progress",
    in_progress: "completed",
  };

  const ACTION_LABELS = {
    pending:     { label: "✅ Accept Task",            emoji: "✅" },
    accepted:    { label: "🚀 Start & Send OTP to Customer", emoji: "🚀" },
    in_progress: { label: "🔐 Verify OTP & Complete",  emoji: "🔐" },
  };

  // Send OTP to customer phone
  const handleSendOtp = async () => {
    if (!customerPhone) { setMessage("No customer phone number"); setMsgType("error"); return; }
    setSendingOtp(true);
    setMessage("");
    try {
      await sendDeliveryOtp(customerPhone);
      setOtpSent(true);
      setCountdown(60);
      setMsg(`✅ OTP sent to customer: ${customerPhone.slice(0,4)}****${customerPhone.slice(-2)}`, "success");
    } catch (e) {
      setMsg(`Failed to send OTP: ${e.message}`, "error");
    } finally { setSendingOtp(false); }
  };

  const setMsg = (text, type = "error") => { setMessage(text); setMsgType(type); };

  const handleAction = async () => {
    const next = NEXT_STATUS[task.status];
    if (!next) return;

    // Start task → send OTP first
    if (next === "in_progress") {
      setActionLoading(true);
      try {
        // Move to in_progress (backend will send OTP)
        await updateTaskStatus(task._id, "in_progress");
        setOtpSent(true);
        setShowOtp(true);
        setMsg(`🚀 Task started! OTP sent to customer ${customerPhone}. Ask customer for the code.`, "success");
        onRefresh();
      } catch (e) {
        setMsg(e.message || "Failed to start task", "error");
      } finally { setActionLoading(false); }
      return;
    }

    // Complete task → verify OTP
    if (next === "completed") {
      if (!showOtp) { setShowOtp(true); return; }
      if (otpInput.length !== 6) { setMsg("Enter the 6-digit OTP", "error"); return; }

      setActionLoading(true);
      setMsg("");
      try {
        await updateTaskStatus(task._id, "completed", undefined, otpInput);
        toast.success(`${isPickup ? "Pickup" : "Delivery"} completed successfully! 🎉`);
        onRefresh();
        onBack();
      } catch (e) {
        setMsg(`❌ ${e.message || "OTP verification failed"}`, "error");
        setOtpInput("");
      } finally { setActionLoading(false); }
      return;
    }

    // Accept task
    setActionLoading(true);
    try {
      await updateTaskStatus(task._id, next);
      toast.success("Task accepted!");
      onRefresh();
    } catch (e) {
      setMsg(e.message || "Action failed", "error");
    } finally { setActionLoading(false); }
  };

  const handleFail = async () => {
    if (!failReason.trim()) { setMsg("Please enter a reason", "error"); return; }
    setActionLoading(true);
    try {
      await updateTaskStatus(task._id, "failed", failReason);
      toast.error("Task marked as failed");
      onRefresh();
      onBack();
    } catch (e) {
      setMsg(e.message || "Failed", "error");
    } finally { setActionLoading(false); }
  };

  const order = task?.order;
  const canAct = ["pending", "accepted", "in_progress"].includes(task?.status);

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      {/* Back */}
      <button onClick={onBack}
        style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748b", background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, marginBottom: 20 }}>
        ← Back to Tasks
      </button>

      {/* Task header */}
      <div style={{ background: "#1e293b", borderRadius: 16, padding: "20px 24px", marginBottom: 16, color: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              {isPickup
                ? <Package size={18} color="#f97316" />
                : <Truck size={18} color="#60a5fa" />
              }
              <span style={{ fontSize: 12, fontWeight: 700, color: isPickup ? "#f97316" : "#60a5fa", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {isPickup ? "Pickup Task" : "Delivery Task"}
              </span>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>{order?.orderNumber}</h2>
            <p style={{ color: "#94a3b8", fontSize: 13, margin: "4px 0 0" }}>{order?.serviceType}</p>
          </div>
          <StatusPill status={task.status} />
        </div>

        {/* Progress steps */}
        <div style={{ display: "flex", alignItems: "center", marginTop: 16, gap: 0 }}>
          {["Assigned", "Accepted", "In Progress", "Completed"].map((s, i) => {
            const stepStatus = { 0: "pending", 1: "accepted", 2: "in_progress", 3: "completed" };
            const statusOrder = ["pending", "accepted", "in_progress", "completed"];
            const currentIdx = statusOrder.indexOf(task.status);
            const done = i <= currentIdx;
            const active = i === currentIdx;
            return (
              <div key={s} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "none" }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: done ? "#22c55e" : active ? "#f97316" : "#334155",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700, color: "#fff",
                  }}>
                    {done && i < currentIdx ? "✓" : i + 1}
                  </div>
                  <p style={{ fontSize: 9, color: done ? "#22c55e" : "#64748b", margin: "4px 0 0", whiteSpace: "nowrap" }}>{s}</p>
                </div>
                {i < 3 && <div style={{ flex: 1, height: 2, background: i < currentIdx ? "#22c55e" : "#334155", marginBottom: 14 }} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Customer info */}
      <div style={{ background: "#fff", borderRadius: 14, padding: "18px 20px", marginBottom: 12, border: "1px solid #e2e8f0" }}>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 12px" }}>Customer</h3>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#f97316", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 16 }}>
              {order?.customer?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <p style={{ fontWeight: 700, color: "#1e293b", margin: 0 }}>{order?.customer?.name}</p>
              <p style={{ fontSize: 13, color: "#64748b", margin: "2px 0 0" }}>{customerPhone}</p>
            </div>
          </div>
          <a href={`tel:${customerPhone}`}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "8px 14px", color: "#15803d", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
            <Phone size={14} /> Call Customer
          </a>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 6, marginTop: 12, color: "#64748b", fontSize: 13 }}>
          <MapPin size={14} style={{ marginTop: 2, flexShrink: 0, color: "#f97316" }} />
          {order?.customer?.address}
        </div>
      </div>

      {/* Device info */}
      <div style={{ background: "#fff", borderRadius: 14, padding: "18px 20px", marginBottom: 12, border: "1px solid #e2e8f0" }}>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 12px" }}>Device</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            ["Brand",   order?.deviceDetails?.brand],
            ["Model",   order?.deviceDetails?.model],
            ["Issue",   order?.deviceDetails?.issue],
            ["Service", order?.serviceType],
            ["Price",   `₹${Number(order?.price ?? 0).toLocaleString("en-IN")}`],
            ["Color",   order?.deviceDetails?.color || "—"],
          ].map(([k, v]) => (
            <div key={k} style={{ background: "#f8fafc", borderRadius: 8, padding: "10px 12px" }}>
              <p style={{ fontSize: 10, color: "#94a3b8", margin: "0 0 2px", fontWeight: 600, textTransform: "uppercase" }}>{k}</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", margin: 0 }}>{v || "—"}</p>
            </div>
          ))}
        </div>
      </div>

      {/* OTP section — shown when in_progress */}
      {(task.status === "in_progress" || showOtp) && (
        <div style={{ background: "#fff", borderRadius: 14, padding: "20px", marginBottom: 12, border: "2px solid #f97316" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <ShieldCheck size={20} color="#f97316" />
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "#1e293b", margin: 0 }}>OTP Verification</h3>
              <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0" }}>
                {isPickup ? "Ask customer for the OTP they received on their phone" : "Customer will receive OTP when you start delivery"}
              </p>
            </div>
          </div>

          {/* OTP was sent info */}
          {task.status === "in_progress" && (
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "10px 14px", marginBottom: 14 }}>
              <p style={{ fontSize: 13, color: "#15803d", margin: 0, fontWeight: 600 }}>
                ✅ OTP sent to customer's phone ({customerPhone?.slice(0,4)}****{customerPhone?.slice(-2)})
              </p>
              <p style={{ fontSize: 11, color: "#16a34a", margin: "4px 0 0" }}>
                Ask the customer for the 6-digit code they received via SMS
              </p>
            </div>
          )}

          {/* Resend OTP */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            {countdown > 0 ? (
              <p style={{ fontSize: 12, color: "#94a3b8" }}>Resend in {countdown}s</p>
            ) : (
              <button onClick={handleSendOtp} disabled={sendingOtp}
                style={{ background: "none", border: "1px solid #e2e8f0", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, color: "#f97316", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                <Send size={12} /> {sendingOtp ? "Sending..." : "Resend OTP"}
              </button>
            )}
          </div>

          {/* OTP input */}
          <p style={{ fontSize: 13, fontWeight: 700, color: "#475569", textAlign: "center", marginBottom: 12 }}>
            Enter OTP provided by customer:
          </p>
          <OtpInput value={otpInput} onChange={setOtpInput} disabled={actionLoading} />
        </div>
      )}

      {/* Message */}
      {message && (
        <div style={{
          background: msgType === "success" ? "#f0fdf4" : msgType === "info" ? "#eff6ff" : "#fef2f2",
          border: `1px solid ${msgType === "success" ? "#bbf7d0" : msgType === "info" ? "#bfdbfe" : "#fecaca"}`,
          borderRadius: 10, padding: "10px 14px", marginBottom: 12,
        }}>
          <p style={{ fontSize: 13, margin: 0, color: msgType === "success" ? "#15803d" : msgType === "info" ? "#1d4ed8" : "#b91c1c" }}>{message}</p>
        </div>
      )}

      {/* Action buttons */}
      {canAct && !showFail && (
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={handleAction} disabled={actionLoading}
            style={{
              flex: 1, padding: "14px", border: "none", borderRadius: 12,
              background: actionLoading ? "#94a3b8" : "linear-gradient(135deg, #f97316, #ea580c)",
              color: "#fff", fontSize: 15, fontWeight: 700,
              cursor: actionLoading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
            {actionLoading
              ? <><RefreshCw size={16} style={{ animation: "spin 1s linear infinite" }} /> Processing...</>
              : ACTION_LABELS[task.status]?.label || "Next Step"
            }
          </button>

          {task.status !== "pending" && (
            <button onClick={() => setShowFail(true)}
              style={{ padding: "14px 18px", border: "1px solid #fca5a5", borderRadius: 12, background: "#fff", color: "#b91c1c", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              <XCircle size={16} />
            </button>
          )}
        </div>
      )}

      {/* Fail form */}
      {showFail && (
        <div style={{ background: "#fff", borderRadius: 14, padding: "18px", border: "1.5px solid #fca5a5" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#b91c1c", margin: "0 0 12px" }}>❌ Report Failure</h3>
          <textarea value={failReason} onChange={e => setFailReason(e.target.value)}
            placeholder="Reason for failure (e.g. customer not available, wrong address...)"
            rows={3}
            style={{ width: "100%", border: "1.5px solid #fca5a5", borderRadius: 10, padding: "10px 14px", fontSize: 14, outline: "none", resize: "none", boxSizing: "border-box", marginBottom: 10 }} />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setShowFail(false)}
              style={{ flex: 1, padding: "10px", border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", color: "#64748b", fontWeight: 600, cursor: "pointer" }}>
              Cancel
            </button>
            <button onClick={handleFail} disabled={actionLoading}
              style={{ flex: 1, padding: "10px", border: "none", borderRadius: 10, background: "#ef4444", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
              {actionLoading ? "Submitting..." : "Confirm Failure"}
            </button>
          </div>
        </div>
      )}

      {/* Completed state */}
      {task.status === "completed" && (
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 14, padding: "20px", textAlign: "center" }}>
          <CheckCircle size={40} color="#22c55e" style={{ margin: "0 auto 10px" }} />
          <h3 style={{ color: "#15803d", fontWeight: 800, margin: "0 0 4px" }}>
            {isPickup ? "Pickup Completed! ✅" : "Delivery Completed! 🎉"}
          </h3>
          <p style={{ color: "#16a34a", fontSize: 13, margin: 0 }}>
            {isPickup ? "Device picked up and sent for repair" : "Order delivered successfully to customer"}
          </p>
          {task.completedAt && (
            <p style={{ color: "#94a3b8", fontSize: 11, margin: "8px 0 0" }}>
              Completed: {new Date(task.completedAt).toLocaleString("en-IN")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Tasks Page ───────────────────────────────────────────────────────────
export default function Tasks() {
  const [tasks,       setTasks]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [activeTab,   setActiveTab]   = useState("all");
  const [search,      setSearch]      = useState("");
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
    const searchOk = !search || [
      t.order?.orderNumber,
      t.order?.customer?.name,
      t.order?.customer?.phone,
    ].some(f => f?.toLowerCase().includes(search.toLowerCase()));
    return tabOk && searchOk;
  });

  const tabCounts = TABS.reduce((acc, tab) => {
    acc[tab.key] = tab.key === "all" ? tasks.length : tasks.filter(t => t.status === tab.key).length;
    return acc;
  }, {});

  if (selectedTask) {
    return (
      <div style={{ padding: "24px 20px" }}>
        <TaskDetail
          task={selectedTask}
          onBack={() => { setSelectedTask(null); loadTasks(); }}
          onRefresh={loadTasks}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1e293b", margin: 0 }}>My Tasks</h2>
          <p style={{ color: "#64748b", fontSize: 13, margin: "4px 0 0" }}>All your pickup and delivery assignments</p>
        </div>
        <button onClick={loadTasks}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, color: "#475569", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 14px", borderRadius: 999, border: "none",
              background: activeTab === tab.key ? "#f97316" : "#f1f5f9",
              color: activeTab === tab.key ? "#fff" : "#475569",
              fontSize: 12, fontWeight: 700, cursor: "pointer",
            }}>
            {tab.label}
            <span style={{ background: activeTab === tab.key ? "rgba(255,255,255,0.3)" : "#e2e8f0", borderRadius: 999, padding: "1px 7px", fontSize: 11 }}>
              {tabCounts[tab.key] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 16 }}>
        <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search order, customer, phone..."
          style={{ width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "10px 14px 10px 36px", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
      </div>

      {/* Task list */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: "#94a3b8" }}>
          <RefreshCw size={24} style={{ animation: "spin 1s linear infinite", margin: "0 auto 10px" }} />
          <p>Loading tasks...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: "#94a3b8" }}>
          <Package size={36} style={{ opacity: 0.3, margin: "0 auto 10px" }} />
          <p style={{ fontWeight: 600, color: "#475569" }}>No tasks found</p>
          <p style={{ fontSize: 12 }}>Tasks assigned by admin will appear here</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(task => {
            const order    = task.order;
            const isPickup = task.taskType === "pickup";
            return (
              <div key={task._id}
                style={{ background: "#fff", borderRadius: 14, padding: "16px 18px", border: "1.5px solid #e2e8f0", cursor: "pointer", transition: "all .15s" }}
                onClick={() => setSelectedTask(task)}
                onMouseEnter={e => { e.currentTarget.style.border = "1.5px solid #f97316"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(249,115,22,0.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.border = "1.5px solid #e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: isPickup ? "#fff7ed" : "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {isPickup ? <Package size={18} color="#f97316" /> : <Truck size={18} color="#3b82f6" />}
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                        <span style={{ fontWeight: 800, fontSize: 14, color: "#1e293b" }}>{order?.orderNumber}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: isPickup ? "#f97316" : "#3b82f6", background: isPickup ? "#fff7ed" : "#eff6ff", padding: "1px 7px", borderRadius: 999, textTransform: "uppercase" }}>
                          {task.taskType}
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: "#475569", margin: 0 }}>{order?.customer?.name} · {order?.customer?.phone}</p>
                      <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0" }}>{order?.deviceDetails?.brand} {order?.deviceDetails?.model}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                    <StatusPill status={task.status} />
                    <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>
                      {order?.customer?.address?.slice(0, 20)}{order?.customer?.address?.length > 20 ? "..." : ""}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}