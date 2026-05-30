import mongoose, { Schema, type Document } from "mongoose";

export interface IFranchise extends Document {
  name: string;
  location: string;
  contact: string;
  commissionPercent: number;
  isActive: boolean;
  owner?: mongoose.Types.ObjectId;
  coordinates?: { type: "Point"; coordinates: [number, number] }; // [lng, lat]
  formattedAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

const franchiseSchema = new Schema<IFranchise>(
  {
    name:               { type: String, required: true, trim: true },
    location:           { type: String, required: true, trim: true },
    contact:            { type: String, required: true, trim: true },
    commissionPercent:  { type: Number, default: 0, min: 0, max: 100 },
    isActive:           { type: Boolean, default: true },
    owner:              { type: Schema.Types.ObjectId, ref: "User" },
    coordinates: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number] }, // [lng, lat]
    },
    formattedAddress:   { type: String },
  },
  { timestamps: true }
);

franchiseSchema.index({ name: "text", location: "text" });
franchiseSchema.index({ coordinates: "2dsphere" }, { sparse: true });

export const Franchise = mongoose.model<IFranchise>("Franchise", franchiseSchema);