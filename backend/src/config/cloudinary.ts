import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "";
const apiKey = process.env.CLOUDINARY_API_KEY || "";
const apiSecret = process.env.CLOUDINARY_API_SECRET || "";

export function isCloudinaryConfigured(): boolean {
  return Boolean(cloudName && apiKey && apiSecret);
}

/** One-line status for server startup logs (no secrets). */
export function cloudinaryStartupLine(): string {
  if (!isCloudinaryConfigured()) {
    return "[cloudinary] Not configured — set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET (uploads disabled)";
  }
  return `[cloudinary] Configured — cloud "${cloudName}" — uploads enabled`;
}

export function configureCloudinary(): void {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary env vars are missing");
  }
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

export { cloudinary };
