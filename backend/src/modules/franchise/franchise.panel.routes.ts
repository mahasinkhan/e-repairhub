import { Router } from "express";
import { verifyToken, requireRoles } from "../auth/auth.middleware.js";
import {
  getMyProfile,
  getMyStats,
  getMyOrders,
  getMyOrderById,
  getMyEarnings,
  acceptOrder,
  rejectOrder,
  markReceived,
  startRepair,
  completeRepair,
  getMyDeliveryOrders,
  rejectRepair,
  requestExtraService,
} from "./franchise.panel.controller.js";

export const franchisePanelRouter = Router();

franchisePanelRouter.use(verifyToken, requireRoles("franchise", "admin"));

franchisePanelRouter.get("/profile",         getMyProfile);
franchisePanelRouter.get("/stats",           getMyStats);
franchisePanelRouter.get("/orders",          getMyOrders);
franchisePanelRouter.get("/orders/:id",      getMyOrderById);
franchisePanelRouter.get("/earnings",        getMyEarnings);
franchisePanelRouter.get("/delivery-orders", getMyDeliveryOrders);

franchisePanelRouter.patch("/orders/:id/accept",        acceptOrder);
franchisePanelRouter.patch("/orders/:id/reject",        rejectOrder);
franchisePanelRouter.patch("/orders/:id/received",      markReceived);
franchisePanelRouter.patch("/orders/:id/start-repair",  startRepair);
franchisePanelRouter.patch("/orders/:id/complete",      completeRepair);
franchisePanelRouter.patch("/orders/:id/reject-repair", rejectRepair);
franchisePanelRouter.post("/orders/:id/extra-service",  requestExtraService);