import { getAllTeachings } from "@/lib/db/queries";
import { SITE_URL } from "@/lib/i18n";

export const revalidate = 3600;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Taille du fichier en octets — requise par la balise <enclosure>. Un HEAD est raisonnable ici : le
 *  flux est mis en cache une heure (revalidate) et le nombre d'épisodes audio reste modeste. */
async function getContentLength(url: string): Promise<number> {
  try {
    const res = await fetch(url, { method: "HEAD" });
    const length = res.headers.get("content-length");
    return length ? Number(length) : 0;
  } catch {
    return 0;
  }
}

export async function GET() {
  const teachings = await getAllTeachings();
  const episodes = teachings.filter((t) => t.type === "audio" && t.audioUrl);

  const items = await Promise.all(
    episodes.map(async (t) => {
      const length = await getContentLength(t.audioUrl!);
      const link = `${SITE_URL}/fr/bibliotheque/${t.id}`;
      const pubDate = new Date(t.publishedAt).toUTCString();
      return `
    <item>
      <title>${escapeXml(t.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="false">${escapeXml(t.id)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(t.description ?? t.title)}</description>
      <enclosure url="${escapeXml(t.audioUrl!)}" length="${length}" type="audio/mpeg" />
      <itunes:duration>${escapeXml(t.duration)}</itunes:duration>
      <itunes:explicit>false</itunes:explicit>
    </item>`;
    })
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Abu Maryam TV — Enseignements</title>
    <link>${SITE_URL}/fr/bibliotheque</link>
    <atom:link href="${SITE_URL}/podcast.xml" rel="self" type="application/rss+xml" />
    <description>Enseignements islamiques de l'Oustaz Niang Mbaye — tafsîr, tawhîd, khoutba et conférences, en wolof et en arabe.</description>
    <language>wo</language>
    <itunes:author>Oustaz Niang Mbaye</itunes:author>
    <itunes:explicit>false</itunes:explicit>
    <itunes:category text="Religion &amp; Spirituality">
      <itunes:category text="Islam" />
    </itunes:category>
    <itunes:image href="${SITE_URL}/podcast-cover.png" />
    <image>
      <url>${SITE_URL}/podcast-cover.png</url>
      <title>Abu Maryam TV — Enseignements</title>
      <link>${SITE_URL}/fr/bibliotheque</link>
    </image>${items.join("")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
