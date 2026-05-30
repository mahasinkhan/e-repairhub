import { create } from "zustand";
import { login as loginApi } from "./auth.api.js";

export const useAuthStore = create((set) => ({
  token: localStorage.getItem("token") || null,
  user: (() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  })(),
  loading: false,
  error: null,

  login: async (emailOrUsername, password) => {
    set({ loading: true, error: null });
    try {
      const { token, user } = await loginApi({
        emailOrUsername,
        password,
        role: "admin",
      });
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      set({ token, user, loading: false });
      return true;
    } catch (err) {
      set({ error: err.message, loading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ token: null, user: null, error: null });
  },
}));