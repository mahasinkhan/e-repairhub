import mongoose, { Schema, Document, Types } from 'mongoose';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

export interface IVariant extends Document {
  name: string;
  colorCode: string;
  image?: string;
  model: Types.ObjectId;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const VariantSchema: Schema = new Schema({
  name: { type: String, required: true },
  colorCode: { type: String, required: true },
  image: { type: String },
  model: { type: Schema.Types.ObjectId, ref: 'Model', required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Ensure uploads/variants directory exists
const uploadDir = path.join(__dirname, '../../../uploads/variants');
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

export const uploadVariantImage = multer({ storage });

export default mongoose.model<IVariant>('Variant', VariantSchema);
