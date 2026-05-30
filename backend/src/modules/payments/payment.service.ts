import crypto from "crypto";
import mongoose from "mongoose";
import { Payment } from "./payment.model.js";
import { Order } from "../orders/order.model.js";

// ── Razorpay instance (async ESM import) ──────────────────────────────────────
async function getRazorpay() {
  const keyId     = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new Error("Razorpay keys not configured in .env");
  const { default: Razorpay } = await import("razorpay");
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

// ── Create Razorpay order ─────────────────────────────────────────────────────
export async function createRazorpayOrder(orderId: string) {
  const order = await Order.findById(orderId).lean();
  if (!order) throw new Error("Order not found");
  if (order.paymentStatus === "paid") throw new Error("Order is already paid");

  const razorpay = await getRazorpay();

  const rzpOrder = await razorpay.orders.create({
    amount: Math.round(order.price * 100),
    currency: "INR",
    receipt: order.orderNumber,
    notes: {
      orderId,
      orderNumber: order.orderNumber,
      customerName: order.customer.name,
      customerPhone: order.customer.phone,
    },
  });

  const payment = await Payment.create({
    order: new mongoose.Types.ObjectId(orderId),
    amount: order.price,
    currency: "INR",
    method: "razorpay",
    status: "pending",
    razorpayOrderId: rzpOrder.id,
  });

  return {
    payment,
    razorpayOrder: rzpOrder,
    keyId: process.env.RAZORPAY_KEY_ID,
    order,
  };
}

// ── Verify Razorpay payment ───────────────────────────────────────────────────
export async function verifyRazorpayPayment(dto: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) throw new Error("Razorpay secret not configured");

  const body        = `${dto.razorpayOrderId}|${dto.razorpayPaymentId}`;
  const expectedSig = crypto.createHmac("sha256", keySecret).update(body).digest("hex");

  if (expectedSig !== dto.razorpaySignature) {
    throw new Error("Payment signature verification failed");
  }

  const payment = await Payment.findOneAndUpdate(
    { razorpayOrderId: dto.razorpayOrderId },
    {
      razorpayPaymentId: dto.razorpayPaymentId,
      razorpaySignature: dto.razorpaySignature,
      status: "paid",
      paidAt: new Date(),
    },
    { new: true }
  ).populate("order");

  if (!payment) throw new Error("Payment record not found");

  await Order.findByIdAndUpdate((payment.order as any)._id ?? payment.order, {
    paymentStatus: "paid",
    $push: { timeline: { status: "payment_received", by: "razorpay", time: new Date() } },
  });

  return payment;
}

// ── Mark as paid manually ─────────────────────────────────────────────────────
export async function markAsPaid(orderId: string, note?: string) {
  const order = await Order.findById(orderId).lean();
  if (!order) throw new Error("Order not found");

  const existing = await Payment.findOne({ order: orderId, status: "paid" });
  if (existing) throw new Error("Payment already recorded as paid");

  const payment = await Payment.create({
    order:    new mongoose.Types.ObjectId(orderId),
    amount:   order.price,
    currency: "INR",
    method:   "manual",
    status:   "paid",
    note:     note || "Marked as paid by admin",
    paidAt:   new Date(),
  });

  await Order.findByIdAndUpdate(orderId, {
    paymentStatus: "paid",
    $push: { timeline: { status: "payment_received", by: "admin", time: new Date(), note: "Manual payment" } },
  });

  return payment;
}

// ── Mark as cash paid ─────────────────────────────────────────────────────────
export async function markAsCash(orderId: string, note?: string) {
  const order = await Order.findById(orderId).lean();
  if (!order) throw new Error("Order not found");

  const existing = await Payment.findOne({ order: orderId, status: "paid" });
  if (existing) throw new Error("Payment already recorded");

  const payment = await Payment.create({
    order:    new mongoose.Types.ObjectId(orderId),
    amount:   order.price,
    currency: "INR",
    method:   "cash",
    status:   "paid",
    note:     note || "Cash payment collected",
    paidAt:   new Date(),
  });

  await Order.findByIdAndUpdate(orderId, {
    paymentStatus: "paid",
    $push: { timeline: { status: "payment_received", by: "admin", time: new Date(), note: "Cash payment" } },
  });

  return payment;
}

// ── Get all payments ──────────────────────────────────────────────────────────
export async function getPayments(filters: {
  status?: string;
  method?: string;
  page?: number;
  limit?: number;
  search?: string;
}) {
  const query: Record<string, unknown> = {};
  if (filters.status && filters.status !== "all") query.status = filters.status;
  if (filters.method && filters.method !== "all") query.method = filters.method;

  const page  = filters.page  ?? 1;
  const limit = filters.limit ?? 20;
  const skip  = (page - 1) * limit;

  const [payments, total] = await Promise.all([
    Payment.find(query)
      .populate({ path: "order", select: "orderNumber customer deviceDetails serviceType status price" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Payment.countDocuments(query),
  ]);

  let filtered = payments;
  if (filters.search?.trim()) {
    const q = filters.search.toLowerCase();
    filtered = payments.filter((p: any) =>
      p.order?.orderNumber?.toLowerCase().includes(q) ||
      p.order?.customer?.name?.toLowerCase().includes(q) ||
      p.order?.customer?.phone?.includes(q) ||
      p.razorpayPaymentId?.toLowerCase().includes(q)
    );
  }

  return { payments: filtered, total, page, limit };
}

// ── Payment stats ─────────────────────────────────────────────────────────────
export async function getPaymentStats() {
  const [
    totalPaid, totalPending, totalFailed, totalRefunded,
    revenueResult, pendingRevenueResult, methodBreakdown, recentPayments,
  ] = await Promise.all([
    Payment.countDocuments({ status: "paid" }),
    Payment.countDocuments({ status: "pending" }),
    Payment.countDocuments({ status: "failed" }),
    Payment.countDocuments({ status: "refunded" }),
    Payment.aggregate([{ $match: { status: "paid" } },    { $group: { _id: null, total: { $sum: "$amount" } } }]),
    Payment.aggregate([{ $match: { status: "pending" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
    Payment.aggregate([{ $group: { _id: "$method", count: { $sum: 1 }, amount: { $sum: "$amount" } } }]),
    Payment.find({ status: "paid" })
      .populate("order", "orderNumber customer deviceDetails price")
      .sort({ paidAt: -1 })
      .limit(5)
      .lean(),
  ]);

  return {
    totalPaid, totalPending, totalFailed, totalRefunded,
    totalRevenue:   revenueResult[0]?.total    ?? 0,
    pendingRevenue: pendingRevenueResult[0]?.total ?? 0,
    methodBreakdown,
    recentPayments,
  };
}

// ── Get payments for one order ────────────────────────────────────────────────
export async function getPaymentByOrder(orderId: string) {
  return Payment.find({ order: orderId }).sort({ createdAt: -1 }).lean();
}

// ── Refund ────────────────────────────────────────────────────────────────────
export async function refundPayment(paymentId: string, note?: string) {
  const payment = await Payment.findById(paymentId);
  if (!payment) throw new Error("Payment not found");
  if (payment.status !== "paid") throw new Error("Only paid payments can be refunded");

  payment.status = "refunded";
  payment.note   = note || "Refunded by admin";
  await payment.save();

  await Order.findByIdAndUpdate(payment.order, {
    paymentStatus: "failed",
    $push: { timeline: { status: "payment_refunded", by: "admin", time: new Date(), note } },
  });

  return payment;
}