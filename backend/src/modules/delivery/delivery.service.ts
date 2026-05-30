import mongoose from "mongoose";
import { DeliveryTask } from "./deliveryTask.model.js";
import { Order } from "../orders/order.model.js";
import type { CreateTaskDto, UpdateTaskStatusDto, AgentFilters, TaskFilters } from "./delivery.types.js";

async function getUserModel() {
  return mongoose.model("User");
}

// ── AGENTS ────────────────────────────────────────────────────────────────────

export async function getAgents(filters: AgentFilters = {}) {
  const User = await getUserModel();
  const query: Record<string, unknown> = { role: "delivery" };
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: "i" } },
      { username: { $regex: filters.search, $options: "i" } },
      { email: { $regex: filters.search, $options: "i" } },
    ];
  }
  const agents = await User.find(query)
    .select("_id name username email phone isActive")
    .lean();

  const agentsWithStats = await Promise.all(
    agents.map(async (agent) => {
      const [activeTasks, completedTasks, totalTasks] = await Promise.all([
        DeliveryTask.countDocuments({ agent: agent._id, status: { $in: ["pending", "accepted", "in_progress"] } }),
        DeliveryTask.countDocuments({ agent: agent._id, status: "completed" }),
        DeliveryTask.countDocuments({ agent: agent._id }),
      ]);
      return { ...agent, activeTasks, completedTasks, totalTasks };
    })
  );
  return agentsWithStats;
}

export async function getAgentById(id: string) {
  const User = await getUserModel();
  const agent = await User.findOne({ _id: id, role: "delivery" })
    .select("_id name username email phone isActive")
    .lean();
  if (!agent) throw new Error("Agent not found");
  return agent;
}

export async function toggleAgentStatus(id: string, isActive: boolean) {
  const User = await getUserModel();
  const agent = await User.findOneAndUpdate(
    { _id: id, role: "delivery" },
    { isActive },
    { new: true }
  ).select("_id name username email isActive").lean();
  if (!agent) throw new Error("Agent not found");
  return agent;
}

// ── TASKS ─────────────────────────────────────────────────────────────────────

export async function getAllTasks(filters: TaskFilters = {}) {
  const query: Record<string, unknown> = {};
  if (filters.agentId) query.agent = new mongoose.Types.ObjectId(filters.agentId);
  if (filters.status && filters.status !== "all") query.status = filters.status;
  if (filters.taskType && filters.taskType !== "all") query.taskType = filters.taskType;

  const page = filters.page ?? 1;
  const limit = filters.limit ?? 50;
  const skip = (page - 1) * limit;

  const [tasks, total] = await Promise.all([
    DeliveryTask.find(query)
      .populate("order", "orderNumber customer deviceDetails serviceType status price assignedFranchise")
      .populate("agent", "name username phone email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    DeliveryTask.countDocuments(query),
  ]);

  return { tasks, total, page, limit };
}

export async function getAgentTasks(agentId: string, status?: string) {
  const query: Record<string, unknown> = { agent: agentId };
  if (status && status !== "all") query.status = status;
  return DeliveryTask.find(query)
    .populate("order", "orderNumber customer deviceDetails serviceType status price assignedFranchise")
    .sort({ createdAt: -1 })
    .lean();
}

export async function createTask(dto: CreateTaskDto) {
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  // Update order's deliveryAgent and add timeline entry
  await Order.findByIdAndUpdate(dto.orderId, {
    deliveryAgent: new mongoose.Types.ObjectId(dto.agentId),
    $push: {
      timeline: {
        status: `task_created_${dto.taskType}`,
        by: "admin",
        time: new Date(),
        note: `Delivery task created: ${dto.taskType}`,
      },
    },
  });

  const task = await DeliveryTask.create({
    order: dto.orderId,
    agent: dto.agentId,
    taskType: dto.taskType,
    otp,
    scheduledTime: dto.scheduledTime ? new Date(dto.scheduledTime) : undefined,
  });

  return DeliveryTask.findById(task._id)
    .populate("order", "orderNumber customer deviceDetails serviceType status price")
    .populate("agent", "name username phone email")
    .lean();
}

export async function updateTaskStatus(id: string, dto: UpdateTaskStatusDto) {
  const task = await DeliveryTask.findById(id)
    .populate("order")
    .lean();
  if (!task) throw new Error("Task not found");

  const order = task.order as any;
  const customerPhone = order?.customer?.phone;

  // When agent starts task (in_progress) → send OTP to customer via Twilio
  if (dto.status === "in_progress" && customerPhone) {
    try {
      const { sendOtp } = await import("../auth/otp.service.js");
      await sendOtp(customerPhone);
      console.log(`[delivery] OTP sent to customer ${customerPhone} for task ${id}`);
    } catch (e: any) {
      console.warn(`[delivery] Could not send OTP to customer: ${e.message}`);
    }
  }

  // When completing → verify OTP against customer phone
  if (dto.status === "completed" && dto.otp && customerPhone) {
    const { verifyOtp } = await import("../auth/otp.service.js");
    const result = await verifyOtp(customerPhone, dto.otp);
    if (!result.valid) throw new Error(result.message);
  }

  const update: Record<string, unknown> = {
    status: dto.status,
    ...(dto.failReason ? { failReason: dto.failReason } : {}),
    ...(dto.status === "completed" ? { completedAt: new Date(), otpVerified: true } : {}),
  };

  const updated = await DeliveryTask.findByIdAndUpdate(id, update, { new: true })
    .populate("order", "orderNumber customer deviceDetails status")
    .populate("agent", "name username phone")
    .lean();

  const orderId = (task.order as any)?._id ?? task.order;

  // Pickup in_progress → order status = picked
  if (dto.status === "in_progress" && (task as any).taskType === "pickup") {
    const ord = await Order.findById(orderId);
    if (ord && ["assigned", "confirmed"].includes(ord.status)) {
      ord.status = "picked";
      ord.timeline.push({ status: "picked", by: "delivery_agent", time: new Date() });
      await ord.save();
    }
  }

  // Pickup completed → order status = repairing
  if (dto.status === "completed" && (task as any).taskType === "pickup") {
    await Order.findByIdAndUpdate(orderId, {
      status: "repairing",
      $push: { timeline: { status: "repairing", by: "delivery_agent", time: new Date(), note: "Device picked up, sent for repair" } },
    });
  }

  // Delivery completed → order status = delivered
  if (dto.status === "completed" && (task as any).taskType === "delivery") {
    await Order.findByIdAndUpdate(orderId, {
      status: "delivered",
      $push: { timeline: { status: "delivered", by: "delivery_agent", time: new Date() } },
    });
  }

  return updated;
}

export async function getDeliveryStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const User = await getUserModel();

  const [
    totalAgents, activeAgents, totalTasks, pendingTasks,
    inProgressTasks, completedToday, completedAll, failedTasks,
    pickupTasks, deliveryTasks,
  ] = await Promise.all([
    User.countDocuments({ role: "delivery" }),
    User.countDocuments({ role: "delivery", isActive: true }),
    DeliveryTask.countDocuments(),
    DeliveryTask.countDocuments({ status: "pending" }),
    DeliveryTask.countDocuments({ status: { $in: ["accepted", "in_progress"] } }),
    DeliveryTask.countDocuments({ status: "completed", completedAt: { $gte: today } }),
    DeliveryTask.countDocuments({ status: "completed" }),
    DeliveryTask.countDocuments({ status: "failed" }),
    DeliveryTask.countDocuments({ taskType: "pickup" }),
    DeliveryTask.countDocuments({ taskType: "delivery" }),
  ]);

  return {
    totalAgents, activeAgents, totalTasks, pendingTasks,
    inProgressTasks, completedToday, completedAll, failedTasks,
    pickupTasks, deliveryTasks,
  };
}

export async function getOrdersForDelivery() {
  return Order.find({
    status: { $in: ["assigned", "confirmed", "completed"] },
  })
    .select("orderNumber customer deviceDetails serviceType status assignedFranchise deliveryAgent price createdAt")
    .populate("assignedFranchise", "name location")
    .populate("deliveryAgent", "name username")
    .sort({ createdAt: -1 })
    .lean();
}