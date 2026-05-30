import httpClient from "./httpClient.js";

export async function login({ emailOrUsername, password }) {
  try {
    const { data } = await httpClient.post("/auth/login", {
      emailOrUsername,
      password,
      role: "delivery",
    });
    if (!data?.success || !data.token || !data.user) {
      throw new Error(data?.message || "Login failed.");
    }
    if (data.user.role !== "delivery") {
      throw new Error("This portal is for delivery agents only.");
    }
    return { token: data.token, user: data.user };
  } catch (e) {
    const msg =
      e?.response?.data?.message ||
      (e?.code === "ERR_NETWORK" ? "Network error. Is the server running?" : null) ||
      e?.message ||
      "Login failed. Please try again.";
    throw new Error(msg);
  }
}