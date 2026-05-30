import httpClient from "./httpClient.js";

export async function login({ emailOrUsername, password, role }) {
  try {
    const { data } = await httpClient.post("/auth/login", {
      emailOrUsername,
      password,
      role,
    });
    if (!data?.success || !data.token || !data.user) {
      throw new Error(data?.message || "Login failed.");
    }
    return { token: data.token, user: data.user };
  } catch (e) {
    const msg =
      e?.response?.data?.message ||
      (e?.code === "ERR_NETWORK" ? "Network error. Is the API running?" : null) ||
      e?.message ||
      "Login failed. Please try again.";
    throw new Error(msg);
  }
}