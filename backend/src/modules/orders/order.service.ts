import { Order } from "./order.model.js";
import * as repo from "./order.repository.js";
import type { CreateOrderDto, AssignOrderDto, UpdateStatusDto, OrderFilters } from "./order.types.js";
import type { OrderStatus } from "./order.model.js";

export async function getOrders(filters: OrderFilters) {
  return repo.findOrders(filters);
}

export async function getOrderById(id: string) {
  return repo.findOrderById(id);
}

export async function createOrder(dto: CreateOrderDto, createdBy = "admin") {
  const order = new Order({
    ...dto,
    timeline: [{ status: "placed", by: createdBy, time: new Date() }],
  });
  await order.save();
  return order.toObject();
}

export async function assignOrder(id: string, dto: AssignOrderDto, by = "admin") {
  const order = await Order.findById(id);
  if (!order) throw new Error("Order not found");

  if (dto.franchiseId) order.assignedFranchise = dto.franchiseId as never;
  if (dto.agentId) order.deliveryAgent = dto.agentId as never;

  if (order.status === "placed" || order.status === "confirmed") {
    order.status = "assigned";
    order.timeline.push({ status: "assigned", by, time: new Date() });
  }

  await order.save();
  return repo.findOrderById(id);
}

export async function updateOrderStatus(id: string, dto: UpdateStatusDto) {
  const order = await Order.findById(id);
  if (!order) throw new Error("Order not found");

  order.status = dto.status;
  order.timeline.push({
    status: dto.status,
    by: dto.by ?? "admin",
    time: new Date(),
    note: dto.note,
  });

  await order.save();
  return repo.findOrderById(id);
}

export async function cancelOrder(id: string, reason: string, by = "admin") {
  const order = await Order.findById(id);
  if (!order) throw new Error("Order not found");
  if (order.status === "cancelled") throw new Error("Order is already cancelled");

  order.status = "cancelled";
  order.cancelReason = reason;
  order.timeline.push({ status: "cancelled", by, time: new Date(), note: reason });

  await order.save();
  return repo.findOrderById(id);
}

export async function getDashboardStats() {
  return repo.getDashboardStats();
}

const VALID_STATUSES: OrderStatus[] = [
  "placed", "confirmed", "assigned", "picked",
  "repairing", "completed", "delivered", "cancelled",
];

export function isValidStatus(s: string): s is OrderStatus {
  return VALID_STATUSES.includes(s as OrderStatus);
}