import type { NextFunction, Response } from "express";
import { findByIdSafe } from "../users/user.service.js";
import { loginUser } from "./auth.service.js";
import type { AuthedRequest } from "./auth.middleware.js";

export async function login(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const { token, user } = await loginUser(req.body);
    res.json({
      success: true,
      token,
      user,
    });
  } catch (e) {
    next(e);
  }
}

export async function me(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const id = req.userId;
    if (!id) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }
    const doc = await findByIdSafe(id);
    if (!doc) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }
    res.json({
      success: true,
      user: {
        id: String(doc._id),
        name: doc.name,
        email: doc.email,
        role: doc.role,
      },
    });
  } catch (e) {
    next(e);
  }
}
