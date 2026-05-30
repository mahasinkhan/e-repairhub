import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Order } from "../orders/order.model.js";
import { sendOtp as twilioSendOtp, verifyOtp as twilioVerifyOtp } from "../auth/otp.service.js";

const JWT_SECRET  = process.env.JWT_SECRET || "erepairhub-jwt-secret-2024";
const JWT_EXPIRES = "30d";

export interface CustomerRequest extends Request {
  customerPhone?: string;
  customerName?:  string;
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10)                                return `+91${digits}`;
  if (digits.length === 11 && digits.startsWith("0"))      return `+91${digits.slice(1)}`;
  if (digits.length === 12 && digits.startsWith("91"))     return `+${digits}`;
  if (digits.length === 13 && phone.startsWith("+"))       return phone;
  return `+91${digits}`;
}

function phoneVariants(phone: string): string[] {
  const n = normalizePhone(phone);
  const d = n.replace(/\D/g, "");
  return [...new Set([n, d, d.slice(-10), `+91${d.slice(-10)}`, `91${d.slice(-10)}`, `0${d.slice(-10)}`])];
}

// ── Middleware ────────────────────────────────────────────────────────────────
export function customerAuth(req: CustomerRequest, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ success: false, message: "Customer login required" });
    return;
  }
  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET) as any;
    if (payload.role !== "customer") {
      res.status(403).json({ success: false, message: "Customer access only" });
      return;
    }
    req.customerPhone = payload.phone;
    req.customerName  = payload.name;
    next();
  } catch {
    res.status(401).json({ success: false, message: "Session expired — please login again" });
  }
}

// ── Send OTP ──────────────────────────────────────────────────────────────────
export async function sendOtp(req: Request, res: Response, next: NextFunction) {
  try {
    const { phone } = req.body;
    if (!phone?.trim()) {
      res.status(400).json({ success: false, message: "Phone number is required" });
      return;
    }
    const normalized = normalizePhone(phone.trim());
    await twilioSendOtp(normalized);
    res.json({ success: true, message: "OTP sent to your phone", data: { phone: normalized } });
  } catch (e: any) { next(e); }
}

// ── Verify OTP ────────────────────────────────────────────────────────────────
export async function verifyOtp(req: Request, res: Response, next: NextFunction) {
  try {
    const { phone, otp, name } = req.body;
    if (!phone?.trim() || !otp?.trim()) {
      res.status(400).json({ success: false, message: "Phone and OTP are required" });
      return;
    }

    const normalized = normalizePhone(phone.trim());
    const result     = await twilioVerifyOtp(normalized, otp.trim());

    if (!result.valid) {
      res.status(400).json({ success: false, message: result.message });
      return;
    }

    // Try to find name from existing orders
    const existing = await Order.findOne({
      "customer.phone": { $in: phoneVariants(normalized) },
    }).sort({ createdAt: -1 }).lean();

    const customerName = name?.trim() || existing?.customer?.name || "";
    const isNewUser    = !existing;

    const token = jwt.sign(
      { phone: normalized, name: customerName, role: "customer" },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    res.json({
      success: true,
      data:    { token, phone: normalized, name: customerName, isNewUser },
      message: "Login successful",
    });
  } catch (e: any) { next(e); }
}

// ── Get my orders ─────────────────────────────────────────────────────────────
export async function getMyOrders(req: CustomerRequest, res: Response, next: NextFunction) {
  try {
    const variants = phoneVariants(req.customerPhone!);
    const orders   = await Order.find({ "customer.phone": { $in: variants } })
      .populate("assignedFranchise", "name location contact")
      .populate("deliveryAgent", "name phone username")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json({ success: true, data: orders });
  } catch (e: any) { next(e); }
}

// ── Update profile ────────────────────────────────────────────────────────────
export async function updateProfile(req: CustomerRequest, res: Response, next: NextFunction) {
  try {
    const { name } = req.body;
    if (!name?.trim()) {
      res.status(400).json({ success: false, message: "Name is required" });
      return;
    }

    const token = jwt.sign(
      { phone: req.customerPhone!, name: name.trim(), role: "customer" },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    res.json({
      success: true,
      data:    { token, phone: req.customerPhone!, name: name.trim() },
      message: "Profile updated",
    });
  } catch (e: any) { next(e); }
}