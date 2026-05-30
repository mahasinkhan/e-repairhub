import mongoose, { Schema, type Document } from "mongoose";

export type DiscountType = "percentage" | "flat";

export interface IDiscount extends Document {
  code:           string;
  description:    string;
  type:           DiscountType;
  value:          number;
  minOrderAmount: number;
  maxDiscount?:   number;
  maxUses:        number;
  usedCount:      number;
  isActive:       boolean;
  expiresAt?:     Date;
  applicableTo:   "all" | "brand" | "service";
  brandName?:     string;
  serviceName?:   string;
  createdAt:      Date;
  updatedAt:      Date;
}

const discountSchema = new Schema<IDiscount>(
  {
    code:           { type: String, required: true, unique: true, uppercase: true, trim: true },
    description:    { type: String, default: "" },
    type:           { type: String, enum: ["percentage", "flat"], required: true },
    value:          { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, default: 0 },
    maxDiscount:    { type: Number },
    maxUses:        { type: Number, default: 0 }, // 0 = unlimited
    usedCount:      { type: Number, default: 0 },
    isActive:       { type: Boolean, default: true },
    expiresAt:      { type: Date },
    applicableTo:   { type: String, enum: ["all", "brand", "service"], default: "all" },
    brandName:      { type: String },
    serviceName:    { type: String },
  },
  { timestamps: true }
);

discountSchema.index({ code: 1 });
discountSchema.index({ isActive: 1 });

export const Discount = mongoose.model<IDiscount>("Discount", discountSchema);