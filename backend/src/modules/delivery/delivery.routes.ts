import { Router, type Request, type Response, type NextFunction } from "express";
import {
  getAgents, getAgent, getAgentTasks, createTask,
  getAllTasks, updateTaskStatus, patchAgentStatus,
  getDeliveryStats, getOrdersForDelivery,
} from "./delivery.controller.js";
import { verifyToken, requireRoles } from "../auth/auth.middleware.js";
import { User } from "../users/user.model.js";
import { DeliveryTask } from "./deliveryTask.model.js";
import { geocodeAddress, haversineKm } from "../../shared/utils/geocode.js";

export const deliveryRouter = Router();
deliveryRouter.use(verifyToken);

deliveryRouter.get("/stats",            requireRoles("admin"), getDeliveryStats);
deliveryRouter.get("/available-orders", requireRoles("admin"), getOrdersForDelivery);

// ── Nearby agents sorted by distance ─────────────────────────────────────────
deliveryRouter.get("/nearby-agents", requireRoles("admin"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lat, lng, maxKm, address } = req.query;

    let latitude: number | null  = lat ? Number(lat)  : null;
    let longitude: number | null = lng ? Number(lng)  : null;

    if (address && (!latitude || !longitude)) {
      const geo = await geocodeAddress(String(address));
      if (geo) { latitude = geo.lat; longitude = geo.lng; }
    }

    if (!latitude || !longitude) {
      res.status(400).json({ success: false, message: "lat/lng or address required" });
      return;
    }

    const km = maxKm ? Number(maxKm) : 50;

    // Get all active delivery agents
    const agents = await User.find({ role: "delivery", isActive: true })
      .select("_id name phone email address city coordinates formattedAddress")
      .lean();

    // Get active task counts per agent
    const activeTasks = await DeliveryTask.aggregate([
      { $match: { status: { $in: ["pending", "accepted", "in_progress"] } } },
      { $group: { _id: "$agent", activeCount: { $sum: 1 } } },
    ]);
    const activeMap = new Map(activeTasks.map(t => [String(t._id), t.activeCount]));

    // Compute distance
    const withDistance = agents.map(agent => {
      let distKm: number | null = null;
      if (agent.coordinates?.coordinates?.length === 2) {
        const [aLng, aLat] = agent.coordinates.coordinates;
        distKm = haversineKm(latitude!, longitude!, aLat, aLng);
      }
      return {
        ...agent,
        distKm,
        activeTaskCount: activeMap.get(String(agent._id)) ?? 0,
        available: (activeMap.get(String(agent._id)) ?? 0) < 3,
      };
    });

    // Filter by radius, sort by distance
    const result = withDistance
      .filter(a => a.distKm === null || a.distKm <= km)
      .sort((a, b) => {
        if (a.distKm === null && b.distKm === null) return 0;
        if (a.distKm === null) return 1;
        if (b.distKm === null) return -1;
        return a.distKm - b.distKm;
      });

    res.json({ success: true, data: result });
  } catch (e) { next(e); }
});

// ── Geocode agent address ─────────────────────────────────────────────────────
deliveryRouter.post("/agents/:id/geocode", requireRoles("admin"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agent = await User.findById(req.params.id).lean();
    if (!agent) { res.status(404).json({ success: false, message: "Agent not found" }); return; }

    const addressStr = [agent.address, agent.city, agent.state, agent.pincode].filter(Boolean).join(", ");
    if (!addressStr) { res.status(422).json({ success: false, message: "Agent has no address" }); return; }

    const geo = await geocodeAddress(addressStr);
    if (!geo) { res.status(422).json({ success: false, message: "Could not geocode agent address" }); return; }

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { coordinates: { type: "Point", coordinates: [geo.lng, geo.lat] }, formattedAddress: geo.formatted },
      { new: true }
    ).select("-password").lean();

    res.json({ success: true, data: updated, message: "Agent geocoded" });
  } catch (e) { next(e); }
});

deliveryRouter.get("/agents",              getAgents);
deliveryRouter.get("/agents/:id",          getAgent);
deliveryRouter.get("/agents/:id/tasks",    getAgentTasks);
deliveryRouter.patch("/agents/:id/status", requireRoles("admin"), patchAgentStatus);
deliveryRouter.get("/tasks",               requireRoles("admin"), getAllTasks);
deliveryRouter.post("/tasks",              requireRoles("admin"), createTask);
// GET single task by ID
deliveryRouter.get("/tasks/:id", async (req, res, next) => {
  try {
    const task = await DeliveryTask.findById(req.params.id)
      .populate("order", "orderNumber customer deviceDetails serviceType status price")
      .populate("agent", "name phone")
      .lean();
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });
    res.json({ success: true, data: task });
  } catch(e) { next(e); }
});
deliveryRouter.patch("/tasks/:id/status",  updateTaskStatus);