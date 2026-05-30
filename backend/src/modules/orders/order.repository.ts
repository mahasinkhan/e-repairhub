import mongoose from "mongoose";
import { Order } from "./order.model.js";
import type { OrderFilters } from "./order.types.js";

export async function findOrders(filters: OrderFilters) {
  const { status, search, page = 1, limit = 20 } = filters;
  const query: Record<string, unknown> = {};

  if (status && status !== "all") query.status = status;
  if (search) {
    query.$or = [
      { orderNumber: { $regex: search, $options: "i" } },
      { "customer.name": { $regex: search, $options: "i" } },
      { "customer.phone": { $regex: search, $options: "i" } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate("assignedFranchise", "name location")
      .populate("deliveryAgent", "name email username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Order.countDocuments(query),
  ]);

  return { orders, total, page: Number(page), limit: Number(limit) };
}

export async function findOrderById(id: string) {
  if (!mongoose.isValidObjectId(id)) throw new Error("Invalid order ID");
  const order = await Order.findById(id)
    .populate("assignedFranchise", "name location contact commissionPercent")
    .populate("deliveryAgent", "name email username phone")
    .lean();
  if (!order) throw new Error("Order not found");
  return order;
}

export async function getDashboardStats() {
  const [statusCounts, revenueResult] = await Promise.all([
    Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$price" } } },
    ]),
  ]);

  const counts: Record<string, number> = {};
  statusCounts.forEach((s) => { counts[s._id] = s.count; });

  const totalOrders = await Order.countDocuments();
  const newOrders = counts["placed"] ?? 0;
  const ongoingOrders = (counts["confirmed"] ?? 0) + (counts["assigned"] ?? 0) +
    (counts["picked"] ?? 0) + (counts["repairing"] ?? 0);
  const completedOrders = counts["completed"] ?? 0;
  const deliveredOrders = counts["delivered"] ?? 0;
  const cancelledOrders = counts["cancelled"] ?? 0;
  const totalRevenue = revenueResult[0]?.total ?? 0;

  const recentOrders = await Order.find()
    .populate("assignedFranchise", "name")
    .populate("deliveryAgent", "name")
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  return {
    totalOrders, newOrders, ongoingOrders,
    completedOrders, deliveredOrders, cancelledOrders,
    totalRevenue, recentOrders,
  };
}