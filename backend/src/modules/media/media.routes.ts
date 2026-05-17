import { Router } from "express";
import { requireRoles, verifyToken } from "../auth/auth.middleware.js";
import { deleteCtrl, uploadCtrl, uploadSingleMiddleware } from "./media.controller.js";

export const mediaRouter = Router();

/** Upload images (catalog, profiles, CMS, etc.) — stored under Cloudinary folder `erepairhub/<folder>/` */
mediaRouter.post(
  "/upload",
  verifyToken,
  requireRoles("admin", "franchise"),
  uploadSingleMiddleware,
  uploadCtrl
);

/** Remove asset from Cloudinary (admin only). Body: { publicId } */
mediaRouter.delete("/asset", verifyToken, requireRoles("admin"), deleteCtrl);
