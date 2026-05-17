import { Router } from "express";
import { login, me } from "./auth.controller.js";
import { verifyToken } from "./auth.middleware.js";

export const authRouter = Router();

authRouter.post("/login", login);
authRouter.get("/me", verifyToken, me);
