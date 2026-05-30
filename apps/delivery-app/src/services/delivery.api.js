import httpClient from "./httpClient.js";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

// ── Helper to get current agent ID from localStorage ─────────────────────────
function getAgentId() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user._id || user.id || null;
  } catch { return null; }
}

// ── Helper to unwrap response ─────────────────────────────────────────────────
async function handle(promise) {
  const { data } = await promise;
  if (!data?.success) throw new Error(data?.message || "Request failed");
  return data.data;
}

// ── Tasks ─────────────────────────────────────────────────────────────────────
export const getMyTasks = (params = {}) => {
  const agentId = getAgentId();
  if (!agentId) throw new Error("Not logged in");
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v && v !== "all")
  );
  return handle(httpClient.get(`/delivery/agents/${agentId}/tasks`, { params: clean }));
};

// ── Stats (computed from tasks) ───────────────────────────────────────────────
export const getMyStats = async () => {
  const agentId = getAgentId();
  if (!agentId) throw new Error("Not logged in");

  const tasks = await getMyTasks();

  const active    = tasks.filter(t => ["pending", "accepted", "in_progress"].includes(t.status)).length;
  const completed = tasks.filter(t => t.status === "completed").length;
  const failed    = tasks.filter(t => t.status === "failed").length;
  const pickup    = tasks.filter(t => t.taskType === "pickup").length;
  const delivery  = tasks.filter(t => t.taskType === "delivery").length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const completedToday = tasks.filter(t =>
    t.status === "completed" &&
    t.completedAt &&
    new Date(t.completedAt) >= today
  ).length;

  return {
    total: tasks.length,
    active,
    completed,
    failed,
    pickup,
    delivery,
    completedToday,
  };
};

// ── Update task status — supports OTP for completion ─────────────────────────
export const updateTaskStatus = (taskId, status, failReason, otp) =>
  handle(httpClient.patch(`/delivery/tasks/${taskId}/status`, {
    status,
    ...(failReason ? { failReason } : {}),
    ...(otp       ? { otp }        : {}),
  }));

// ── Profile ───────────────────────────────────────────────────────────────────
export const getMyProfile = () => {
  const agentId = getAgentId();
  if (!agentId) throw new Error("Not logged in");
  return handle(httpClient.get(`/delivery/agents/${agentId}`));
};

// ── OTP — send to customer phone (for pickup/delivery verification) ───────────
export const sendDeliveryOtp = async (phone) => {
  const res = await fetch(`${BASE}/auth/send-otp`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ phone }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Failed to send OTP");
  return data;
};

// ── OTP — verify customer OTP ─────────────────────────────────────────────────
export const verifyDeliveryOtp = async (phone, otp) => {
  const res = await fetch(`${BASE}/auth/verify-otp`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ phone, otp }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Invalid OTP");
  return data;
};