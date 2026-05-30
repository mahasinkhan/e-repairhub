import httpClient from "../../services/httpClient.js";

export async function getOrders(params = {}) {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== "" && v !== "all")
  );
  const { data } = await httpClient.get("/orders", { params: clean });
  if (!data?.success) throw new Error(data?.message || "Failed to load orders");
  return data.data;
}

export async function getOrderById(id) {
  const { data } = await httpClient.get(`/orders/${id}`);
  if (!data?.success) throw new Error(data?.message || "Failed to load order");
  return data.data;
}

export async function assignOrderApi({ orderId, franchiseId, agentId }) {
  const { data } = await httpClient.patch(`/orders/${orderId}/assign`, {
    franchiseId,
    agentId,
  });
  if (!data?.success) throw new Error(data?.message || "Failed to assign order");
  return data.data;
}

export async function updateOrderStatusApi(orderId, status, note = "") {
  const { data } = await httpClient.patch(`/orders/${orderId}/status`, { status, note });
  if (!data?.success) throw new Error(data?.message || "Failed to update status");
  return data.data;
}

export async function cancelOrderApi(orderId, reason) {
  const { data } = await httpClient.patch(`/orders/${orderId}/cancel`, { reason });
  if (!data?.success) throw new Error(data?.message || "Failed to cancel order");
  return data.data;
}

export async function getDashboardStatsApi() {
  const { data } = await httpClient.get("/orders/stats/dashboard");
  if (!data?.success) throw new Error(data?.message || "Failed to load stats");
  return data.data;
}