import mongoose from "mongoose";
import { Franchise } from "./franchise.model.js";
import { geocodeAddress, haversineKm } from "../../shared/utils/geocode.js";
import type { CreateFranchiseDto, UpdateFranchiseDto } from "./franchise.types.js";

function assertValidId(id: string) {
  if (!mongoose.isValidObjectId(id)) throw new Error("Invalid ID");
}

export async function listFranchises() {
  return Franchise.find().sort({ createdAt: -1 }).lean();
}

export async function getFranchiseById(id: string) {
  assertValidId(id);
  const franchise = await Franchise.findById(id).lean();
  if (!franchise) throw new Error("Franchise not found");
  return franchise;
}

export async function createFranchise(dto: CreateFranchiseDto) {
  const franchise = await Franchise.create(dto);

  // Auto-geocode location
  const geo = await geocodeAddress(dto.location);
  if (geo) {
    await Franchise.findByIdAndUpdate(franchise._id, {
      coordinates:     { type: "Point", coordinates: [geo.lng, geo.lat] },
      formattedAddress: geo.formatted,
    });
  }

  return Franchise.findById(franchise._id).lean();
}

export async function updateFranchise(id: string, dto: UpdateFranchiseDto) {
  assertValidId(id);
  const franchise = await Franchise.findByIdAndUpdate(id, dto, { new: true, runValidators: true }).lean();
  if (!franchise) throw new Error("Franchise not found");

  // Re-geocode if location changed
  if (dto.location) {
    const geo = await geocodeAddress(dto.location);
    if (geo) {
      await Franchise.findByIdAndUpdate(id, {
        coordinates:     { type: "Point", coordinates: [geo.lng, geo.lat] },
        formattedAddress: geo.formatted,
      });
    }
  }

  return Franchise.findById(id).lean();
}

export async function toggleFranchiseStatus(id: string, isActive: boolean) {
  assertValidId(id);
  const franchise = await Franchise.findByIdAndUpdate(id, { isActive }, { new: true }).lean();
  if (!franchise) throw new Error("Franchise not found");
  return franchise;
}

export async function deleteFranchise(id: string) {
  assertValidId(id);
  const franchise = await Franchise.findByIdAndDelete(id).lean();
  if (!franchise) throw new Error("Franchise not found");
  return franchise;
}

export async function getActiveFranchises() {
  return Franchise.find({ isActive: true }).select("_id name location coordinates formattedAddress").lean();
}

type FranchiseWithDistance = {
  _id: mongoose.Types.ObjectId;
  name: string;
  location: string;
  contact: string;
  commissionPercent: number;
  isActive: boolean;
  owner?: mongoose.Types.ObjectId;
  coordinates?: { type: "Point"; coordinates: [number, number] };
  formattedAddress?: string;
  createdAt: Date;
  updatedAt: Date;
  distKm: number | null;
};

export async function getNearbyFranchises(
  lat: number,
  lng: number,
  maxKm = 50
): Promise<FranchiseWithDistance[]> {
  const all = await Franchise.find({ isActive: true }).lean();

  const withDistance: FranchiseWithDistance[] = all.map(f => {
    let distKm: number | null = null;
    if (f.coordinates?.coordinates?.length === 2) {
      const [fLng, fLat] = f.coordinates.coordinates;
      distKm = haversineKm(lat, lng, fLat, fLng);
    }
    return {
      _id:              f._id,
      name:             f.name,
      location:         f.location,
      contact:          f.contact,
      commissionPercent: f.commissionPercent,
      isActive:         f.isActive,
      owner:            f.owner,
      coordinates:      f.coordinates as { type: "Point"; coordinates: [number, number] } | undefined,
      formattedAddress: f.formattedAddress,
      createdAt:        f.createdAt,
      updatedAt:        f.updatedAt,
      distKm,
    };
  });

  return withDistance
    .filter(f => f.distKm === null || f.distKm <= maxKm)
    .sort((a, b) => {
      if (a.distKm === null && b.distKm === null) return 0;
      if (a.distKm === null) return 1;
      if (b.distKm === null) return -1;
      return a.distKm - b.distKm;
    });
}