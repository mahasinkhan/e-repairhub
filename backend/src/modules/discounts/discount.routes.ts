import { Router, type Request, type Response, type NextFunction } from "express";
import { verifyToken, requireRoles } from "../auth/auth.middleware.js";
import { Discount } from "./discount.model.js";

export const discountRouter = Router();

const ok   = (res: Response, data: unknown, msg = "Success") => res.json({ success: true, data, message: msg });
const fail = (res: Response, msg: string, code = 400) => res.status(code).json({ success: false, message: msg });

// ── PUBLIC — featured coupon for homepage banner ──────────────────────────────
discountRouter.get("/featured", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const coupon = await Discount.findOne({
      isActive: true,
      $or: [{ expiresAt: { $gt: now } }, { expiresAt: null }],
    })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: coupon ?? null });
  } catch (e) { next(e); }
});

// ── PUBLIC — apply coupon ─────────────────────────────────────────────────────
discountRouter.post("/apply", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, orderAmount, brandName, serviceName } = req.body;
    if (!code?.trim())  { fail(res, "Coupon code is required"); return; }
    if (!orderAmount)   { fail(res, "Order amount is required"); return; }

    const coupon = await Discount.findOne({
      code:     code.trim().toUpperCase(),
      isActive: true,
    }).lean();

    if (!coupon) { fail(res, "Invalid or expired coupon code"); return; }
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      fail(res, "This coupon has expired"); return;
    }
    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
      fail(res, "This coupon has reached its usage limit"); return;
    }
    if (orderAmount < coupon.minOrderAmount) {
      fail(res, `Minimum order amount is ₹${coupon.minOrderAmount}`); return;
    }
    if (coupon.applicableTo === "brand" && coupon.brandName) {
      if (!brandName || brandName.toLowerCase() !== coupon.brandName.toLowerCase()) {
        fail(res, `This coupon is only valid for ${coupon.brandName} devices`); return;
      }
    }
    if (coupon.applicableTo === "service" && coupon.serviceName) {
      if (!serviceName || serviceName.toLowerCase() !== coupon.serviceName.toLowerCase()) {
        fail(res, `This coupon is only valid for ${coupon.serviceName}`); return;
      }
    }

    let discountAmount = 0;
    if (coupon.type === "percentage") {
      discountAmount = Math.round((orderAmount * coupon.value) / 100);
      if (coupon.maxDiscount) discountAmount = Math.min(discountAmount, coupon.maxDiscount);
    } else {
      discountAmount = Math.min(coupon.value, orderAmount);
    }

    res.json({
      success: true,
      data: {
        coupon:         { code: coupon.code, description: coupon.description, type: coupon.type, value: coupon.value },
        originalAmount: orderAmount,
        discountAmount,
        finalAmount:    orderAmount - discountAmount,
        message:        `🎉 Coupon applied! You save ₹${discountAmount.toLocaleString("en-IN")}`,
      },
    });
  } catch (e) { next(e); }
});

// ── PUBLIC — record coupon usage ──────────────────────────────────────────────
discountRouter.post("/:code/use", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await Discount.findOneAndUpdate(
      { code: req.params.code.toUpperCase() },
      { $inc: { usedCount: 1 } }
    );
    ok(res, null, "Usage recorded");
  } catch (e) { next(e); }
});

// ── All below require admin ───────────────────────────────────────────────────
discountRouter.use(verifyToken, requireRoles("admin"));

discountRouter.get("/stats", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [total, active, expired, totalUsed] = await Promise.all([
      Discount.countDocuments(),
      Discount.countDocuments({ isActive: true, $or: [{ expiresAt: { $gt: new Date() } }, { expiresAt: null }] }),
      Discount.countDocuments({ $or: [{ isActive: false }, { expiresAt: { $lt: new Date() } }] }),
      Discount.aggregate([{ $group: { _id: null, total: { $sum: "$usedCount" } } }]),
    ]);
    ok(res, { total, active, expired, totalUsed: totalUsed[0]?.total ?? 0 });
  } catch (e) { next(e); }
});

discountRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const coupons = await Discount.find().sort({ createdAt: -1 }).lean();
    ok(res, coupons);
  } catch (e) { next(e); }
});

discountRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, description, type, value, minOrderAmount, maxDiscount, maxUses, expiresAt, applicableTo, brandName, serviceName, isActive } = req.body;
    if (!code?.trim()) { fail(res, "Code is required"); return; }
    if (!type)         { fail(res, "Type is required"); return; }
    if (!value)        { fail(res, "Value is required"); return; }
    if (type === "percentage" && (value <= 0 || value > 100)) { fail(res, "Percentage must be 1-100"); return; }

    const existing = await Discount.findOne({ code: code.trim().toUpperCase() });
    if (existing) { fail(res, "Coupon code already exists"); return; }

    const coupon = await Discount.create({
      code:           code.trim().toUpperCase(),
      description,    type,    value,
      minOrderAmount: minOrderAmount || 0,
      maxDiscount:    maxDiscount    || undefined,
      maxUses:        maxUses        || 0,
      expiresAt:      expiresAt      ? new Date(expiresAt) : undefined,
      applicableTo:   applicableTo   || "all",
      brandName:      applicableTo === "brand"   ? brandName   : undefined,
      serviceName:    applicableTo === "service" ? serviceName : undefined,
      isActive:       isActive !== false,
    });
    res.status(201).json({ success: true, data: coupon, message: "Coupon created" });
  } catch (e) { next(e); }
});

discountRouter.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const coupon = await Discount.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
    if (!coupon) { fail(res, "Coupon not found", 404); return; }
    ok(res, coupon, "Coupon updated");
  } catch (e) { next(e); }
});

discountRouter.patch("/:id/toggle", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const coupon = await Discount.findById(req.params.id);
    if (!coupon) { fail(res, "Coupon not found", 404); return; }
    coupon.isActive = !coupon.isActive;
    await coupon.save();
    ok(res, coupon, `Coupon ${coupon.isActive ? "activated" : "deactivated"}`);
  } catch (e) { next(e); }
});

discountRouter.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await Discount.findByIdAndDelete(req.params.id);
    ok(res, null, "Coupon deleted");
  } catch (e) { next(e); }
});