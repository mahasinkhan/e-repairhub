import { z } from "zod";

/** Safe sub-folder under erepairhub/ in Cloudinary */
export const uploadFolderSchema = z
  .string()
  .max(64)
  .regex(/^[a-z0-9-_]+$/i, "Folder may only contain letters, numbers, hyphen, underscore")
  .optional()
  .default("catalog");

export const deleteMediaBodySchema = z.object({
  publicId: z.string().min(1, "publicId is required").max(512),
});
