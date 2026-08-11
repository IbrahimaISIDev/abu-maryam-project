import { NextResponse } from "next/server";
import { incrementTeachingViews } from "@/lib/db/queries";
import { getClientIp } from "@/lib/rateLimit";

// Filet de sécurité serveur contre les scripts qui rejoueraient l'appel — le vrai
// dédoublonnage (une fois par visiteur par jour) est côté client, voir lib/viewTracking.ts.
// En mémoire seulement, comme lib/rateLimit.ts : suffisant pour un seul processus, se
// réinitialise au redémarrage, pas de risque au-delà d'un léger sur-comptage temporaire.
const recentByKey = new Map<string, number>();
const DEDUP_WINDOW_MS = 60 * 60 * 1000; // 1h

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const key = `${getClientIp(req)}:${id}`;
  const now = Date.now();
  const last = recentByKey.get(key);
  if (last && now - last < DEDUP_WINDOW_MS) {
    return NextResponse.json({ ok: true, deduped: true });
  }
  recentByKey.set(key, now);

  const result = await incrementTeachingViews(id);
  if (result === null) {
    // Enseignement inconnu ou brouillon — pas une erreur côté appelant, juste rien à compter ici.
    return NextResponse.json({ ok: false });
  }
  return NextResponse.json({ ok: true, ...result });
}
