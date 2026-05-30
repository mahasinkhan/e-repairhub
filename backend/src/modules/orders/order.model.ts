import mongoose, { Schema, type Document } from "mongoose";
import { randomBytes } from "crypto";

export type OrderStatus =
  | "placed" | "confirmed" | "assigned"
  | "picked" | "repairing" | "completed"
  | "delivered" | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed";

export interface ITimelineEntry {
  status: string; time: Date; by: string; note?: string;
}

export interface IExtraService {
  _id?:         mongoose.Types.ObjectId;
  name:         string;
  price:        number;
  reason:       string;
  status:       "pending" | "approved" | "rejected";
  requestedAt:  Date;
  respondedAt?: Date;
}

export interface IOrder extends Document {
  orderNumber:        string;
  customer: {
    userId?:           mongoose.Types.ObjectId;
    name:              string;
    phone:             string;
    address:           string;
    coordinates?:      { type: "Point"; coordinates: [number, number] };
    formattedAddress?: string;
  };
  deviceDetails:      { brand: string; model: string; color?: string; issue: string };
  serviceType:        string;
  price:              number;
  paymentStatus:      PaymentStatus;
  status:             OrderStatus;
  assignedFranchise?: mongoose.Types.ObjectId;
  deliveryAgent?:     mongoose.Types.ObjectId;
  cancelReason?:      string;
  notes?:             string;
  timeline:           ITimelineEntry[];
  images:             string[];
  extraServices:      IExtraService[];
  createdAt:          Date;
  updatedAt:          Date;
}

const timelineSchema = new Schema<ITimelineEntry>(
  {
    status: { type: String, required: true },
    time:   { type: Date, default: Date.now },
    by:     { type: String, default: "system" },
    note:   { type: String },
  },
  { _id: false }
);

const extraServiceSchema = new Schema<IExtraService>(
  {
    name:        { type: String, required: true },
    price:       { type: Number, required: true, min: 0 },
    reason:      { type: String, required: true },
    status:      { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    requestedAt: { type: Date, default: Date.now },
    respondedAt: { type: Date },
  },
  { _id: true }
);

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, unique: true },
    customer: {
      userId:  { type: Schema.Types.ObjectId, ref: "User" },
      name:    { type: String, required: true },
      phone:   { type: String, required: true },
      address: { type: String, required: true },
      coordinates: {
        type:        { type: String, enum: ["Point"] },
        coordinates: { type: [Number] },
      },
      formattedAddress: { type: String },
    },
    deviceDetails: {
      brand: { type: String, required: true },
      model: { type: String, required: true },
      color: { type: String },
      issue: { type: String, required: true },
    },
    serviceType:   { type: String, required: true },
    price:         { type: Number, required: true, min: 0 },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    status: {
      type:    String,
      enum:    ["placed", "confirmed", "assigned", "picked", "repairing", "completed", "delivered", "cancelled"],
      default: "placed",
    },
    assignedFranchise: { type: Schema.Types.ObjectId, ref: "Franchise" },
    deliveryAgent:     { type: Schema.Types.ObjectId, ref: "User" },
    cancelReason:      { type: String },
    notes:             { type: String },
    timeline:          [timelineSchema],
    images:            [{ type: String }],
    extraServices:     [extraServiceSchema],
  },
  { timestamps: true }
);

// ── Order number — collision-proof, no DB call ────────────────────────────────
orderSchema.pre("save", function (next) {
  if (!this.orderNumber) {
    this.orderNumber = `ERH-${randomBytes(4).toString("hex").toUpperCase()}`;
  }
  next();
});

// ── Indexes ───────────────────────────────────────────────────────────────────
orderSchema.index({ status: 1 });
orderSchema.index({ "customer.name": "text", "customer.phone": "text", orderNumber: "text" });
orderSchema.index({ "customer.coordinates": "2dsphere" }, { sparse: true });

export const Order = mongoose.model<IOrder>("Order", orderSchema);