import { Router } from "express";
import { requireRoles, verifyToken } from "../auth/auth.middleware.js";
import {
  createUserCtrl,
  deleteUserCtrl,
  getUserCtrl,
  listUsersCtrl,
  patchStatusCtrl,
  updateUserCtrl,
} from "./user.controller.js";

export const userRouter = Router();

userRouter.use(verifyToken, requireRoles("admin"));

userRouter.get("/", listUsersCtrl);
userRouter.post("/", createUserCtrl);
userRouter.patch("/:id/status", patchStatusCtrl);
userRouter.get("/:id", getUserCtrl);
userRouter.put("/:id", updateUserCtrl);
userRouter.delete("/:id", deleteUserCtrl);
