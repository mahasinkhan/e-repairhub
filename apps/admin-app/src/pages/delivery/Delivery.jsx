import { useEffect, useState, useCallback } from "react";
import {
  RefreshCw, Truck, UserPlus, ToggleLeft, ToggleRight,
  Phone, Mail, X, Package, CheckCircle, Clock,
  Search, Plus, Layers, ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import httpClient from "../../services/httpClient.js";

// ── Constants ─────────────────────────────────────────────────────────────────

const TASK_STATUS_CONFIG = {
  pending:     { label: "Pending",     color: "bg-yellow-100 text-yellow-700",  dot: "bg-yellow-400" },
  accepted:    { label: "Accepted",    color: "bg-blue-100 text-blue-700",      dot: "bg-blue-400"   },
  in_progress: { label: "In Progress", color: "bg-orange-100 text-orange-700",  dot: "bg-orange-400" },
  completed:   { label: "Completed",   color: "bg-green-100 text-green-700",    dot: "bg-green-500"  },
  failed:      { label: "Failed",      color: "bg-red-100 text-red-700",        dot: "bg-red-500"    },
  rejected:    { label: "Rejected",    color: "bg-slate-100 text-slate-500",    dot: "bg-slate-400"  },
};

const TASK_TYPE_CONFIG = {
  pickup:   { label: "Pickup",   color: "bg-purple-100 text-purple-700" },
  delivery: { label: "Delivery", color: "bg-teal-100 text-teal-700"    },
};

const TASK_STATUSES = ["all", "pending", "accepted", "in_progress", "completed", "failed"];
const TASK_TYPES    = ["all", "pickup", "delivery"];

// ── Shared UI ─────────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const cfg = TASK_STATUS_CONFIG[status] ?? { label: status, color: "bg-slate-100 text-slate-600", dot: "bg-slate-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function TypeBadge({ type }) {
  const cfg = TASK_TYPE_CONFIG[type] ?? { label: type, color: "bg-slate-100 text-slate-600" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.color}`}>
      {type === "pickup" ? "↑" : "↓"} {cfg.label}
    </span>
  );
}

function StatCard({ label, value, icon: Icon, color, bg, border }) {
  return (
    <div className={`bg-white border ${border} rounded-xl p-4 shadow-sm`}>
      <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-3`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value ?? "—"}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  );
}

// ── Agent Modal ───────────────────────────────────────────────────────────────

const EMPTY_FORM = { name: "", username: "", email: "", phone: "", password: "", isActive: true };

function AgentModal({ open, agent, onClose, onSuccess }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(agent
      ? { name: agent.name ?? "", username: agent.username ?? "", email: agent.email ?? "", phone: agent.phone ?? "", password: "", isActive: agent.isActive ?? true }
      : EMPTY_FORM
    );
  }, [agent, open]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Name is required");
    if (!form.email.trim()) return toast.error("Email is required");
    if (!agent && !form.password.trim()) return toast.error("Password required for new agent");
    setSaving(true);
    try {
      if (agent) {
        const body = { ...form, role: "delivery" };
        if (!body.password) delete body.password;
        await httpClient.put(`/users/${agent._id}`, body);
        toast.success("Agent updated");
      } else {
        await httpClient.post("/users", { ...form, role: "delivery" });
        toast.success("Agent added");
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">{agent ? "Edit Agent" : "Add Delivery Agent"}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {[
            { key: "name",     label: "Full Name *",  placeholder: "Arun Das" },
            { key: "username", label: "Username *",   placeholder: "arun_das" },
            { key: "email",    label: "Email *",      placeholder: "agent@erepairhub.com", type: "email" },
            { key: "phone",    label: "Phone",        placeholder: "10-digit mobile" },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">{f.label}</label>
              <input type={f.type ?? "text"} value={form[f.key]} placeholder={f.placeholder}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition" />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Password {agent && <span className="text-slate-400">(blank = keep current)</span>}
            </label>
            <input type="password" value={form.password} placeholder="••••••••"
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition" />
          </div>
          <div className="flex items-center gap-3">
            <button type="button"
              onClick={() => setForm(p => ({ ...p, isActive: !p.isActive }))}
              className={`w-10 h-6 rounded-full relative transition-colors ${form.isActive ? "bg-orange-500" : "bg-slate-300"}`}>
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.isActive ? "left-5" : "left-1"}`} />
            </button>
            <span className="text-sm text-slate-600">{form.isActive ? "Active" : "Inactive"}</span>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium rounded-xl py-2.5 text-sm transition">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold rounded-xl py-2.5 text-sm transition">
              {saving ? "Saving..." : agent ? "Update Agent" : "Add Agent"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Assign Task Modal ─────────────────────────────────────────────────────────

function AssignTaskModal({ open, agents, onClose, onSuccess }) {
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [form, setForm] = useState({ orderId: "", agentId: "", taskType: "pickup", scheduledTime: "" });
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setOrdersLoading(true);
    setForm({ orderId: "", agentId: "", taskType: "pickup", scheduledTime: "" });
    setSearch("");
    httpClient.get("/delivery/available-orders")
      .then(r => setOrders(r.data?.data ?? []))
      .catch(() => toast.error("Failed to load orders"))
      .finally(() => setOrdersLoading(false));
  }, [open]);

  if (!open) return null;

  const filteredOrders = search.trim()
    ? orders.filter(o =>
        o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
        o.customer?.name?.toLowerCase().includes(search.toLowerCase())
      )
    : orders;

  const selectedOrder = orders.find(o => o._id === form.orderId);
  const activeAgents = agents.filter(a => a.isActive);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.orderId) return toast.error("Select an order");
    if (!form.agentId) return toast.error("Select a delivery agent");
    setSaving(true);
    try {
      await httpClient.post("/delivery/tasks", form);
      toast.success("Task assigned successfully");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div>
            <h3 className="font-semibold text-slate-800">Assign Delivery Task</h3>
            <p className="text-xs text-slate-400 mt-0.5">Select order → agent → task type</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Task type */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Task Type</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "pickup",   label: "Pickup",   desc: "Pick up from customer",    icon: Package },
                { value: "delivery", label: "Delivery", desc: "Deliver back to customer", icon: Truck   },
              ].map(t => {
                const Icon = t.icon;
                const active = form.taskType === t.value;
                return (
                  <button key={t.value} type="button"
                    onClick={() => setForm(f => ({ ...f, taskType: t.value }))}
                    className={`p-3.5 rounded-xl border-2 text-sm font-semibold transition flex flex-col items-center gap-1.5 ${
                      active
                        ? t.value === "pickup" ? "border-purple-500 bg-purple-50 text-purple-700" : "border-teal-500 bg-teal-50 text-teal-700"
                        : "border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}>
                    <Icon className="w-5 h-5" />
                    <span>{t.label}</span>
                    <span className={`text-xs font-normal ${active ? "" : "text-slate-400"}`}>{t.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Order selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Select Order</label>
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search order ID or customer name..."
                className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-1 focus:ring-orange-400 transition" />
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-44 overflow-y-auto">
              {ordersLoading ? (
                <div className="flex items-center justify-center py-6 text-slate-400 text-xs">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin mr-2" /> Loading orders...
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs">No orders available for delivery</div>
              ) : (
                filteredOrders.map(order => (
                  <div key={order._id} onClick={() => setForm(f => ({ ...f, orderId: order._id }))}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-slate-100 last:border-0 transition ${
                      form.orderId === order._id ? "bg-orange-50 border-l-2 border-l-orange-500" : "hover:bg-slate-50"
                    }`}>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      order.status === "completed" ? "bg-green-500" : order.status === "confirmed" ? "bg-blue-400" : "bg-orange-400"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-800">{order.orderNumber}</p>
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                          order.status === "completed" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                        }`}>{order.status}</span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">{order.customer?.name} · {order.deviceDetails?.model} · ₹{order.price}</p>
                    </div>
                    {form.orderId === order._id && <CheckCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Selected order info */}
          {selectedOrder && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <p className="text-xs font-semibold text-slate-600 mb-2">Order Summary</p>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {[
                  ["Customer", selectedOrder.customer?.name],
                  ["Phone",    selectedOrder.customer?.phone],
                  ["Device",   `${selectedOrder.deviceDetails?.brand} ${selectedOrder.deviceDetails?.model}`],
                  ["Address",  selectedOrder.customer?.address],
                ].map(([k, v]) => (
                  <div key={k}><span className="text-slate-400">{k}: </span><span className="font-medium text-slate-700 truncate">{v}</span></div>
                ))}
              </div>
            </div>
          )}

          {/* Agent selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Select Agent {activeAgents.length === 0 && <span className="text-red-400 normal-case">(No active agents)</span>}
            </label>
            <div className="space-y-2 max-h-44 overflow-y-auto">
              {activeAgents.map(agent => (
                <div key={agent._id} onClick={() => setForm(f => ({ ...f, agentId: agent._id }))}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${
                    form.agentId === agent._id ? "border-orange-500 bg-orange-50" : "border-slate-200 hover:border-slate-300"
                  }`}>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {agent.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800">{agent.name}</p>
                    <p className="text-xs text-slate-400">{agent.phone} · <span className="text-orange-500">{agent.activeTasks ?? 0} active tasks</span></p>
                  </div>
                  {form.agentId === agent._id && <CheckCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />}
                </div>
              ))}
            </div>
          </div>

          {/* Scheduled time */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Scheduled Time (Optional)</label>
            <input type="datetime-local" value={form.scheduledTime}
              onChange={e => setForm(f => ({ ...f, scheduledTime: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition" />
          </div>
        </form>

        <div className="flex gap-3 px-6 py-4 border-t border-slate-100 flex-shrink-0">
          <button type="button" onClick={onClose} className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium rounded-xl py-2.5 text-sm transition">Cancel</button>
          <button onClick={handleSubmit} disabled={saving || !form.orderId || !form.agentId}
            className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-2.5 text-sm transition">
            {saving ? "Assigning..." : "Assign Task"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Update Task Status Modal ──────────────────────────────────────────────────

function UpdateStatusModal({ open, task, onClose, onSuccess }) {
  const [newStatus, setNewStatus] = useState("");
  const [failReason, setFailReason] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNewStatus("");
    setFailReason("");
  }, [task, open]);

  if (!open || !task) return null;

  const NEXT = {
    pending:     ["accepted", "rejected"],
    accepted:    ["in_progress", "failed"],
    in_progress: ["completed", "failed"],
    completed:   [], failed: [], rejected: [],
  };

  const available = NEXT[task.status] ?? [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newStatus) return toast.error("Select a new status");
    if (newStatus === "failed" && !failReason.trim()) return toast.error("Fail reason is required");
    setSaving(true);
    try {
      await httpClient.patch(`/delivery/tasks/${task._id}/status`, { status: newStatus, failReason });
      toast.success("Task status updated");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Update Task Status</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6">
          {/* Task summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-slate-700 text-sm">{task.order?.orderNumber}</span>
              <TypeBadge type={task.taskType} />
            </div>
            <p className="text-xs text-slate-500 mb-2">{task.order?.customer?.name} · {task.order?.deviceDetails?.model}</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Current status:</span>
              <StatusBadge status={task.status} />
            </div>
          </div>

          {available.length === 0 ? (
            <div className="text-center py-4">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-sm text-slate-600">This task is in a final state</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Move to</p>
                <div className="space-y-2">
                  {available.map(s => (
                    <label key={s} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${
                      newStatus === s ? "border-orange-400 bg-orange-50" : "border-slate-200 hover:border-slate-300"
                    }`}>
                      <input type="radio" name="status" value={s}
                        checked={newStatus === s} onChange={() => setNewStatus(s)}
                        className="accent-orange-500" />
                      <StatusBadge status={s} />
                    </label>
                  ))}
                </div>
              </div>

              {newStatus === "failed" && (
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Fail Reason *</label>
                  <textarea value={failReason} onChange={e => setFailReason(e.target.value)}
                    rows={2} placeholder="Describe why this task failed..."
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 resize-none transition" />
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={onClose}
                  className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium rounded-xl py-2.5 text-sm transition">Cancel</button>
                <button type="submit" disabled={saving || !newStatus}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold rounded-xl py-2.5 text-sm transition">
                  {saving ? "Updating..." : "Update Status"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function Delivery() {
  const [activeTab, setActiveTab] = useState("tasks");
  const [stats, setStats] = useState(null);
  const [agents, setAgents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [tasksTotal, setTasksTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [taskLoading, setTaskLoading] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [agentFilter, setAgentFilter] = useState("all");
  const [taskSearch, setTaskSearch] = useState("");

  const [agentModal, setAgentModal] = useState({ open: false, agent: null });
  const [assignModal, setAssignModal] = useState(false);
  const [updateModal, setUpdateModal] = useState({ open: false, task: null });

  const loadStats = async () => {
    try {
      const { data } = await httpClient.get("/delivery/stats");
      setStats(data?.data ?? null);
    } catch {}
  };

  const loadAgents = async () => {
    try {
      const { data } = await httpClient.get("/delivery/agents");
      setAgents(data?.data ?? []);
    } catch {}
  };

  const loadTasks = useCallback(async () => {
    setTaskLoading(true);
    try {
      const params = {};
      if (statusFilter !== "all") params.status = statusFilter;
      if (typeFilter   !== "all") params.taskType = typeFilter;
      if (agentFilter  !== "all") params.agentId = agentFilter;
      const { data } = await httpClient.get("/delivery/tasks", { params });
      setTasks(data?.data?.tasks ?? []);
      setTasksTotal(data?.data?.total ?? 0);
    } catch {}
    finally { setTaskLoading(false); }
  }, [statusFilter, typeFilter, agentFilter]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadStats(), loadAgents(), loadTasks()]);
    setLoading(false);
  }, [loadTasks]);

  useEffect(() => { loadAll(); }, [loadAll]);
  useEffect(() => { if (!loading) loadTasks(); }, [loadTasks]);

  const handleToggleAgent = async (agent) => {
    setTogglingId(agent._id);
    try {
      await httpClient.patch(`/delivery/agents/${agent._id}/status`, { isActive: !agent.isActive });
      setAgents(prev => prev.map(a => a._id === agent._id ? { ...a, isActive: !a.isActive } : a));
      toast.success(`Agent ${agent.isActive ? "deactivated" : "activated"}`);
      loadStats();
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    } finally { setTogglingId(null); }
  };

  const filteredTasks = taskSearch.trim()
    ? tasks.filter(t =>
        t.order?.orderNumber?.toLowerCase().includes(taskSearch.toLowerCase()) ||
        t.order?.customer?.name?.toLowerCase().includes(taskSearch.toLowerCase()) ||
        t.agent?.name?.toLowerCase().includes(taskSearch.toLowerCase())
      )
    : tasks;

  const fmt = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  const TABS = [
    { key: "tasks",  label: "All Tasks", count: tasksTotal },
    { key: "agents", label: "Agents",    count: agents.length },
  ];

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Delivery Management</h2>
          <p className="text-slate-500 text-sm mt-1">Manage delivery agents, tasks and assignments</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadAll}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-medium hover:bg-slate-50 transition shadow-sm">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button onClick={() => setAssignModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition shadow-sm">
            <Plus className="w-4 h-4" /> Assign Task
          </button>
          <button onClick={() => setAgentModal({ open: true, agent: null })}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold transition shadow-sm">
            <UserPlus className="w-4 h-4" /> Add Agent
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Total Agents",    value: stats?.totalAgents,    icon: Truck,        color: "text-blue-600",   bg: "bg-blue-50",   border: "border-blue-100"   },
          { label: "Active Agents",   value: stats?.activeAgents,   icon: CheckCircle,  color: "text-green-600",  bg: "bg-green-50",  border: "border-green-100"  },
          { label: "Total Tasks",     value: stats?.totalTasks,     icon: Layers,       color: "text-slate-600",  bg: "bg-slate-50",  border: "border-slate-200"  },
          { label: "Pending",         value: stats?.pendingTasks,   icon: Clock,        color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-100" },
          { label: "In Progress",     value: stats?.inProgressTasks,icon: Truck,        color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100" },
          { label: "Completed Today", value: stats?.completedToday, icon: CheckCircle,  color: "text-teal-600",   bg: "bg-teal-50",   border: "border-teal-100"   },
        ].map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Main card with tabs */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition ${
                activeTab === tab.key
                  ? "border-orange-500 text-orange-600 bg-orange-50/50"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}>
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? "bg-orange-100 text-orange-600" : "bg-slate-100 text-slate-500"}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* ── TASKS TAB ── */}
        {activeTab === "tasks" && (
          <>
            {/* Filters */}
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input value={taskSearch} onChange={e => setTaskSearch(e.target.value)}
                  placeholder="Search order, customer, agent..."
                  className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-1 focus:ring-orange-400 w-56 transition" />
              </div>

              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-600 focus:outline-none focus:ring-1 focus:ring-orange-400 transition">
                {TASK_STATUSES.map(s => (
                  <option key={s} value={s}>{s === "all" ? "All Statuses" : TASK_STATUS_CONFIG[s]?.label ?? s}</option>
                ))}
              </select>

              <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-600 focus:outline-none focus:ring-1 focus:ring-orange-400 transition">
                {TASK_TYPES.map(t => (
                  <option key={t} value={t}>{t === "all" ? "All Types" : TASK_TYPE_CONFIG[t]?.label ?? t}</option>
                ))}
              </select>

              <select value={agentFilter} onChange={e => setAgentFilter(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-600 focus:outline-none focus:ring-1 focus:ring-orange-400 transition">
                <option value="all">All Agents</option>
                {agents.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
              </select>

              <span className="text-xs text-slate-400 ml-auto">
                {filteredTasks.length} of {tasksTotal} tasks
              </span>
            </div>

            {/* Table */}
            {taskLoading ? (
              <div className="flex items-center justify-center py-16 text-slate-400">
                <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading tasks...
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <Truck className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm font-medium text-slate-500">No tasks found</p>
                <p className="text-xs mt-1">Assign a task to get started</p>
                <button onClick={() => setAssignModal(true)}
                  className="mt-3 text-orange-500 text-sm font-medium hover:underline">
                  Assign Task →
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      {["Type", "Order", "Customer & Device", "Agent", "Status", "Scheduled", "Created", "Action"].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTasks.map(task => (
                      <tr key={task._id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3.5"><TypeBadge type={task.taskType} /></td>
                        <td className="px-4 py-3.5 font-semibold text-slate-800 whitespace-nowrap">
                          {task.order?.orderNumber}
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="font-medium text-slate-700 whitespace-nowrap">{task.order?.customer?.name}</p>
                          <p className="text-xs text-slate-400">{task.order?.deviceDetails?.model}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          {task.agent ? (
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs flex-shrink-0">
                                {task.agent.name?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-xs font-medium text-slate-700 whitespace-nowrap">{task.agent.name}</p>
                                <p className="text-xs text-slate-400">{task.agent.phone}</p>
                              </div>
                            </div>
                          ) : <span className="text-slate-400 text-xs">—</span>}
                        </td>
                        <td className="px-4 py-3.5"><StatusBadge status={task.status} /></td>
                        <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap">{fmt(task.scheduledTime)}</td>
                        <td className="px-4 py-3.5 text-xs text-slate-400 whitespace-nowrap">{fmt(task.createdAt)}</td>
                        <td className="px-4 py-3.5">
                          {["completed", "failed", "rejected"].includes(task.status) ? (
                            <span className={`text-xs font-medium ${task.status === "completed" ? "text-green-600" : "text-red-500"}`}>
                              {task.status === "completed" ? "✓ Done" : "✗ " + task.status}
                            </span>
                          ) : (
                            <button onClick={() => setUpdateModal({ open: true, task })}
                              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition whitespace-nowrap">
                              <ArrowRight className="w-3 h-3" /> Update
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ── AGENTS TAB ── */}
        {activeTab === "agents" && (
          <div className="p-5">
            {agents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <Truck className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm font-medium">No agents found</p>
                <button onClick={() => setAgentModal({ open: true, agent: null })}
                  className="mt-2 text-orange-500 text-sm hover:underline">Add first agent</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {agents.map(agent => (
                  <div key={agent._id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 hover:shadow-sm transition">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-xl">
                          {agent.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{agent.name}</p>
                          <p className="text-xs text-slate-400">@{agent.username}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                        agent.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                      }`}>
                        {agent.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="space-y-1.5 mb-4">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {agent.phone || "No phone"}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {agent.email}
                      </div>
                    </div>

                    {/* Task stats */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {[
                        { label: "Active",    value: agent.activeTasks    ?? 0, color: "text-orange-600", bg: "bg-orange-50"  },
                        { label: "Completed", value: agent.completedTasks ?? 0, color: "text-green-600",  bg: "bg-green-50"   },
                        { label: "Total",     value: agent.totalTasks     ?? 0, color: "text-blue-600",   bg: "bg-blue-50"    },
                      ].map(s => (
                        <div key={s.label} className={`${s.bg} rounded-xl p-2.5 text-center`}>
                          <p className={`font-bold text-lg ${s.color}`}>{s.value}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Performance bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Success rate</span>
                        <span>
                          {agent.totalTasks > 0
                            ? `${Math.round((agent.completedTasks / agent.totalTasks) * 100)}%`
                            : "N/A"}
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all"
                          style={{ width: agent.totalTasks > 0 ? `${Math.round((agent.completedTasks / agent.totalTasks) * 100)}%` : "0%" }} />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button onClick={() => handleToggleAgent(agent)} disabled={togglingId === agent._id}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-600 hover:bg-slate-50 transition disabled:opacity-40">
                        {agent.isActive
                          ? <><ToggleRight className="w-4 h-4 text-green-500" /> Deactivate</>
                          : <><ToggleLeft className="w-4 h-4" /> Activate</>
                        }
                      </button>
                      <button onClick={() => setAgentModal({ open: true, agent })}
                        className="flex-1 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold transition">
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <AgentModal
        open={agentModal.open}
        agent={agentModal.agent}
        onClose={() => setAgentModal({ open: false, agent: null })}
        onSuccess={() => { loadAgents(); loadStats(); }}
      />

      <AssignTaskModal
        open={assignModal}
        agents={agents}
        onClose={() => setAssignModal(false)}
        onSuccess={loadAll}
      />

      <UpdateStatusModal
        open={updateModal.open}
        task={updateModal.task}
        onClose={() => setUpdateModal({ open: false, task: null })}
        onSuccess={() => { loadTasks(); loadStats(); }}
      />
    </div>
  );
}