import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPricing extends Document {
  model: Types.ObjectId;
  service: Types.ObjectId;
  basePrice: number;
  pickupCharge: number;
  urgentCharge: number;
  discount: number;
  finalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

const PricingSchema: Schema = new Schema({
  model: { type: Schema.Types.ObjectId, ref: 'Model', required: true },
  service: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
  basePrice: { type: Number, required: true },
  pickupCharge: { type: Number, default: 0 },
  urgentCharge: { type: Number, default: 0 ,min:0},
  discount: { type: Number, default: 0 },
  finalPrice: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.model<IPricing>('Pricing', PricingSchema);
