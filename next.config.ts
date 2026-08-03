import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Active le mode standalone : génère un serveur Node auto-contenu dans
  // .next/standalone — nécessaire pour le Dockerfile de production.
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
      // Cloudflare R2 — URLs publiques des vignettes uploadées
      { protocol: "https", hostname: "*.r2.dev" },
    ],
  },
};

export default nextConfig;
