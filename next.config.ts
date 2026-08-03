import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Active le mode standalone : génère un serveur Node auto-contenu dans
  // .next/standalone — nécessaire pour le Dockerfile de production.
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
  },
};

export default nextConfig;
