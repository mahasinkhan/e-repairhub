import type { NextFunction, Request, Response } from "express";
import type { AuthedRequest } from "../auth/auth.middleware.js";
import {
  createUser,
  getUserByIdPublic,
  listUsers,
  patchUserStatus,
  softDeleteUser,
  updateUser,
  UserMgmtError,
} from "./user.service.js";
import {
  createUserBodySchema,
  listUsersQuerySchema,
  mongoIdParamSchema,
  patchStatusBodySchema,
  updateUserBodySchema,
} from "./user.validation.js";

function isDuplicateKey(err: unknown): boolean {
  return typeof err === "object" && err !== null && "code" in err && (err as { code: number }).code === 11000;
}

export async function listUsersCtrl(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const q = listUsersQuerySchema.parse(req.query);
    const data = await listUsers(q);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

export async function getUserCtrl(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const { id } = mongoIdParamSchema.parse(req.params);
    const user = await getUserByIdPublic(id);
    res.json({ success: true, data: user });
  } catch (e) {
    next(e);
  }
}

export async function createUserCtrl(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const body = createUserBodySchema.parse(req.body);
    const actorId = req.userId;
    if (!actorId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }
    const user = await createUser(body, actorId);
    res.status(201).json({ success: true, data: user });
  } catch (e) {
    if (isDuplicateKey(e)) {
      res.status(409).json({ success: false, message: "Email or username already exists" });
      return;
    }
    next(e);
  }
}

export async function updateUserCtrl(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const { id } = mongoIdParamSchema.parse(req.params);
    const body = updateUserBodySchema.parse(req.body);
    const actorId = req.userId;
    if (!actorId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }
    const user = await updateUser(id, body, actorId);
    res.json({ success: true, data: user });
  } catch (e) {
    next(e);
  }
}

export async function deleteUserCtrl(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const { id } = mongoIdParamSchema.parse(req.params);
    const actorId = req.userId;
    if (!actorId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }
    const data = await softDeleteUser(id, actorId);
    res.json({ success: true, data, message: "User deactivated" });
  } catch (e) {
    next(e);
  }
}

export async function patchStatusCtrl(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const { id } = mongoIdParamSchema.parse(req.params);
    const { isActive } = patchStatusBodySchema.parse(req.body);
    const actorId = req.userId;
    if (!actorId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }
    const user = await patchUserStatus(id, isActive, actorId);
    res.json({ success: true, data: user });
  } catch (e) {
    next(e);
  }
}

export function userMgmtErrorHandler(err: unknown, _req: Request, res: Response, next: NextFunction) {
  if (err instanceof UserMgmtError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }
  next(err);
}
