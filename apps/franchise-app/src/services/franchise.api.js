import httpClient from "./httpClient.js";

async function handle(promise) {
  const { data } = await promise;
  if (!data?.success) throw new Error(data?.message || "Request failed");
  return data.data;
}

export const getMyStats          = ()           => handle(httpClient.get("/franchise-panel/stats"));
export const getMyProfile        = ()           => handle(httpClient.get("/franchise-panel/profile"));
export const getMyEarnings       = ()           => handle(httpClient.get("/franchise-panel/earnings"));
export const getMyDeliveryOrders = ()           => handle(httpClient.get("/franchise-panel/delivery-orders"));
export const getMyOrderById      = (id)         => handle(httpClient.get(`/franchise-panel/orders/${id}`));
export const acceptOrder         = (id)         => handle(httpClient.patch(`/franchise-panel/orders/${id}/accept`));
export const rejectOrder         = (id, reason) => handle(httpClient.patch(`/franchise-panel/orders/${id}/reject`, { reason }));
export const markReceived        = (id)         => handle(httpClient.patch(`/franchise-panel/orders/${id}/received`));
export const startRepair         = (id)         => handle(httpClient.patch(`/franchise-panel/orders/${id}/start-repair`));
export const completeRepair      = (id, notes, images = []) => handle(httpClient.patch(`/franchise-panel/orders/${id}/complete`, { notes, images }));
export const rejectRepair        = (id, reason) => handle(httpClient.patch(`/franchise-panel/orders/${id}/reject-repair`, { reason }));
export const requestExtraService = (id, data)   => handle(httpClient.post(`/franchise-panel/orders/${id}/extra-service`, data));

export const getMyOrders = (params = {}) => {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== "" && v !== "all")
  );
  return handle(httpClient.get("/franchise-panel/orders", { params: clean }));
};