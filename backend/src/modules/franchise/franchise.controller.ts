import type { Response, NextFunction } from "express";
import type { AuthedRequest } from "../auth/auth.middleware.js";
import mongoose from "mongoose";
import { Franchise } from "./franchise.model.js";
import { Order } from "../orders/order.model.js";

const ok = (res: Response, data: unknown, message = "Success") =>
  res.json({ success: true, data, message });

const fail = (res: Response, message: string, status = 400) =>
  res.status(status).json({ success: false, message });

async function getFranchiseForUser(userId: string) {
  return Franchise.findOne({
    owner: new mongoose.Types.ObjectId(userId),
  }).lean();
}

export async function getMyProfile(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const franchise = await getFranchiseForUser(req.userId!);
    if (!franchise) return fail(res, "No franchise linked to your account. Ask admin to link you.", 404);
    ok(res, franchise);
  } catch (e) { next(e); }
}

export async function getMyStats(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const franchise = await getFranchiseForUser(req.userId!);
    if (!franchise) return fail(res, "No franchise linked to your account", 404);

    const fid = franchise._id;

    const [statusCounts, revenueResult, recentOrders] = await Promise.all([
      Order.aggregate([
        { $match: { assignedFranchise: fid } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: { assignedFranchise: fid, paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$price" } } },
      ]),
      Order.find({ assignedFranchise: fid })
        .populate("deliveryAgent", "name phone")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    const counts: Record<string, number> = {};
    statusCounts.forEach((s) => { counts[s._id] = s.count; });

    const totalOrders = Object.values(counts).reduce((a, b) => a + b, 0);
    const totalRevenue = revenueResult[0]?.total ?? 0;
    const commissionPercent = (franchise as any).commissionPercent ?? 0;
    const commission = Math.round((totalRevenue * commissionPercent) / 100);

    ok(res, {
      franchise,
      totalOrders,
      pendingOrders: (counts["placed"] ?? 0) + (counts["assigned"] ?? 0),
      inRepair: counts["repairing"] ?? 0,
      completedOrders: counts["completed"] ?? 0,
      deliveredOrders: counts["delivered"] ?? 0,
      cancelledOrders: counts["cancelled"] ?? 0,
      totalRevenue,
      commission,
      commissionPercent,
      recentOrders,
    });
  } catch (e) { next(e); }
}

export async function getMyOrders(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const franchise = await getFranchiseForUser(req.userId!);
    if (!franchise) return fail(res, "No franchise linked to your account", 404);

    const { status, page = 1, limit = 20 } = req.query;
    const query: Record<string, unknown> = { assignedFranchise: franchise._id };
    if (status && status !== "all") query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate("deliveryAgent", "name phone username")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Order.countDocuments(query),
    ]);

    ok(res, { orders, total, page: Number(page), limit: Number(limit) });
  } catch (e) { next(e); }
}

export async function getMyOrderById(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const franchise = await getFranchiseForUser(req.userId!);
    if (!franchise) return fail(res, "No franchise linked", 404);

    const order = await Order.findOne({ _id: req.params.id, assignedFranchise: franchise._id })
      .populate("deliveryAgent", "name phone username")
      .lean();
    if (!order) return fail(res, "Order not found", 404);
    ok(res, order);
  } catch (e) { next(e); }
}

export async function acceptOrder(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const franchise = await getFranchiseForUser(req.userId!);
    if (!franchise) return fail(res, "No franchise linked", 404);

    const order = await Order.findOne({ _id: req.params.id, assignedFranchise: franchise._id });
    if (!order) return fail(res, "Order not found", 404);
    if (!["assigned", "placed"].includes(order.status)) return fail(res, "Order cannot be accepted at this stage");

    order.status = "confirmed";
    order.timeline.push({ status: "confirmed", by: "franchise", time: new Date() });
    await order.save();
    ok(res, order, "Order accepted");
  } catch (e) { next(e); }
}

export async function rejectOrder(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const franchise = await getFranchiseForUser(req.userId!);
    if (!franchise) return fail(res, "No franchise linked", 404);

    const { reason } = req.body;
    if (!reason?.trim()) return fail(res, "Reason is required");

    const order = await Order.findOne({ _id: req.params.id, assignedFranchise: franchise._id });
    if (!order) return fail(res, "Order not found", 404);

    order.status = "cancelled";
    order.cancelReason = reason;
    order.timeline.push({ status: "cancelled", by: "franchise", time: new Date(), note: reason });
    await order.save();
    ok(res, order, "Order rejected");
  } catch (e) { next(e); }
}

export async function markReceived(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const franchise = await getFranchiseForUser(req.userId!);
    if (!franchise) return fail(res, "No franchise linked", 404);

    const order = await Order.findOne({ _id: req.params.id, assignedFranchise: franchise._id });
    if (!order) return fail(res, "Order not found", 404);

    order.status = "picked";
    order.timeline.push({ status: "picked", by: "franchise", time: new Date() });
    await order.save();
    ok(res, order, "Device received");
  } catch (e) { next(e); }
}

export async function startRepair(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const franchise = await getFranchiseForUser(req.userId!);
    if (!franchise) return fail(res, "No franchise linked", 404);

    const order = await Order.findOne({ _id: req.params.id, assignedFranchise: franchise._id });
    if (!order) return fail(res, "Order not found", 404);

    order.status = "repairing";
    order.timeline.push({ status: "repairing", by: "franchise", time: new Date() });
    await order.save();
    ok(res, order, "Repair started");
  } catch (e) { next(e); }
}

export async function completeRepair(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const franchise = await getFranchiseForUser(req.userId!);
    if (!franchise) return fail(res, "No franchise linked", 404);

    const { notes } = req.body;
    const order = await Order.findOne({ _id: req.params.id, assignedFranchise: franchise._id });
    if (!order) return fail(res, "Order not found", 404);
    if (order.status !== "repairing") return fail(res, "Order must be in repairing state");

    order.status = "completed";
    if (notes) order.notes = notes;
    order.timeline.push({ status: "completed", by: "franchise", time: new Date(), note: notes });
    await order.save();
    ok(res, order, "Repair completed");
  } catch (e) { next(e); }
}

export async function getMyEarnings(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const franchise = await getFranchiseForUser(req.userId!);
    if (!franchise) return fail(res, "No franchise linked", 404);

    const commissionPercent = (franchise as any).commissionPercent ?? 0;

    const completedOrders = await Order.find({
      assignedFranchise: franchise._id,
      status: { $in: ["completed", "delivered"] },
    }).sort({ createdAt: -1 }).lean();

    const orders = completedOrders.map((o) => ({
      _id: o._id,
      orderNumber: o.orderNumber,
      customer: o.customer,
      serviceType: o.serviceType,
      price: o.price,
      commission: Math.round((o.price * commissionPercent) / 100),
      status: o.status,
      createdAt: o.createdAt,
    }));

    const totalRevenue = orders.reduce((s, o) => s + o.price, 0);
    const totalCommission = orders.reduce((s, o) => s + o.commission, 0);

    ok(res, {
      commissionPercent,
      totalRevenue,
      totalCommission,
      totalOrders: orders.length,
      orders,
    });
  } catch (e) { next(e); }
}