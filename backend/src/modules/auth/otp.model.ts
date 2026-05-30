import mongoose, { Schema } from "mongoose";

const otpSchema = new Schema({
  phone:     { type: String, required: true },
  otp:       { type: String, required: true },
  expiresAt: { type: Date,   required: true },
  verified:  { type: Boolean, default: false },
  attempts:  { type: Number,  default: 0 },
}, { timestamps: true });

otpSchema.index({ phone: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // auto-delete expired

export const OtpRecord = mongoose.model("OtpRecord", otpSchema);