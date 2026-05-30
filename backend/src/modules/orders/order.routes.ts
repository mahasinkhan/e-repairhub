import { Router, type Request, type Response, type NextFunction } from "express";
import { verifyToken, requireRoles } from "../auth/auth.middleware.js";
import { Order } from "./order.model.js";
import {
  getOrders, getOrder, createOrder, assignOrder,
  updateOrderStatus, cancelOrder, getDashboardStats,
} from "./order.controller.js";
import { geocodeAddress } from "../../shared/utils/geocode.js";

export const orderRouter = Router();

// ── PUBLIC — track order ──────────────────────────────────────────────────────
orderRouter.get("/track", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderNumber, phone } = req.query;
    if (!orderNumber) {
      res.status(400).json({ success: false, message: "orderNumber is required" });
      return;
    }
    const query: Record<string, unknown> = {
      orderNumber: String(orderNumber).toUpperCase().trim(),
    };
    if (phone) query["customer.phone"] = String(phone).trim();

    const order = await Order.findOne(query)
      .populate("assignedFranchise", "name location contact formattedAddress")
      .populate("deliveryAgent", "name phone username")
      .lean();

    if (!order) {
      res.status(404).json({ success: false, message: "Order not found. Check your order number." });
      return;
    }
    res.json({ success: true, data: order });
  } catch (e) { next(e); }
});

// ── PUBLIC — customer book order ──────────────────────────────────────────────
orderRouter.post("/book", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { customer, deviceDetails, serviceType, price } = req.body;

    if (!customer?.name || !customer?.phone || !customer?.address) {
      res.status(400).json({ success: false, message: "Customer name, phone and address are required" });
      return;
    }
    if (!deviceDetails?.brand || !deviceDetails?.model || !deviceDetails?.issue) {
      res.status(400).json({ success: false, message: "Device brand, model and issue are required" });
      return;
    }
    if (!serviceType || !price) {
      res.status(400).json({ success: false, message: "serviceType and price are required" });
      return;
    }

    let geo = null;
    try { geo = await geocodeAddress(customer.address); } catch {}

    const orderData: any = {
      customer: {
        name:    customer.name,
        phone:   customer.phone,
        address: customer.address,
      },
      deviceDetails: {
        brand: deviceDetails.brand,
        model: deviceDetails.model,
        issue: deviceDetails.issue,
        ...(deviceDetails.color ? { color: deviceDetails.color } : {}),
      },
      serviceType,
      price:    Number(price),
      status:   "placed",
      timeline: [{ status: "placed", by: "customer", time: new Date() }],
    };

    if (geo?.lat && geo?.lng) {
      orderData.customer.formattedAddress = geo.formatted;
      orderData.customer.coordinates = {
        type:        "Point",
        coordinates: [geo.lng, geo.lat],
      };
    }

    const order = new Order(orderData);
    await order.save();
    res.status(201).json({ success: true, data: order, message: "Repair order placed successfully" });
  } catch (e: any) {
    console.error("[book] Error:", e?.message, e?.errors);
    next(e);
  }
});

// ── PUBLIC — customer responds to extra service request ───────────────────────
orderRouter.post("/:id/extra-service/:serviceId/respond", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { action, orderNumber } = req.body;
    if (!["approve", "reject"].includes(action)) {
      res.status(400).json({ success: false, message: "action must be approve or reject" }); return;
    }

    const order = await Order.findById(req.params.id);
    if (!order) { res.status(404).json({ success: false, message: "Order not found" }); return; }

    if (orderNumber && (order as any).orderNumber !== String(orderNumber).toUpperCase()) {
      res.status(403).json({ success: false, message: "Order number mismatch" }); return;
    }

    const service = (order as any).extraServices?.id(req.params.serviceId);
    if (!service) { res.status(404).json({ success: false, message: "Extra service not found" }); return; }
    if (service.status !== "pending") {
      res.status(400).json({ success: false, message: `Already ${service.status}` }); return;
    }

    const statusLabel   = action === "approve" ? "approved" : "rejected";
    service.status      = statusLabel;
    service.respondedAt = new Date();

    order.timeline.push({
      status: `extra_service_${statusLabel}`,
      by:     "customer",
      time:   new Date(),
      note:   `Customer ${statusLabel} extra service: ${service.name} — ₹${service.price}`,
    });

    if (action === "approve") {
      (order as any).price = (order as any).price + service.price;
      order.timeline.push({
        status: "price_updated",
        by:     "system",
        time:   new Date(),
        note:   `Order total updated to ₹${(order as any).price} (extra service approved)`,
      });
    }

    await order.save();
    res.json({ success: true, data: order, message: `Extra service ${statusLabel} successfully` });
  } catch (e) { next(e); }
});

// ── All below require auth ────────────────────────────────────────────────────
orderRouter.use(verifyToken);

orderRouter.get("/stats/dashboard", requireRoles("admin"), getDashboardStats);
orderRouter.get("/",                requireRoles("admin"), getOrders);
orderRouter.get("/:id",             requireRoles("admin"), getOrder);
orderRouter.post("/",               requireRoles("admin"), createOrder);
orderRouter.patch("/:id/assign",    requireRoles("admin"), assignOrder);
orderRouter.patch("/:id/status",    requireRoles("admin"), updateOrderStatus);
orderRouter.patch("/:id/cancel",    requireRoles("admin"), cancelOrder);

// ── Payment status update ─────────────────────────────────────────────────────
orderRouter.patch("/:id/payment", requireRoles("admin"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { paymentStatus } = req.body;
    if (!["pending", "paid", "failed"].includes(paymentStatus)) {
      res.status(400).json({ success: false, message: "paymentStatus must be pending, paid or failed" });
      return;
    }
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true }
    ).lean();
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }
    res.json({ success: true, data: order, message: "Payment status updated" });
  } catch (e) { next(e); }
});