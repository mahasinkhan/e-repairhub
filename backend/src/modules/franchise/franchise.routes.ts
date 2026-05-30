import { Router, type Request, type Response, type NextFunction } from "express";
import { verifyToken, requireRoles } from "../auth/auth.middleware.js";
import {
  listFranchises, getFranchiseById, createFranchise, updateFranchise,
  toggleFranchiseStatus, deleteFranchise, getActiveFranchises, getNearbyFranchises,
} from "./franchise.service.js";
import { Franchise } from "./franchise.model.js";
import { geocodeAddress } from "../../shared/utils/geocode.js";
import mongoose from "mongoose";

export const franchiseRouter = Router();
franchiseRouter.use(verifyToken, requireRoles("admin"));

franchiseRouter.get("/", async (_req, res, next) => {
  try { res.json({ success: true, data: await listFranchises() }); }
  catch (e) { next(e); }
});

franchiseRouter.get("/active", async (_req, res, next) => {
  try { res.json({ success: true, data: await getActiveFranchises() }); }
  catch (e) { next(e); }
});

// ── NEARBY — sorted by distance to customer ───────────────────────────────────
franchiseRouter.get("/nearby", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lat, lng, maxKm, address } = req.query;

    let latitude: number | null  = lat  ? Number(lat)  : null;
    let longitude: number | null = lng  ? Number(lng)  : null;

    // If address given instead of lat/lng, geocode it
    if (address && (!latitude || !longitude)) {
      const geo = await geocodeAddress(String(address));
      if (geo) { latitude = geo.lat; longitude = geo.lng; }
    }

    if (!latitude || !longitude) {
      res.status(400).json({ success: false, message: "lat/lng or address required" });
      return;
    }

    const km = maxKm ? Number(maxKm) : 50;
    const franchises = await getNearbyFranchises(latitude, longitude, km);
    res.json({ success: true, data: franchises });
  } catch (e) { next(e); }
});

// ── Geocode franchise address ─────────────────────────────────────────────────
franchiseRouter.post("/geocode/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const franchise = await Franchise.findById(req.params.id).lean();
    if (!franchise) { res.status(404).json({ success: false, message: "Not found" }); return; }

    const geo = await geocodeAddress(franchise.location);
    if (!geo) { res.status(422).json({ success: false, message: "Could not geocode location" }); return; }

    const updated = await Franchise.findByIdAndUpdate(
      req.params.id,
      { coordinates: { type: "Point", coordinates: [geo.lng, geo.lat] }, formattedAddress: geo.formatted },
      { new: true }
    ).lean();

    res.json({ success: true, data: updated, message: "Geocoded successfully" });
  } catch (e) { next(e); }
});

franchiseRouter.get("/:id", async (req, res, next) => {
  try { res.json({ success: true, data: await getFranchiseById(req.params.id) }); }
  catch (e) { next(e); }
});

franchiseRouter.post("/", async (req, res, next) => {
  try {
    const { name, location, contact, commissionPercent, isActive } = req.body;
    if (!name?.trim())     { res.status(400).json({ success: false, message: "Name is required" }); return; }
    if (!location?.trim()) { res.status(400).json({ success: false, message: "Location is required" }); return; }
    if (!contact?.trim())  { res.status(400).json({ success: false, message: "Contact is required" }); return; }
    const franchise = await createFranchise({ name, location, contact, commissionPercent, isActive });
    res.status(201).json({ success: true, data: franchise, message: "Franchise created" });
  } catch (e) { next(e); }
});

franchiseRouter.put("/:id", async (req, res, next) => {
  try {
    const { name, location, contact, commissionPercent, isActive } = req.body;
    const franchise = await updateFranchise(req.params.id, { name, location, contact, commissionPercent, isActive });
    res.json({ success: true, data: franchise, message: "Franchise updated" });
  } catch (e) { next(e); }
});

franchiseRouter.patch("/:id/status", async (req, res, next) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== "boolean") { res.status(400).json({ success: false, message: "isActive required" }); return; }
    const franchise = await toggleFranchiseStatus(req.params.id, isActive);
    res.json({ success: true, data: franchise, message: `Franchise ${isActive ? "activated" : "deactivated"}` });
  } catch (e) { next(e); }
});

franchiseRouter.delete("/:id", async (req, res, next) => {
  try {
    await deleteFranchise(req.params.id);
    res.json({ success: true, message: "Franchise deleted" });
  } catch (e) { next(e); }
});

franchiseRouter.patch("/:id/link-owner", async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId || !mongoose.isValidObjectId(userId)) {
      res.status(400).json({ success: false, message: "Valid userId required" }); return;
    }
    const franchise = await Franchise.findByIdAndUpdate(
      req.params.id, { owner: new mongoose.Types.ObjectId(userId) }, { new: true }
    ).lean();
    if (!franchise) { res.status(404).json({ success: false, message: "Franchise not found" }); return; }
    res.json({ success: true, data: franchise, message: "Owner linked successfully" });
  } catch (e) { next(e); }
});