import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Standalone Vercel deploy uses "/" (domain root). Set VITE_BASE_PATH=/admin/ only if
// the built app is served under a subpath (e.g. same host as other panels).
export default defineConfig({
  base: process.env.VITE_BASE_PATH || "/",
  plugins: [react()],
  server: { port: 5173 },
  resolve: {
    alias: {
      "@repo/ui": path.resolve(__dirname, "../../packages/ui"),
    },
  },
});
