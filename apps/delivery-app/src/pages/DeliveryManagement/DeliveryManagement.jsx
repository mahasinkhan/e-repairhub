import { useEffect, useState } from "react";
import { Truck, RefreshCw, MapPin, Phone, ArrowRight } from "lucide-react";
import { getMyTasks, updateTaskStatus } from "../../services/delivery.api.js";

export default function DeliveryManagement() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getMyTasks();
      setTasks((data ?? []).filter(t => t.taskType === "delivery"));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (task, nextStatus) => {
    setActionId(task._id);
    try {
      await updateTaskStatus(task._id, nextStatus);
      load();
    } catch (err) {
      console.error(err);
    } finally { setActionId(null); }
  };

  const groups = {
    pending:     tasks.filter(t => t.status === "pending"),
    accepted:    tasks.filter(t => t.status === "accepted"),
    in_progress: tasks.filter(t => t.status === "in_progress"),
    completed:   tasks.filter(t => t.status === "completed"),
  };

  const CONFIGS = [
    { key: "pending",     label: "Pending",     color: "#854d0e", bg: "#fef9c3", next: "accepted",    action: "Accept Delivery" },
    { key: "accepted",    label: "Accepted",    color: "#1d4ed8", bg: "#dbeafe", next: "in_progress", action: "Start Delivery" },
    { key: "in_progress", label: "Out for Delivery", color: "#c2410c", bg: "#ffedd5", next: "completed", action: "Mark Delivered" },
    { key: "completed",   label: "Delivered",   color: "#15803d", bg: "#dcfce7", next: null,          action: "" },
  ];

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#1e293b", margin: 0 }}>Delivery Management</h1>
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Manage all delivery tasks</p>
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
          {CONFIGS.map(cfg => (
            <div key={cfg.key} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between" }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.color }} />
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", margin: 0 }}>{cfg.label}</h3>
                </div>
                <span style={{ background: cfg.bg, color: cfg.color, borderRadius: 999, padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>
                  {groups[cfg.key].length}
                </span>
              </div>
              {groups[cfg.key].length === 0 ? (
                <div style={{ padding: "24px", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>No tasks</div>
              ) : (
                <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                  {groups[cfg.key].map(task => (
                    <div key={task._id} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "12px 14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>{task.order?.orderNumber}</span>
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>OTP: <strong>{task.otp}</strong></span>
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>
                        <div style={{ display: "flex", gap: 5, marginBottom: 3 }}><Phone size={11} />{task.order?.customer?.name} · {task.order?.customer?.phone}</div>
                        <div style={{ display: "flex", gap: 5 }}><MapPin size={11} />{task.order?.customer?.address}</div>
                      </div>
                      {cfg.next && (
                        <button onClick={() => handleAction(task, cfg.next)} disabled={actionId === task._id}
                          style={{ width: "100%", padding: "8px 0", borderRadius: 8, border: "none", background: cfg.bg, color: cfg.color, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                          <ArrowRight size={13} /> {actionId === task._id ? "..." : cfg.action}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}