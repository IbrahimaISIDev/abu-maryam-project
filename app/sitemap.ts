import type { MetadataRoute } from "next";
import { teachings } from "@/data/teachings";

const BASE_URL = "https://abumaryam.tv";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/bibliotheque`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/en-direct`, lastModified: new Date(), changeFrequency: "always", priority: 0.8 },
    { url: `${BASE_URL}/evenements`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/inscription`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/a-propos`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  const teachingRoutes: MetadataRoute.Sitemap = teachings.map((t) => ({
    url: `${BASE_URL}/bibliotheque/${t.id}`,
    lastModified: new Date(t.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...teachingRoutes];
}
