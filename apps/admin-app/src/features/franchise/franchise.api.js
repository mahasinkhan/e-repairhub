import httpClient from "../../services/httpClient.js";

export async function getFranchises() {
  const { data } = await httpClient.get("/franchises");
  if (!data?.success) throw new Error(data?.message || "Failed to load franchises");
  return data.data;
}

export async function getActiveFranchises() {
  const { data } = await httpClient.get("/franchises/active");
  if (!data?.success) throw new Error(data?.message || "Failed to load franchises");
  return data.data;
}

export async function createFranchise(body) {
  const { data } = await httpClient.post("/franchises", body);
  if (!data?.success) throw new Error(data?.message || "Failed to create franchise");
  return data.data;
}

export async function updateFranchise(id, body) {
  const { data } = await httpClient.put(`/franchises/${id}`, body);
  if (!data?.success) throw new Error(data?.message || "Failed to update franchise");
  return data.data;
}

export async function toggleFranchiseStatus(id, isActive) {
  const { data } = await httpClient.patch(`/franchises/${id}/status`, { isActive });
  if (!data?.success) throw new Error(data?.message || "Failed to update status");
  return data.data;
}

export async function deleteFranchise(id) {
  const { data } = await httpClient.delete(`/franchises/${id}`);
  if (!data?.success) throw new Error(data?.message || "Failed to delete franchise");
  return data.data;
}