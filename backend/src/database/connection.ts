import mongoose from "mongoose";
import { env } from "../config/env.js";

/** Hide username/password in logs; keep host + path visible. */
function maskMongoUri(uri: string): string {
  try {
    return uri.replace(/\/\/([^/@]+)(@)/, "//***$2");
  } catch {
    return "(unable to mask URI)";
  }
}

export async function connectDB(): Promise<void> {
  mongoose.set("strictQuery", true);

  const masked = maskMongoUri(env.mongoUri);
  console.log("[database] Connecting to MongoDB…");
  console.log("[database] URI (masked):", masked);

  try {
    await mongoose.connect(env.mongoUri);
  } catch (err) {
    console.error("[database] MongoDB connection failed.");
    console.error(
      "[database] Check MONGO_URI in .env, Atlas IP allowlist (0.0.0.0/0 for dev), and cluster status."
    );
    throw err;
  }

  const conn = mongoose.connection;
  console.log("[database] MongoDB connected successfully.");
  console.log(`[database]   Database name: ${conn.name || "(default)"}`);
  console.log(`[database]   Host: ${conn.host || "(see URI)"}`);
  console.log(`[database]   Ready state: ${conn.readyState} (1 = connected)`);
}
