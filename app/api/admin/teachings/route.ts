import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { teachings } from "@/lib/db/schema";
import { hasValidAdminSession } from "@/lib/adminAuth";
import { desc } from "drizzle-orm";

const chapterSchema = z.object({
  label: z.string().min(1),
  timeSeconds: z.number().int().min(0),
});

const teachingSchema = z.object({
  title: z.string().min(1),
  type: z.enum(["video", "audio"]),
  theme: z.enum([
    "tafsir",
    "tawhid",
    "akhlaq",
    "salat",
    "famille",
    "sunna",
    "sahaba",
    "khoutba",
    "conférence",
  ]),
  language: z.enum(["wolof", "arabe"]),
  duration: z.string().min(1),
  durationSeconds: z.number().int().min(0),
  thumbnail: z.string().nullable().optional(),
  youtubeId: z.string().nullable().optional(),
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

export async function GET() {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const items = await db.select().from(teachings).orderBy(desc(teachings.publishedAt));
  return NextResponse.json({ teachings: items });
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

  const parsed = teachingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Payload invalide" }, { status: 422 });
  }

  const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const [created] = await db
    .insert(teachings)
    .values({ id, ...parsed.data, publishedAt: parsed.data.publishedAt ?? new Date() })
    .returning();

  return NextResponse.json({ teaching: created }, { status: 201 });
}
