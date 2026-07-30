import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { adminUsers } from "@/lib/db/schema";
import { hasValidAdminSession } from "@/lib/adminAuth";
import { hashPassword, verifyPassword } from "@/lib/passwordHash";

const passwordUpdateSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "Le nouveau mot de passe doit contenir au moins 8 caractères"),
});

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

  const parsed = passwordUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Payload invalide" }, { status: 422 });
  }

  const [admin] = await db.select().from(adminUsers).limit(1);
  if (!admin) {
    return NextResponse.json({ error: "Compte admin introuvable" }, { status: 404 });
  }

  if (!verifyPassword(parsed.data.currentPassword, admin.passwordHash)) {
    return NextResponse.json({ error: "Mot de passe actuel incorrect" }, { status: 401 });
  }

  await db
    .update(adminUsers)
    .set({ passwordHash: hashPassword(parsed.data.newPassword), updatedAt: new Date() })
    .where(eq(adminUsers.id, admin.id));

  return NextResponse.json({ ok: true });
}
