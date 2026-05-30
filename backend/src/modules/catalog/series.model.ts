// backend/src/modules/catalog/series.model.ts

import mongoose, { Schema, Document } from 'mongoose';

export interface ISeries extends Document {
  name: string;
  brand: mongoose.Types.ObjectId;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const SeriesSchema: Schema = new Schema({
  name:   { type: String, required: true },
  brand:  { type: Schema.Types.ObjectId, ref: 'Brand', required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

export default mongoose.model<ISeries>('Series', SeriesSchema);