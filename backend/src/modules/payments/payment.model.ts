import mongoose, { Schema, type Document } from "mongoose";

export type PaymentMethod = "razorpay" | "cash" | "manual";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface IPayment extends Document {
  order: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  razorpayPaymentLink?: string;
  note?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    order:              { type: Schema.Types.ObjectId, ref: "Order", required: true },
    amount:             { type: Number, required: true, min: 0 },
    currency:           { type: String, default: "INR" },
    method:             { type: String, enum: ["razorpay", "cash", "manual"], default: "razorpay" },
    status:             { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
    razorpayOrderId:    { type: String },
    razorpayPaymentId:  { type: String },
    razorpaySignature:  { type: String },
    razorpayPaymentLink:{ type: String },
    note:               { type: String },
    paidAt:             { type: Date },
  },
  { timestamps: true }
);

paymentSchema.index({ order: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ razorpayOrderId: 1 });

export const Payment = mongoose.model<IPayment>("Payment", paymentSchema);