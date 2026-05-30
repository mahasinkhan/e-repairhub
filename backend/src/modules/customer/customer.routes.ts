import { Router } from "express";
import { sendOtp, verifyOtp, getMyOrders, updateProfile, customerAuth } from "./customer.controller.js";

export const customerRouter = Router();

customerRouter.post("/send-otp",   sendOtp);
customerRouter.post("/verify-otp", verifyOtp);
customerRouter.get("/orders",      customerAuth, getMyOrders);
customerRouter.patch("/profile",   customerAuth, updateProfile);