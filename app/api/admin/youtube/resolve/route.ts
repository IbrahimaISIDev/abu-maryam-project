import { NextResponse } from "next/server";
import { z } from "zod";
import { hasValidAdminSession } from "@/lib/adminAuth";
import { extractYoutubeId, fetchYoutubeOembed, fetchYoutubeDuration } from "@/lib/youtube";

const resolveSchema = z.object({ url: z.string().min(1) });

export async function POST(req: Request) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const parsed = resolveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "URL requise" }, { status: 422 });
  }

  const youtubeId = extractYoutubeId(parsed.data.url);
  if (!youtubeId) {
    return NextResponse.json({ error: "URL ou ID YouTube introuvable dans le texte fourni" }, { status: 422 });
  }

  const oembed = await fetchYoutubeOembed(youtubeId);
  if (!oembed) {
    return NextResponse.json({ error: "Vidéo YouTube introuvable ou privée" }, { status: 404 });
  }

  const durationInfo = await fetchYoutubeDuration(youtubeId);

  return NextResponse.json({
    youtubeId,
    title: oembed.title,
    thumbnail: oembed.thumbnailUrl,
    duration: durationInfo?.duration ?? null,
    durationSeconds: durationInfo?.durationSeconds ?? null,
    durationAvailable: durationInfo !== null,
  });
}
