import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { series } from "@/lib/db/schema";
import { hasValidAdminSession } from "@/lib/adminAuth";

const seriesUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
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
  totalEpisodes: z.number().int().min(0).optional(),
  arabicVerse: z.string().nullable().optional(),
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

  const parsed = seriesUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Payload invalide" }, { status: 422 });
  }

  const [updated] = await db
    .update(series)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(series.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Série introuvable" }, { status: 404 });
  }

  return NextResponse.json({ series: updated });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { id } = await params;

  await db.delete(series).where(eq(series.id, id));
  return NextResponse.json({ ok: true });
}
