import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const lucideReactDir = path.dirname(
  require.resolve("lucide-react/package.json")
);

// Standalone Vercel deploy uses "/" (domain root). Set VITE_BASE_PATH=/franchise/ only if
// the app is served under that subpath on the same host as other panels.
export default defineConfig({
  base: process.env.VITE_BASE_PATH || "/",
  plugins: [react()],
  server: {
    port: 5174,
    strictPort: true,
  },
  preview: {
    port: 5174,
    strictPort: true,
  },
  resolve: {
    alias: {
      "@repo/ui": path.resolve(__dirname, "../../packages/ui"),
      "lucide-react": lucideReactDir,
    },
    dedupe: ["react", "react-dom", "lucide-react"],
  },
});
