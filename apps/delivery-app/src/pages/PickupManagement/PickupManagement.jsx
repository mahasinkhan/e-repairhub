import { useEffect, useState } from "react";
import { Package, RefreshCw, MapPin, Phone, ArrowRight } from "lucide-react";
import { getMyTasks, updateTaskStatus } from "../../services/delivery.api.js";

export default function PickupManagement() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [message, setMessage] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const data = await getMyTasks();
      setTasks((data ?? []).filter(t => t.taskType === "pickup"));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (task, nextStatus) => {
    setActionId(task._id);
    try {
      await updateTaskStatus(task._id, nextStatus);
      setMessage(m => ({ ...m, [task._id]: `✅ Status updated to ${nextStatus}` }));
      load();
    } catch (err) {
      setMessage(m => ({ ...m, [task._id]: "❌ " + err.message }));
    } finally { setActionId(null); }
  };

  const pending     = tasks.filter(t => t.status === "pending");
  const accepted    = tasks.filter(t => t.status === "accepted");
  const inProgress  = tasks.filter(t => t.status === "in_progress");
  const completed   = tasks.filter(t => t.status === "completed");

  const Section = ({ title, items, color, bg, nextStatus, actionLabel }) => (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 18px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", margin: 0 }}>{title}</h3>
        </div>
        <span style={{ background: bg, color, borderRadius: 999, padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>{items.length}</span>
      </div>
      {items.length === 0 ? (
        <div style={{ padding: "24px", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>No tasks</div>
      ) : (
        <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map(task => (
            <div key={task._id} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "12px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>{task.order?.orderNumber}</span>
                <span style={{ fontSize: 11, color: "#94a3b8" }}>OTP: <strong style={{ color: "#1e293b" }}>{task.otp}</strong></span>
              </div>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>
                <div style={{ display: "flex", gap: 5, marginBottom: 3 }}><Phone size={11} />{task.order?.customer?.name} · {task.order?.customer?.phone}</div>
                <div style={{ display: "flex", gap: 5 }}><MapPin size={11} />{task.order?.customer?.address}</div>
              </div>
              {message[task._id] && (
                <p style={{ fontSize: 12, color: message[task._id].includes("✅") ? "#15803d" : "#b91c1c", marginBottom: 8 }}>{message[task._id]}</p>
              )}
              {nextStatus && (
                <button onClick={() => handleAction(task, nextStatus)} disabled={actionId === task._id}
                  style={{ width: "100%", padding: "8px 0", borderRadius: 8, border: "none", background: bg, color, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <ArrowRight size={13} /> {actionLoading ? "..." : actionLabel}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const actionLoading = !!actionId;

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#1e293b", margin: 0 }}>Pickup Management</h1>
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Manage all pickup tasks</p>
        </div>
        <button onClick={load} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#475569", cursor: "pointer" }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
          <RefreshCw size={20} style={{ animation: "spin 1s linear infinite" }} />
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          <Section title="Pending"     items={pending}    color="#854d0e" bg="#fef9c3" nextStatus="accepted"    actionLabel="Accept Task" />
          <Section title="Accepted"    items={accepted}   color="#1d4ed8" bg="#dbeafe" nextStatus="in_progress" actionLabel="Start Pickup" />
          <Section title="In Progress" items={inProgress} color="#c2410c" bg="#ffedd5" nextStatus="completed"   actionLabel="Complete Pickup" />
          <Section title="Completed"   items={completed}  color="#15803d" bg="#dcfce7" nextStatus={null}        actionLabel="" />
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}