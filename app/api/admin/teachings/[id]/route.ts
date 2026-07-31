import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { teachings } from "@/lib/db/schema";
import { hasValidAdminSession } from "@/lib/adminAuth";

const chapterSchema = z.object({
  label: z.string().min(1),
  timeSeconds: z.number().int().min(0),
});

const teachingUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  type: z.enum(["video", "audio"]).optional(),
  theme: z
    .enum([
      "tafsir",
      "tawhid",
      "akhlaq",
      "salat",
      "famille",
      "sunna",
      "sahaba",
      "khoutba",
      "conférence",
    ])
    .optional(),
  language: z.enum(["wolof", "arabe"]).optional(),
  duration: z.string().min(1).optional(),
  durationSeconds: z.number().int().min(0).optional(),
  thumbnail: z.string().nullable().optional(),
  youtubeId: z.string().nullable().optional(),
  videoUrl: z.string().nullable().optional(),
  audioUrl: z.string().nullable().optional(),
  publishedAt: z.coerce.date().optional(),
  published: z.boolean().optional(),
  description: z.string().nullable().optional(),
  seriesId: z.string().nullable().optional(),
  episodeNumber: z.number().int().nullable().optional(),
  level: z.enum(["débutant", "intermédiaire", "avancé"]).nullable().optional(),
  arabicVerse: z.string().nullable().optional(),
  chapters: z.array(chapterSchema).nullable().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const parsed = teachingUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Payload invalide" }, { status: 422 });
  }

  const [updated] = await db
    .update(teachings)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(teachings.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Enseignement introuvable" }, { status: 404 });
  }

  return NextResponse.json({ teaching: updated });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { id } = await params;

  await db.delete(teachings).where(eq(teachings.id, id));
  return NextResponse.json({ ok: true });
}
