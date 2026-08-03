import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { registrations } from "@/lib/db/schema";
import { hasValidAdminSession } from "@/lib/adminAuth";

const registrationUpdateSchema = z.object({
  status: z.enum(["confirmed", "pending", "cancelled"]).optional(),
  paymentStatus: z.enum(["paid", "unpaid", "free"]).optional(),
  notes: z.string().nullable().optional(),
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

  const parsed = registrationUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Payload invalide" }, { status: 422 });
  }

  const [updated] = await db
    .update(registrations)
    .set(parsed.data)
    .where(eq(registrations.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Inscription introuvable" }, { status: 404 });
  }

  return NextResponse.json({ registration: updated });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { id } = await params;

  await db.delete(registrations).where(eq(registrations.id, id));
  return NextResponse.json({ ok: true });
}
