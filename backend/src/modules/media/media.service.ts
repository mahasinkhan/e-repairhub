import { Readable } from "node:stream";
import { configureCloudinary, cloudinary, isCloudinaryConfigured } from "../../config/cloudinary.js";

export class MediaError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = "MediaError";
  }
}

function ensureConfigured() {
  if (!isCloudinaryConfigured()) {
    throw new MediaError(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env",
      503
    );
  }
  configureCloudinary();
}

export async function uploadBufferToCloudinary(
  buffer: Buffer,
  folderSlug: string
): Promise<{
  url: string;
  secureUrl: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
}> {
  ensureConfigured();

  const folder = `erepairhub/${folderSlug}`.replace(/\/+/g, "/");

  const result = await new Promise<Record<string, unknown>>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
        use_filename: true,
        unique_filename: true,
      },
      (err, res) => {
        if (err) reject(err);
        else if (!res) reject(new Error("Empty Cloudinary response"));
        else resolve(res as unknown as Record<string, unknown>);
      }
    );
    Readable.from(buffer).pipe(stream);
  });

  return {
    url: String(result.url || ""),
    secureUrl: String(result.secure_url || ""),
    publicId: String(result.public_id || ""),
    width: typeof result.width === "number" ? result.width : undefined,
    height: typeof result.height === "number" ? result.height : undefined,
    format: typeof result.format === "string" ? result.format : undefined,
    bytes: typeof result.bytes === "number" ? result.bytes : undefined,
  };
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  ensureConfigured();
  await cloudinary.uploader.destroy(publicId);
}
