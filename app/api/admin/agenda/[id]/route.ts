import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { agendaItems } from "@/lib/db/schema";
import { hasValidAdminSession } from "@/lib/adminAuth";
import { toAgendaItem } from "@/lib/db/queries";

const agendaUpdateSchema = z.object({
  type: z.enum(["séminaire", "conférence", "khoutba", "cours", "tafsir"]).optional(),
  title: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  dateStart: z.coerce.date().optional(),
  dateEnd: z.coerce.date().nullable().optional(),
  registrationDeadline: z.coerce.date().nullable().optional(),
  totalPlaces: z.number().int().nullable().optional(),
  remainingPlaces: z.number().int().nullable().optional(),
  isFeatured: z.boolean().optional(),
  ctaLabel: z.string().nullable().optional(),
  replayId: z.string().nullable().optional(),
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

  const parsed = agendaUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Payload invalide" }, { status: 422 });
  }

  const [updated] = await db
    .update(agendaItems)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(agendaItems.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Activité introuvable" }, { status: 404 });
  }

  return NextResponse.json({ agendaItem: toAgendaItem(updated) });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { id } = await params;

  await db.delete(agendaItems).where(eq(agendaItems.id, id));
  return NextResponse.json({ ok: true });
}
