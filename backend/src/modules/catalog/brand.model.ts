import mongoose, { Schema, Document } from 'mongoose';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
export interface IBrand extends Document {
  name: string;
  description?: string;
  image?: string; // Brand logo/image URL
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const BrandSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  image: { type: String }, // Brand logo/image
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Ensure uploads/brands directory exists
const uploadDir = path.join(__dirname, '../../../uploads/brands');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config for brand images
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadDir);    
    },
    filename: function (_req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    },
})

export const uploadBrandImage = multer({ storage });

export default mongoose.model<IBrand>('Brand', BrandSchema);
