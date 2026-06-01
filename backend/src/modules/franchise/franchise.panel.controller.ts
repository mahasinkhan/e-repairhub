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
  return Franchise.findOne({ owner: new mongoose.Types.ObjectId(userId) }).lean();
}

// ── Helper: send SMS via Twilio ───────────────────────────────────────────────
async function sendSms(phone: string, body: string): Promise<void> {
  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from  = process.env.TWILIO_PHONE_NUMBER;
  if (!sid || !token || !from) return;

  const digits = phone.replace(/\D/g, "");
  let normalized = phone;
  if (digits.length === 10)                                 normalized = `+91${digits}`;
  else if (digits.length === 11 && digits.startsWith("0")) normalized = `+91${digits.slice(1)}`;
  else if (digits.length === 12 && digits.startsWith("91")) normalized = `+${digits}`;

  try {
    const twilio = (await import("twilio")).default;
    await twilio(sid, token).messages.create({ to: normalized, from, body });
    console.log(`[sms] Sent to ${normalized}`);
  } catch (e: any) {
    console.warn("[sms] Failed:", e.message);
  }
}

// ── Profile ───────────────────────────────────────────────────────────────────
export async function getMyProfile(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const franchise = await getFranchiseForUser(req.userId!);
    if (!franchise) return fail(res, "No franchise linked to your account. Ask admin to link you.", 404);
    ok(res, franchise);
  } catch (e) { next(e); }
}

// ── Stats (with optional date range filter) ───────────────────────────────────
export async function getMyStats(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const franchise = await getFranchiseForUser(req.userId!);
    if (!franchise) return fail(res, "No franchise linked to your account", 404);

    const fid = franchise._id;

    // Build date range filter
    const baseQuery: Record<string, unknown> = { assignedFranchise: fid };
    const { from, to } = req.query;
    if (from || to) {
      const dateFilter: Record<string, Date> = {};
      if (from) dateFilter.$gte = new Date(String(from));
      if (to)   { const d = new Date(String(to)); d.setHours(23, 59, 59, 999); dateFilter.$lte = d; }
      baseQuery.createdAt = dateFilter;
    }

    const [statusCounts, revenueResult, recentOrders] = await Promise.all([
      Order.aggregate([
        { $match: baseQuery },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: { ...baseQuery, paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$price" } } },
      ]),
      // Recent orders always return latest 5 regardless of date filter
      Order.find({ assignedFranchise: fid })
        .populate("deliveryAgent", "name phone username")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    const counts: Record<string, number> = {};
    statusCounts.forEach((s) => { counts[s._id] = s.count; });

    const totalOrders       = Object.values(counts).reduce((a, b) => a + b, 0);
    const totalRevenue      = revenueResult[0]?.total ?? 0;
    const commissionPercent = (franchise as any).commissionPercent ?? 0;
    const commission        = Math.round((totalRevenue * commissionPercent) / 100);

    ok(res, {
      franchise,
      totalOrders,
      pendingOrders:   (counts["placed"] ?? 0) + (counts["assigned"] ?? 0),
      inRepair:         counts["repairing"]  ?? 0,
      completedOrders:  counts["completed"]  ?? 0,
      deliveredOrders:  counts["delivered"]  ?? 0,
      cancelledOrders:  counts["cancelled"]  ?? 0,
      totalRevenue,
      commission,
      commissionPercent,
      recentOrders,
    });
  } catch (e) { next(e); }
}

// ── Monthly stats for performance chart (last 12 months) ─────────────────────
export async function getMyMonthlyStats(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const franchise = await getFranchiseForUser(req.userId!);
    if (!franchise) return fail(res, "No franchise linked", 404);

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const [repairAgg, earningsAgg] = await Promise.all([
      Order.aggregate([
        { $match: { assignedFranchise: franchise._id, createdAt: { $gte: twelveMonthsAgo } } },
        { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        {
          $match: {
            assignedFranchise: franchise._id,
            paymentStatus: "paid",
            status: { $in: ["completed", "delivered"] },
            createdAt: { $gte: twelveMonthsAgo },
          },
        },
        {
          $group: {
            _id:     { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
            revenue: { $sum: "$price" },
            count:   { $sum: 1 },
          },
        },
      ]),
    ]);

    const now    = new Date();
    const months = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
      return {
        year:  d.getFullYear(),
        month: d.getMonth() + 1,
        label: d.toLocaleString("en", { month: "short" }),
      };
    });

    const repairMap   = new Map(repairAgg.map(s   => [`${s._id.year}-${s._id.month}`, s.count]));
    const earningsMap = new Map(earningsAgg.map(s => [`${s._id.year}-${s._id.month}`, s.revenue]));
    const delivMap    = new Map(earningsAgg.map(s => [`${s._id.year}-${s._id.month}`, s.count]));
    const commPct     = (franchise as any).commissionPercent ?? 0;

    const series = months.map(m => {
      const key     = `${m.year}-${m.month}`;
      const revenue = earningsMap.get(key) ?? 0;
      return {
        label:      m.label,
        repairs:    repairMap.get(key)   ?? 0,
        revenue,
        commission: Math.round((revenue * commPct) / 100),
        deliveries: delivMap.get(key)    ?? 0,
      };
    });

    ok(res, { series, labels: months.map(m => m.label) });
  } catch (e) { next(e); }
}

// ── Orders ────────────────────────────────────────────────────────────────────
export async function getMyOrders(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const franchise = await getFranchiseForUser(req.userId!);
    if (!franchise) return fail(res, "No franchise linked to your account", 404);

    const { status, page = 1, limit = 20, search } = req.query;
    const query: Record<string, unknown> = { assignedFranchise: franchise._id };
    if (status && status !== "all") query.status = status;
    if (search) {
      const q = String(search).trim();
      query.$or = [
        { orderNumber:      { $regex: q, $options: "i" } },
        { "customer.name":  { $regex: q, $options: "i" } },
        { "customer.phone": { $regex: q, $options: "i" } },
      ];
    }

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

// ── Order by ID ───────────────────────────────────────────────────────────────
export async function getMyOrderById(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const franchise = await getFranchiseForUser(req.userId!);
    if (!franchise) return fail(res, "No franchise linked", 404);
    if (!mongoose.isValidObjectId(req.params.id)) return fail(res, "Invalid order ID");

    const order = await Order.findOne({ _id: req.params.id, assignedFranchise: franchise._id })
      .populate("deliveryAgent", "name phone username")
      .lean();
    if (!order) return fail(res, "Order not found", 404);
    ok(res, order);
  } catch (e) { next(e); }
}

// ── Accept order ──────────────────────────────────────────────────────────────
export async function acceptOrder(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const franchise = await getFranchiseForUser(req.userId!);
    if (!franchise) return fail(res, "No franchise linked", 404);

    const order = await Order.findOne({ _id: req.params.id, assignedFranchise: franchise._id });
    if (!order) return fail(res, "Order not found", 404);
    if (!["assigned", "placed"].includes(order.status))
      return fail(res, `Order cannot be accepted at status: ${order.status}`);

    order.status = "confirmed";
    order.timeline.push({ status: "confirmed", by: "franchise", time: new Date() });
    await order.save();
    ok(res, order, "Order accepted");
  } catch (e) { next(e); }
}

// ── Reject order ──────────────────────────────────────────────────────────────
export async function rejectOrder(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const franchise = await getFranchiseForUser(req.userId!);
    if (!franchise) return fail(res, "No franchise linked", 404);

    const { reason } = req.body;
    if (!reason?.trim()) return fail(res, "Reason is required");

    const order = await Order.findOne({ _id: req.params.id, assignedFranchise: franchise._id });
    if (!order) return fail(res, "Order not found", 404);
    if (order.status === "cancelled") return fail(res, "Order already cancelled");

    order.status       = "cancelled";
    order.cancelReason = reason;
    order.timeline.push({ status: "cancelled", by: "franchise", time: new Date(), note: reason });
    await order.save();
    ok(res, order, "Order rejected");
  } catch (e) { next(e); }
}

// ── Mark received ─────────────────────────────────────────────────────────────
export async function markReceived(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const franchise = await getFranchiseForUser(req.userId!);
    if (!franchise) return fail(res, "No franchise linked", 404);

    const order = await Order.findOne({ _id: req.params.id, assignedFranchise: franchise._id });
    if (!order) return fail(res, "Order not found", 404);
    if (!["confirmed", "assigned"].includes(order.status))
      return fail(res, "Order must be confirmed before marking received");

    order.status = "picked";
    order.timeline.push({ status: "picked", by: "franchise", time: new Date() });
    await order.save();
    ok(res, order, "Device received at franchise");
  } catch (e) { next(e); }
}

// ── Start repair ──────────────────────────────────────────────────────────────
export async function startRepair(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const franchise = await getFranchiseForUser(req.userId!);
    if (!franchise) return fail(res, "No franchise linked", 404);

    const order = await Order.findOne({ _id: req.params.id, assignedFranchise: franchise._id });
    if (!order) return fail(res, "Order not found", 404);
    if (order.status !== "picked") return fail(res, "Device must be received before starting repair");

    order.status = "repairing";
    order.timeline.push({ status: "repairing", by: "franchise", time: new Date() });
    await order.save();
    ok(res, order, "Repair started");
  } catch (e) { next(e); }
}

// ── Complete repair ───────────────────────────────────────────────────────────
export async function completeRepair(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const franchise = await getFranchiseForUser(req.userId!);
    if (!franchise) return fail(res, "No franchise linked", 404);

    const { notes, images } = req.body;
    const order = await Order.findOne({ _id: req.params.id, assignedFranchise: franchise._id });
    if (!order) return fail(res, "Order not found", 404);
    if (order.status !== "repairing") return fail(res, "Order must be in repairing state");

    order.status = "completed";
    if (notes?.trim()) order.notes = notes.trim();
    if (Array.isArray(images) && images.length > 0)
      order.images = images.filter((url: string) => typeof url === "string" && url.startsWith("http"));

    order.timeline.push({
      status: "completed",
      by:     "franchise",
      time:   new Date(),
      note:   notes?.trim() || undefined,
    });
    await order.save();
    ok(res, order, "Repair completed — ready for delivery");
  } catch (e) { next(e); }
}

// ── Earnings ──────────────────────────────────────────────────────────────────
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
      _id:           o._id,
      orderNumber:   o.orderNumber,
      customer:      o.customer,
      serviceType:   o.serviceType,
      deviceDetails: o.deviceDetails,
      price:         o.price,
      commission:    Math.round((o.price * commissionPercent) / 100),
      status:        o.status,
      createdAt:     o.createdAt,
    }));

    const totalRevenue    = orders.reduce((s, o) => s + o.price,      0);
    const totalCommission = orders.reduce((s, o) => s + o.commission, 0);

    ok(res, {
      franchise:       { name: (franchise as any).name, commissionPercent },
      commissionPercent,
      totalRevenue,
      totalCommission,
      totalOrders:     orders.length,
      orders,
    });
  } catch (e) { next(e); }
}

// ── Delivery orders ───────────────────────────────────────────────────────────
export async function getMyDeliveryOrders(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const franchise = await getFranchiseForUser(req.userId!);
    if (!franchise) return fail(res, "No franchise linked", 404);

    const [awaitingPickup, atShop, readyForDelivery] = await Promise.all([
      Order.find({ assignedFranchise: franchise._id, status: { $in: ["assigned", "confirmed"] } })
        .populate("deliveryAgent", "name phone username").sort({ createdAt: -1 }).lean(),
      Order.find({ assignedFranchise: franchise._id, status: { $in: ["picked", "repairing"] } })
        .populate("deliveryAgent", "name phone username").sort({ createdAt: -1 }).lean(),
      Order.find({ assignedFranchise: franchise._id, status: "completed" })
        .populate("deliveryAgent", "name phone username").sort({ createdAt: -1 }).lean(),
    ]);

    ok(res, {
      awaitingPickup,
      atShop,
      readyForDelivery,
      counts: {
        awaitingPickup:   awaitingPickup.length,
        atShop:           atShop.length,
        readyForDelivery: readyForDelivery.length,
        total:            awaitingPickup.length + atShop.length + readyForDelivery.length,
      },
    });
  } catch (e) { next(e); }
}

// ── Reject repair ─────────────────────────────────────────────────────────────
export async function rejectRepair(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const franchise = await getFranchiseForUser(req.userId!);
    if (!franchise) return fail(res, "No franchise linked", 404);

    const { reason } = req.body;
    if (!reason?.trim()) return fail(res, "Rejection reason is required");

    const order = await Order.findOne({ _id: req.params.id, assignedFranchise: franchise._id });
    if (!order) return fail(res, "Order not found", 404);
    if (!["repairing", "picked"].includes(order.status))
      return fail(res, "Order must be in repairing or picked state to reject repair");

    order.status       = "cancelled";
    order.cancelReason = `Repair rejected: ${reason.trim()}`;
    order.timeline.push({ status: "cancelled", by: "franchise", time: new Date(), note: `Cannot fix: ${reason.trim()}` });
    await order.save();

    await sendSms(
      order.customer.phone,
      `Dear ${order.customer.name}, we regret to inform you that your ${order.deviceDetails?.brand} ${order.deviceDetails?.model} repair (Order: ${order.orderNumber}) could not be completed. Reason: ${reason.trim()}. Our team will contact you shortly. - E-RepairHub`
    );

    ok(res, order, "Repair rejected and customer notified");
  } catch (e) { next(e); }
}

// ── Request extra service ─────────────────────────────────────────────────────
export async function requestExtraService(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const franchise = await getFranchiseForUser(req.userId!);
    if (!franchise) return fail(res, "No franchise linked", 404);

    const { name, price, reason } = req.body;
    if (!name?.trim())        return fail(res, "Service name is required");
    if (!price || price <= 0) return fail(res, "Valid price is required");
    if (!reason?.trim())      return fail(res, "Reason is required");

    const order = await Order.findOne({ _id: req.params.id, assignedFranchise: franchise._id });
    if (!order) return fail(res, "Order not found", 404);
    if (order.status !== "repairing") return fail(res, "Order must be in repairing state");

    const hasPending = (order as any).extraServices?.some((s: any) => s.status === "pending");
    if (hasPending) return fail(res, "There is already a pending extra service awaiting customer approval");

    (order as any).extraServices = (order as any).extraServices || [];
    (order as any).extraServices.push({
      name:        name.trim(),
      price:       Number(price),
      reason:      reason.trim(),
      status:      "pending",
      requestedAt: new Date(),
    });

    order.timeline.push({
      status: "extra_service_requested",
      by:     "franchise",
      time:   new Date(),
      note:   `Extra service requested: ${name.trim()} — ₹${price}. Reason: ${reason.trim()}`,
    });

    await order.save();

    await sendSms(
      order.customer.phone,
      `E-RepairHub: Additional service needed for your ${order.deviceDetails?.brand} ${order.deviceDetails?.model} (${order.orderNumber}). Service: ${name.trim()}, Cost: ₹${price}. Reason: ${reason.trim()}. Approve/reject at: http://localhost:5176/track?orderNumber=${order.orderNumber}`
    );

    ok(res, order, "Extra service requested — customer notified via SMS");
  } catch (e) { next(e); }
}