import { create } from "zustand";
import {
  getFranchises, createFranchise,
  updateFranchise, toggleFranchiseStatus, deleteFranchise,
} from "./franchise.api.js";

export const useFranchiseStore = create((set, get) => ({
  franchises: [],
  loading: false,
  error: null,

  fetchFranchises: async () => {
    set({ loading: true, error: null });
    try {
      const result = await getFranchises();
      set({ franchises: result ?? [], loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  addFranchise: async (body) => {
    const franchise = await createFranchise(body);
    set({ franchises: [franchise, ...get().franchises] });
    return franchise;
  },

  editFranchise: async (id, body) => {
    const updated = await updateFranchise(id, body);
    set({
      franchises: get().franchises.map((f) => (f._id === id ? updated : f)),
    });
    return updated;
  },

  toggleStatus: async (id, isActive) => {
    const updated = await toggleFranchiseStatus(id, isActive);
    set({
      franchises: get().franchises.map((f) => (f._id === id ? updated : f)),
    });
    return updated;
  },

  removeFranchise: async (id) => {
    await deleteFranchise(id);
    set({ franchises: get().franchises.filter((f) => f._id !== id) });
  },
}));