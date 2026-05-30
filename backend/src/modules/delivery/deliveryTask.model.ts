import mongoose, { Schema, type Document } from "mongoose";

export type TaskType = "pickup" | "delivery";
export type TaskStatus =
  | "pending" | "accepted" | "rejected"
  | "in_progress" | "completed" | "failed";

export interface IDeliveryTask extends Document {
  order: mongoose.Types.ObjectId;
  agent: mongoose.Types.ObjectId;
  taskType: TaskType;
  status: TaskStatus;
  otp?: string;
  otpVerified: boolean;
  images: string[];
  failReason?: string;
  scheduledTime?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const deliveryTaskSchema = new Schema<IDeliveryTask>(
  {
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    agent: { type: Schema.Types.ObjectId, ref: "User", required: true },
    taskType: { type: String, enum: ["pickup", "delivery"], required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "in_progress", "completed", "failed"],
      default: "pending",
    },
    otp: { type: String },
    otpVerified: { type: Boolean, default: false },
    images: [{ type: String }],
    failReason: { type: String },
    scheduledTime: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

deliveryTaskSchema.index({ agent: 1, status: 1 });
deliveryTaskSchema.index({ order: 1 });

export const DeliveryTask = mongoose.model<IDeliveryTask>("DeliveryTask", deliveryTaskSchema);