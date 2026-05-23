import mongoose, { Schema, Document, Types } from 'mongoose';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
export interface IService extends Omit<Document, 'model'> {
  name: string;
  description?: string;
  estimatedTime?: string;
  price: number;
  image?: string;
  status: 'active' | 'inactive';
  model: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  estimatedTime: { type: String },
  price: { type: Number, required: true },
  image: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  model: { type: Schema.Types.ObjectId, ref: 'Model', required: true },
}, { timestamps: true });
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Ensure uploads/services directory exists
const uploadDir = path.join(__dirname, '../../../uploads/services');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadDir);
  },
  filename: function (_req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

export const uploadServiceImage = multer({ storage });

export default mongoose.model<IService>('Service', ServiceSchema);
