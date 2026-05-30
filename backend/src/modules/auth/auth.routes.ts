import { Router, type Request, type Response, type NextFunction } from "express";
import { login, me } from "./auth.controller.js";
import { verifyToken } from "./auth.middleware.js";
import { sendOtp, verifyOtp } from "./otp.service.js";

export const authRouter = Router();

authRouter.post("/login", login);
authRouter.get("/me", verifyToken, me);

// ── OTP — send ────────────────────────────────────────────────────────────────
authRouter.post("/send-otp", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone } = req.body;
    if (!phone?.trim()) {
      res.status(400).json({ success: false, message: "Phone number is required" });
      return;
    }
    const result = await sendOtp(phone.trim());
    res.json({ success: true, ...result });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// ── OTP — verify ──────────────────────────────────────────────────────────────
authRouter.post("/verify-otp", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone, otp } = req.body;
    if (!phone?.trim() || !otp?.trim()) {
      res.status(400).json({ success: false, message: "Phone and OTP are required" });
      return;
    }
    const result = await verifyOtp(phone.trim(), otp.trim());
    if (!result.valid) {
      res.status(400).json({ success: false, message: result.message });
      return;
    }
    res.json({ success: true, message: result.message });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
});