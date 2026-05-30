import { Router, type Request, type Response, type NextFunction } from "express";
import { verifyToken, requireRoles } from "../auth/auth.middleware.js";
import * as paymentService from "./payment.service.js";

export const paymentRouter = Router();

const ok   = (res: Response, data: unknown, message = "Success") =>
  res.json({ success: true, data, message });
const fail = (res: Response, message: string, status = 400) =>
  res.status(status).json({ success: false, message });

// ── PUBLIC — customer-facing Razorpay endpoints ───────────────────────────────

// Create Razorpay order using orderNumber (no auth needed)
paymentRouter.post("/customer/create-order", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderNumber } = req.body;
    if (!orderNumber) { fail(res, "orderNumber is required"); return; }

    const { Order } = await import("../orders/order.model.js");
    const order = await Order.findOne({
      orderNumber: String(orderNumber).toUpperCase().trim(),
    }).lean();

    if (!order) { fail(res, "Order not found", 404); return; }
    if ((order as any).paymentStatus === "paid") { fail(res, "Order is already paid"); return; }

    const data = await paymentService.createRazorpayOrder(String((order as any)._id));
    res.status(201).json({ success: true, data, message: "Razorpay order created" });
  } catch (e) { next(e); }
});

// Verify Razorpay payment from customer (no auth needed)
paymentRouter.post("/customer/verify", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      fail(res, "razorpayOrderId, razorpayPaymentId and razorpaySignature are required"); return;
    }
    const data = await paymentService.verifyRazorpayPayment({
      razorpayOrderId, razorpayPaymentId, razorpaySignature,
    });
    ok(res, data, "Payment verified successfully");
  } catch (e) { next(e); }
});

// ── All below require admin ───────────────────────────────────────────────────
paymentRouter.use(verifyToken, requireRoles("admin"));

// ── Stats ─────────────────────────────────────────────────────────────────────
paymentRouter.get("/stats", async (req: Request, res: Response, next: NextFunction) => {
  try { ok(res, await paymentService.getPaymentStats()); }
  catch (e) { next(e); }
});

// ── List all payments ─────────────────────────────────────────────────────────
paymentRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, method, page, limit, search } = req.query;
    const data = await paymentService.getPayments({
      status: status as string,
      method: method as string,
      search: search as string,
      page:   page  ? Number(page)  : 1,
      limit:  limit ? Number(limit) : 20,
    });
    ok(res, data);
  } catch (e) { next(e); }
});

// ── Get payments for specific order ──────────────────────────────────────────
paymentRouter.get("/order/:orderId", async (req: Request, res: Response, next: NextFunction) => {
  try { ok(res, await paymentService.getPaymentByOrder(req.params.orderId)); }
  catch (e) { next(e); }
});

// ── Create Razorpay order (admin) ─────────────────────────────────────────────
paymentRouter.post("/create-order", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.body;
    if (!orderId) { fail(res, "orderId is required"); return; }
    const data = await paymentService.createRazorpayOrder(orderId);
    res.status(201).json({ success: true, data, message: "Razorpay order created" });
  } catch (e) { next(e); }
});

// ── Verify Razorpay payment (admin) ──────────────────────────────────────────
paymentRouter.post("/verify", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      fail(res, "razorpayOrderId, razorpayPaymentId and razorpaySignature are required"); return;
    }
    const data = await paymentService.verifyRazorpayPayment({
      razorpayOrderId, razorpayPaymentId, razorpaySignature,
    });
    ok(res, data, "Payment verified and recorded");
  } catch (e) { next(e); }
});

// ── Mark as paid manually ─────────────────────────────────────────────────────
paymentRouter.post("/mark-paid", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId, note } = req.body;
    if (!orderId) { fail(res, "orderId is required"); return; }
    const data = await paymentService.markAsPaid(orderId, note);
    ok(res, data, "Payment marked as paid");
  } catch (e) { next(e); }
});

// ── Mark as cash ──────────────────────────────────────────────────────────────
paymentRouter.post("/mark-cash", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId, note } = req.body;
    if (!orderId) { fail(res, "orderId is required"); return; }
    const data = await paymentService.markAsCash(orderId, note);
    ok(res, data, "Cash payment recorded");
  } catch (e) { next(e); }
});

// ── Refund ────────────────────────────────────────────────────────────────────
paymentRouter.post("/refund/:paymentId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { note } = req.body;
    const data = await paymentService.refundPayment(req.params.paymentId, note);
    ok(res, data, "Payment refunded");
  } catch (e) { next(e); }
});