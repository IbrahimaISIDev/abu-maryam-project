import { NextResponse } from "next/server";
import { z } from "zod";
import { hasValidAdminSession } from "@/lib/adminAuth";
import { createPresignedUpload } from "@/lib/r2";

const ALLOWED_TYPES: Record<"audio" | "video" | "image", string[]> = {
  audio: ["audio/mpeg", "audio/mp4", "audio/wav", "audio/x-wav", "audio/ogg", "audio/webm", "audio/x-m4a"],
  video: ["video/mp4", "video/webm", "video/quicktime", "video/x-matroska"],
  image: ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif"],
};

const presignSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().min(1),
  kind: z.enum(["audio", "video", "image"]),
});

/** Nettoie le nom de fichier pour une clé R2 sûre — pas d'espaces, d'accents ni de caractères spéciaux. */
function sanitizeFilename(name: string): string {
  const cleaned = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return cleaned.slice(-80) || "fichier";
}

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

  const parsed = presignSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload invalide" }, { status: 422 });
  }

  const { filename, contentType, kind } = parsed.data;
  if (!ALLOWED_TYPES[kind].includes(contentType)) {
    return NextResponse.json({ error: "Type de fichier non autorisé" }, { status: 422 });
  }

  const folder = kind === "image" ? "teachings/images" : `teachings/${kind}`;
  const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${sanitizeFilename(filename)}`;

  try {
    const presigned = await createPresignedUpload(key, contentType);
    return NextResponse.json(presigned);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Échec de la génération de l'URL d'envoi" },
      { status: 500 }
    );
  }
}
