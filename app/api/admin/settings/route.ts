import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { siteSettings } from "@/lib/db/schema";
import { hasValidAdminSession } from "@/lib/adminAuth";

const settingsUpdateSchema = z.object({
  siteName: z.string().min(1).optional(),
  siteDescription: z.string().optional(),
  notifyByEmail: z.boolean().optional(),
  notifyByWhatsapp: z.boolean().optional(),
});

export async function GET() {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const [row] = await db.select().from(siteSettings).where(eq(siteSettings.id, "singleton"));
  return NextResponse.json({ settings: row ?? null });
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

  const parsed = settingsUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Payload invalide" }, { status: 422 });
  }

  const [updated] = await db
    .insert(siteSettings)
    .values({ id: "singleton", ...parsed.data, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: siteSettings.id,
      set: { ...parsed.data, updatedAt: new Date() },
    })
    .returning();

  return NextResponse.json({ settings: updated });
}
