import type { Request, Response, NextFunction } from "express";
import * as deliveryService from "./delivery.service.js";

const ok = (res: Response, data: unknown, message = "Success") =>
  res.json({ success: true, data, message });

const fail = (res: Response, message: string, status = 400) =>
  res.status(status).json({ success: false, message });

export async function getAgents(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await deliveryService.getAgents({ search: req.query.search as string });
    ok(res, data);
  } catch (e) { next(e); }
}

export async function getAgent(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await deliveryService.getAgentById(req.params.id);
    ok(res, data);
  } catch (e) { next(e); }
}

export async function patchAgentStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== "boolean") return fail(res, "isActive must be boolean");
    const data = await deliveryService.toggleAgentStatus(req.params.id, isActive);
    ok(res, data, `Agent ${isActive ? "activated" : "deactivated"}`);
  } catch (e) { next(e); }
}

export async function getAllTasks(req: Request, res: Response, next: NextFunction) {
  try {
    const { agentId, status, taskType, page, limit } = req.query;
    const data = await deliveryService.getAllTasks({
      agentId: agentId as string,
      status: status as string,
      taskType: taskType as string,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 50,
    });
    ok(res, data);
  } catch (e) { next(e); }
}

export async function getAgentTasks(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await deliveryService.getAgentTasks(req.params.id, req.query.status as string);
    ok(res, data);
  } catch (e) { next(e); }
}

export async function createTask(req: Request, res: Response, next: NextFunction) {
  try {
    const { orderId, agentId, taskType, scheduledTime } = req.body;
    if (!orderId || !agentId || !taskType) return fail(res, "orderId, agentId and taskType are required");
    if (!["pickup", "delivery"].includes(taskType)) return fail(res, "taskType must be pickup or delivery");
    const data = await deliveryService.createTask({ orderId, agentId, taskType, scheduledTime });
    res.status(201).json({ success: true, data, message: "Task created and agent assigned" });
  } catch (e) { next(e); }
}

export async function updateTaskStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, failReason, otp } = req.body;
    if (!status) return fail(res, "status is required");
    const data = await deliveryService.updateTaskStatus(req.params.id, { status, failReason, otp });
    ok(res, data, "Task status updated");
  } catch (e) { next(e); }
}

export async function getDeliveryStats(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await deliveryService.getDeliveryStats();
    ok(res, data);
  } catch (e) { next(e); }
}

export async function getOrdersForDelivery(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await deliveryService.getOrdersForDelivery();
    ok(res, data);
  } catch (e) { next(e); }
}