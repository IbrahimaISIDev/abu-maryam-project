import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { adminUsers } from "@/lib/db/schema";
import { hasValidAdminSession } from "@/lib/adminAuth";

const profileUpdateSchema = z.object({
  displayName: z.string().min(1).optional(),
  email: z.string().email().optional(),
});

/** Une seule session admin à la fois dans cette app — la première (et unique) ligne fait foi. */
async function getCurrentAdmin() {
  const [admin] = await db.select().from(adminUsers).limit(1);
  return admin;
}

export async function GET() {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Compte admin introuvable" }, { status: 404 });
  }
  return NextResponse.json({ profile: { id: admin.id, email: admin.email, displayName: admin.displayName } });
}

export async function PATCH(req: Request) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Payload invalide" }, { status: 422 });
  }

  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Compte admin introuvable" }, { status: 404 });
  }

  const [updated] = await db
    .update(adminUsers)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(adminUsers.id, admin.id))
    .returning();

  return NextResponse.json({ profile: { id: updated.id, email: updated.email, displayName: updated.displayName } });
}
