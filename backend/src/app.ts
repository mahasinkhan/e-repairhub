import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import { ZodError } from "zod";
import { env } from "./config/env.js";
import { AuthError } from "./modules/auth/auth.service.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { userMgmtErrorHandler } from "./modules/users/user.controller.js";
import { mediaErrorHandler } from "./modules/media/media.controller.js";
import { mediaRouter } from "./modules/media/media.routes.js";
import { userRouter } from "./modules/users/user.routes.js";

export const app = express();

app.use(
  cors({
    origin: env.clientOrigins.length ? env.clientOrigins : true,
    credentials: true,
  })
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/media", mediaRouter);

app.use(userMgmtErrorHandler);
app.use(mediaErrorHandler);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AuthError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }
  if (err instanceof ZodError) {
    const msg = err.errors[0]?.message || "Validation failed";
    res.status(400).json({ success: false, message: msg });
    return;
  }
  console.error(err);
  res.status(500).json({ success: false, message: "Internal server error" });
});
