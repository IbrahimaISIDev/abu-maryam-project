import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Abu Maryam TV",
    short_name: "Abu Maryam",
    description:
      "Cours islamiques d'Oustaz Niang Mbaye (H.A) — Qur'an & Sunna",
    start_url: "/",
    display: "standalone",
    background_color: "#efe9dc",
    theme_color: "#3c4a37",
    orientation: "portrait",
    categories: ["education", "religion"],
    lang: "fr",
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
      { src: "/pwa-icon?s=192", sizes: "192x192", type: "image/png" },
      { src: "/pwa-icon?s=512", sizes: "512x512", type: "image/png" },
    ],
    shortcuts: [
      {
        name: "Bibliothèque",
        url: "/bibliotheque",
        description: "Accéder aux cours et enseignements",
      },
      {
        name: "En direct",
        url: "/en-direct",
        description: "Voir le direct",
      },
    ],
  };
}
