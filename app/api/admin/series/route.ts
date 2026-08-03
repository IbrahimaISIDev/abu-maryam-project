import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { series } from "@/lib/db/schema";
import { hasValidAdminSession } from "@/lib/adminAuth";

const seriesSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
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
    "rappel",
  ]),
  language: z.enum(["wolof", "arabe"]),
  totalEpisodes: z.number().int().min(0),
  arabicVerse: z.string().nullable().optional(),
});

export async function GET() {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const items = await db.select().from(series);
  return NextResponse.json({ series: items });
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

  const parsed = seriesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Payload invalide" }, { status: 422 });
  }

  const id = `series-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const [created] = await db.insert(series).values({ id, ...parsed.data }).returning();

  return NextResponse.json({ series: created }, { status: 201 });
}
