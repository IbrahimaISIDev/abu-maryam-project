"use client";

import { apiRoutes } from "@/lib/api-routes";

/**
 * Auto-correction silencieuse de la durée stockée, dès qu'un média charge réellement dans le
 * lecteur — que la durée initiale ait été manquante (ex. juste après un direct, avant que
 * YouTube ait fini de traiter la vidéo) ou simplement fausse. Le lecteur connaît toujours la
 * vraie durée ; pas besoin qu'un admin y repense. Pas d'appel si l'écart est déjà négligeable,
 * pour ne pas écrire à chaque lecture une fois la valeur correcte.
 */
export function syncDurationIfNeeded(
  teachingId: string,
  storedDurationSeconds: number,
  realDurationSeconds: number
): void {
  if (!Number.isFinite(realDurationSeconds) || realDurationSeconds <= 0) return;
  if (Math.abs(Math.round(realDurationSeconds) - storedDurationSeconds) < 2) return;

  fetch(apiRoutes.teachingDuration(teachingId), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ durationSeconds: Math.round(realDurationSeconds) }),
  }).catch(() => {});
}
