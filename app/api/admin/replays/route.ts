import { NextResponse } from "next/server";
import { z } from "zod";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { replays } from "@/lib/db/schema";
import { hasValidAdminSession } from "@/lib/adminAuth";
import { extractYoutubeId } from "@/lib/youtube";

const replaySchema = z.object({
  title: z.string().min(1),
  youtubeUrlOrId: z.string().min(1),
});

export async function GET() {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const items = await db.select().from(replays).orderBy(asc(replays.createdAt));
  return NextResponse.json({ replays: items });
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

  const parsed = replaySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Payload invalide" }, { status: 422 });
  }

  const youtubeId = extractYoutubeId(parsed.data.youtubeUrlOrId);
  if (!youtubeId) {
    return NextResponse.json({ error: "URL ou ID YouTube invalide" }, { status: 422 });
  }

  const id = `r-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const [created] = await db.insert(replays).values({ id, title: parsed.data.title, youtubeId }).returning();

  return NextResponse.json({ replay: created }, { status: 201 });
}
