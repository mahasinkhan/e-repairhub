import mongoose, { Schema, Document, Types } from 'mongoose';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';


export interface IModel extends Document {
  name: string;
  brand: Types.ObjectId;
  deviceType: string;
  image?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const ModelSchema: Schema = new Schema({
  name: { type: String, required: true },
  brand: { type: Schema.Types.ObjectId, ref: 'Brand', required: true },
  deviceType: { type: String, required: true },
  series: { type: String, default: "" },  // ADD THIS LINE
  image: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Ensure uploads/models directory exists
const uploadDir = path.join(__dirname, '../../../uploads/models');
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

export const uploadModelImage = multer({ storage });

export default mongoose.model<IModel>('Model', ModelSchema);
