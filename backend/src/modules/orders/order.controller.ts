import type { Request, Response, NextFunction } from "express";
import * as orderService from "./order.service.js";

const ok = (res: Response, data: unknown, message = "Success") =>
  res.json({ success: true, data, message });

const fail = (res: Response, message: string, status = 400) =>
  res.status(status).json({ success: false, message });

export async function getOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, search, page, limit } = req.query;
    const data = await orderService.getOrders({
      status: status as string,
      search: search as string,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
    ok(res, data);
  } catch (e) { next(e); }
}

export async function getOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await orderService.getOrderById(req.params.id);
    ok(res, data);
  } catch (e) { next(e); }
}

export async function createOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const { customer, deviceDetails, serviceType, price, paymentStatus } = req.body;
    if (!customer?.name || !customer?.phone || !customer?.address) {
      return fail(res, "customer name, phone and address are required");
    }
    if (!deviceDetails?.brand || !deviceDetails?.model || !deviceDetails?.issue) {
      return fail(res, "device brand, model and issue are required");
    }
    if (!serviceType || price == null) {
      return fail(res, "serviceType and price are required");
    }
    const data = await orderService.createOrder(
      { customer, deviceDetails, serviceType, price, paymentStatus },
      (req as any).user?.username ?? "admin"
    );
    res.status(201).json({ success: true, data, message: "Order created" });
  } catch (e) { next(e); }
}

export async function assignOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const { franchiseId, agentId } = req.body;
    if (!franchiseId && !agentId) {
      return fail(res, "franchiseId or agentId is required");
    }
    const data = await orderService.assignOrder(
      req.params.id,
      { franchiseId, agentId },
      (req as any).user?.username ?? "admin"
    );
    ok(res, data, "Order assigned");
  } catch (e) { next(e); }
}

export async function updateOrderStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, note } = req.body;
    if (!status) return fail(res, "status is required");
    if (!orderService.isValidStatus(status)) return fail(res, "Invalid status value");
    const data = await orderService.updateOrderStatus(req.params.id, {
      status,
      note,
      by: (req as any).user?.username ?? "admin",
    });
    ok(res, data, "Status updated");
  } catch (e) { next(e); }
}

export async function cancelOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const { reason } = req.body;
    if (!reason?.trim()) return fail(res, "Cancellation reason is required");
    const data = await orderService.cancelOrder(
      req.params.id,
      reason,
      (req as any).user?.username ?? "admin"
    );
    ok(res, data, "Order cancelled");
  } catch (e) { next(e); }
}

export async function getDashboardStats(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await orderService.getDashboardStats();
    ok(res, data);
  } catch (e) { next(e); }
}