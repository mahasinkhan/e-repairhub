import httpClient from "./httpClient.js";

/**
 * @param {Record<string, string|number|undefined>} params
 */
export async function getUsers(params) {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== "")
  );
  const { data } = await httpClient.get("/users", { params: clean });
  if (!data?.success) throw new Error(data?.message || "Failed to load users");
  return data.data;
}

/**
 * @param {Record<string, unknown>} body
 */
export async function createUser(body) {
  const { data } = await httpClient.post("/users", body);
  if (!data?.success) throw new Error(data?.message || "Failed to create user");
  return data.data;
}

/**
 * @param {string} id
 * @param {Record<string, unknown>} body
 */
export async function updateUser(id, body) {
  const { data } = await httpClient.put(`/users/${id}`, body);
  if (!data?.success) throw new Error(data?.message || "Failed to update user");
  return data.data;
}

/**
 * @param {string} id
 */
export async function deleteUser(id) {
  const { data } = await httpClient.delete(`/users/${id}`);
  if (!data?.success) throw new Error(data?.message || "Failed to delete user");
  return data.data;
}

/**
 * @param {string} id
 * @param {boolean} isActive
 */
export async function updateUserStatus(id, isActive) {
  const { data } = await httpClient.patch(`/users/${id}/status`, { isActive });
  if (!data?.success) throw new Error(data?.message || "Failed to update status");
  return data.data;
}

/**
 * @param {string} id
 */
export async function getUserById(id) {
  const { data } = await httpClient.get(`/users/${id}`);
  if (!data?.success) throw new Error(data?.message || "Failed to load user");
  return data.data;
}
