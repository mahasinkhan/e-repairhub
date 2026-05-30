import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import { fileURLToPath } from "url";
import path from "path";
import { ZodError } from "zod";
import { env } from "./config/env.js";
import { AuthError } from "./modules/auth/auth.service.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { userMgmtErrorHandler } from "./modules/users/user.controller.js";
import { mediaErrorHandler } from "./modules/media/media.controller.js";
import { mediaRouter } from "./modules/media/media.routes.js";
import { userRouter } from "./modules/users/user.routes.js";
import catalogRouter from "./modules/catalog/catalog.routes.js";
import { franchiseRouter } from "./modules/franchise/franchise.routes.js";
import { franchisePanelRouter } from "./modules/franchise/franchise.panel.routes.js";
import { orderRouter } from "./modules/orders/order.routes.js";
import { deliveryRouter } from "./modules/delivery/delivery.routes.js";
import { paymentRouter } from "./modules/payments/payment.routes.js";
import { discountRouter } from "./modules/discounts/discount.routes.js";
import { customerRouter } from "./modules/customer/customer.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

app.use(cors({
  origin: env.clientOrigins.length ? env.clientOrigins : true,
  credentials: true,
}));
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/health", (_req, res) => { res.json({ ok: true }); });

app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/media", mediaRouter);
app.use("/catalog", catalogRouter);
app.use("/franchises", franchiseRouter);
app.use("/franchise-panel", franchisePanelRouter);
app.use("/orders", orderRouter);
app.use("/delivery", deliveryRouter);
app.use("/payments", paymentRouter);
app.use("/discounts", discountRouter);
app.use("/customer", customerRouter);

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