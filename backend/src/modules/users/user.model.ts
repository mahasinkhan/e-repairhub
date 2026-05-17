import mongoose, { Schema } from "mongoose";

const ROLES = ["admin", "franchise", "delivery"] as const;

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, required: true },
    phone: { type: String, default: "", trim: true },
    address: { type: String, default: "", trim: true },
    city: { type: String, default: "", trim: true },
    state: { type: String, default: "", trim: true },
    pincode: { type: String, default: "", trim: true },
    profileImage: { type: String, default: "", trim: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  {
    timestamps: true,
  }
);

userSchema.set("toJSON", {
  virtuals: true,
  transform(_doc, ret: Record<string, unknown>) {
    delete ret.password;
    delete ret.__v;
    if (ret._id) {
      ret.id = String(ret._id);
      delete ret._id;
    }
    return ret;
  },
});

export type UserRole = (typeof ROLES)[number];

export const User = mongoose.model("User", userSchema);
