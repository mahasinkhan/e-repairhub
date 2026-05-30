import type { OrderStatus, PaymentStatus } from "./order.model.js";

export interface CreateOrderDto {
  customer: { name: string; phone: string; address: string; userId?: string };
  deviceDetails: { brand: string; model: string; color?: string; issue: string };
  serviceType: string;
  price: number;
  paymentStatus?: PaymentStatus;
}

export interface AssignOrderDto {
  franchiseId?: string;
  agentId?: string;
}

export interface UpdateStatusDto {
  status: OrderStatus;
  note?: string;
  by?: string;
}

export interface OrderFilters {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}