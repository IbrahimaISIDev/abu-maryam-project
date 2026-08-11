import { NextResponse } from "next/server";
import { z } from "zod";
import { syncTeachingDuration } from "@/lib/db/queries";

// Pas d'authentification : appelée automatiquement par le lecteur public à la première
// lecture réelle d'un enseignement (voir lib/durationSync.ts). Écriture idempotente et bornée
// (0 < durée ≤ 24h côté schéma Zod, re-vérifiée côté requête) — pas de risque d'abus sérieux.
const durationSchema = z.object({
  durationSeconds: z.number().positive().max(24 * 3600),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const parsed = durationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 422 });
  }

  await syncTeachingDuration(id, parsed.data.durationSeconds);
  return NextResponse.json({ ok: true });
}
