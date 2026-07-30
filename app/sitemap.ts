import type { MetadataRoute } from "next";
import { getAllTeachings } from "@/lib/db/queries";
import { locales, SITE_URL } from "@/lib/i18n";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = [];
  const teachings = await getAllTeachings();

  for (const lang of locales) {
    const base = `${SITE_URL}/${lang}`;
    routes.push(
      { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
      { url: `${base}/bibliotheque`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
      { url: `${base}/en-direct`, lastModified: new Date(), changeFrequency: "always", priority: 0.8 },
      { url: `${base}/evenements`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
      { url: `${base}/activites`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
      { url: `${base}/inscription`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
      { url: `${base}/a-propos`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
      ...teachings.map((t) => ({
        url: `${base}/bibliotheque/${t.id}`,
        lastModified: new Date(t.publishedAt),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
    );
  }

  return routes;
}
