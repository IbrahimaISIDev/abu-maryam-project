import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { liveStatus } from "@/lib/db/schema";
import { hasValidAdminSession } from "@/lib/adminAuth";

const liveUpdateSchema = z.object({
  isLive: z.boolean().optional(),
  title: z.string().optional(),
  arabicVerse: z.string().optional(),
  viewers: z.number().int().min(0).optional(),
  streamUrl: z.string().nullable().optional(),
  youtubeChannelId: z.string().nullable().optional(),
  startedAt: z.coerce.date().nullable().optional(),
  hostName: z.string().optional(),
  description: z.string().optional(),
});

export async function GET() {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const [row] = await db.select().from(liveStatus).where(eq(liveStatus.id, "singleton"));
  return NextResponse.json({ liveStatus: row ?? null });
}

export async function PUT(req: Request) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const parsed = liveUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Payload invalide" }, { status: 422 });
  }

  const [updated] = await db
    .insert(liveStatus)
    .values({ id: "singleton", ...parsed.data, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: liveStatus.id,
      set: { ...parsed.data, updatedAt: new Date() },
    })
    .returning();

  return NextResponse.json({ liveStatus: updated });
}
