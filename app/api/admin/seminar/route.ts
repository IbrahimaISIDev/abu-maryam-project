import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { seminars } from "@/lib/db/schema";
import { hasValidAdminSession } from "@/lib/adminAuth";
import { toSeminar } from "@/lib/db/queries";

const seminarUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  dateStart: z.coerce.date().optional(),
  dateEnd: z.coerce.date().optional(),
  totalPlaces: z.number().int().optional(),
  registrationDeadline: z.coerce.date().optional(),
});

export async function GET() {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const [row] = await db.select().from(seminars).limit(1);
  return NextResponse.json({ seminar: row ? toSeminar(row) : null });
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

  const parsed = seminarUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Payload invalide" }, { status: 422 });
  }

  const [current] = await db.select().from(seminars).limit(1);
  if (!current) {
    return NextResponse.json({ error: "Aucun séminaire à mettre à jour" }, { status: 404 });
  }

  const [updated] = await db
    .update(seminars)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(seminars.id, current.id))
    .returning();

  return NextResponse.json({ seminar: toSeminar(updated) });
}
