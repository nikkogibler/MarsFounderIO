import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { marsfounderMockApiPlugin } from "./src/dev/mock-api";

const isProduction = process.env.NODE_ENV === "production";

// PORT is only required for dev/preview, not for `vite build`
const rawPort = process.env.PORT;
const port = rawPort ? Number(rawPort) : 3000;

// BASE_PATH defaults to "/" which is correct for Vercel
const basePath = process.env.BASE_PATH ?? "/";

export default defineConfig({
  base: basePath,
  plugins: [
    ...(process.env.MOCK_API === "1" ? [marsfounderMockApiPlugin()] : []),
    react(),
    tailwindcss(),
    ...(!isProduction
      ? [
          (await import("@replit/vite-plugin-runtime-error-modal")).default(),
        ]
      : []),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
    },
    proxy: {
      "/api": {
        target: process.env.VITE_API_URL ?? "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
