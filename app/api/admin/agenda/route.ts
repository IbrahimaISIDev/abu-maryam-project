import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { agendaItems } from "@/lib/db/schema";
import { hasValidAdminSession } from "@/lib/adminAuth";
import { asc } from "drizzle-orm";

const agendaSchema = z.object({
  type: z.enum(["séminaire", "conférence", "khoutba", "cours", "tafsir"]),
  title: z.string().min(1),
  location: z.string().min(1),
  dateStart: z.coerce.date(),
  dateEnd: z.coerce.date().nullable().optional(),
  registrationDeadline: z.coerce.date().nullable().optional(),
  totalPlaces: z.number().int().nullable().optional(),
  remainingPlaces: z.number().int().nullable().optional(),
  isFeatured: z.boolean().optional(),
  ctaLabel: z.string().nullable().optional(),
  replayId: z.string().nullable().optional(),
});

export async function GET() {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const items = await db.select().from(agendaItems).orderBy(asc(agendaItems.dateStart));
  return NextResponse.json({ agendaItems: items });
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

  const parsed = agendaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Payload invalide" }, { status: 422 });
  }

  const id = `a-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const [created] = await db.insert(agendaItems).values({ id, ...parsed.data }).returning();

  return NextResponse.json({ agendaItem: created }, { status: 201 });
}
