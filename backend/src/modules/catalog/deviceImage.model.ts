import mongoose, { Schema, Document, Types } from 'mongoose';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
export interface IDeviceImage extends Document {
  url: string;
  model: Types.ObjectId;
  variant?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DeviceImageSchema: Schema = new Schema({
  url: { type: String, required: true },
  model: { type: Schema.Types.ObjectId, ref: 'Model', required: true },
  variant: { type: Schema.Types.ObjectId, ref: 'Variant' },
}, { timestamps: true });
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Ensure uploads/device-images directory exists
const uploadDir = path.join(__dirname, '../../../uploads/device-images');
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

export const uploadDeviceImage = multer({ storage });

export default mongoose.model<IDeviceImage>('DeviceImage', DeviceImageSchema);
