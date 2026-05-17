import type { NextFunction, Response } from "express";
import multer, { MulterError } from "multer";
import type { AuthedRequest } from "../auth/auth.middleware.js";
import { deleteFromCloudinary, MediaError, uploadBufferToCloudinary } from "./media.service.js";
import { deleteMediaBodySchema, uploadFolderSchema } from "./media.validation.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image files are allowed"));
      return;
    }
    cb(null, true);
  },
});

export const uploadSingleMiddleware = (req: AuthedRequest, res: Response, next: NextFunction) => {
  upload.single("file")(req, res, (err: unknown) => {
    if (err) {
      if (err instanceof MulterError && err.code === "LIMIT_FILE_SIZE") {
        res.status(400).json({ success: false, message: "File too large (max 8MB)" });
        return;
      }
      const msg = err instanceof Error ? err.message : "Upload failed";
      res.status(400).json({ success: false, message: msg });
      return;
    }
    next();
  });
};

export async function uploadCtrl(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const file = req.file;
    if (!file?.buffer) {
      res.status(400).json({ success: false, message: "Missing file field (use multipart key: file)" });
      return;
    }

    const folder = uploadFolderSchema.parse(req.body?.folder || "catalog");
    const data = await uploadBufferToCloudinary(file.buffer, folder);
    res.status(201).json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

export async function deleteCtrl(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const { publicId } = deleteMediaBodySchema.parse(req.body);
    if (!publicId.startsWith("erepairhub/")) {
      res.status(400).json({ success: false, message: "Invalid publicId for this app" });
      return;
    }
    await deleteFromCloudinary(publicId);
    res.json({ success: true, message: "Asset removed from Cloudinary" });
  } catch (e) {
    next(e);
  }
}

export function mediaErrorHandler(err: unknown, _req: unknown, res: Response, next: NextFunction) {
  if (err instanceof MediaError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }
  next(err);
}
