import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  agentRules: false,
  output: "export",
  trailingSlash: true,
  // Isolated production exports set NEXT_DIST_DIR so they never overwrite the running dev .next.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Dev clients often open http://127.0.0.1:3000, which Next treats as a different origin from localhost.
  // Without this, /_next/hmr is blocked and the client bundle never hydrates, so demo controls appear dead.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  images: {
    unoptimized: true,
  },
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
