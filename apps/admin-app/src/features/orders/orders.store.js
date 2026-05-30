import { create } from "zustand";
import {
  getOrders,
  getOrderById,
  assignOrderApi,
  updateOrderStatusApi,
  cancelOrderApi,
} from "./orders.api.js";

export const useOrdersStore = create((set, get) => ({
  orders: [],
  selectedOrder: null,
  loading: false,
  detailLoading: false,
  error: null,
  filters: { status: "all", search: "" },
  pagination: { page: 1, limit: 20, total: 0 },

  setFilters: (filters) => {
    set({ filters: { ...get().filters, ...filters } });
  },

  fetchOrders: async () => {
    set({ loading: true, error: null });
    try {
      const { filters, pagination } = get();
      const result = await getOrders({
        status: filters.status,
        search: filters.search,
        page: pagination.page,
        limit: pagination.limit,
      });
      set({
        orders: result.orders ?? result ?? [],
        pagination: {
          ...get().pagination,
          total: result.total ?? 0,
        },
        loading: false,
      });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchOrderById: async (id) => {
    set({ detailLoading: true, error: null, selectedOrder: null });
    try {
      const order = await getOrderById(id);
      set({ selectedOrder: order, detailLoading: false });
    } catch (err) {
      set({ error: err.message, detailLoading: false });
    }
  },

  assign: async (orderId, franchiseId, agentId) => {
    const order = await assignOrderApi({ orderId, franchiseId, agentId });
    set({ selectedOrder: order });
    return order;
  },

  changeStatus: async (orderId, status, note) => {
    const order = await updateOrderStatusApi(orderId, status, note);
    set({ selectedOrder: order });
    get().fetchOrders();
    return order;
  },

  cancel: async (orderId, reason) => {
    const order = await cancelOrderApi(orderId, reason);
    set({ selectedOrder: order });
    get().fetchOrders();
    return order;
  },
}));