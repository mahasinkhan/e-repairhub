import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: "/admin/",
  plugins: [react()],
  server: { port: 5173 },
  resolve: {
    alias: {
      "@repo/ui": path.resolve(__dirname, "../../packages/ui"),
    },
  },
});
