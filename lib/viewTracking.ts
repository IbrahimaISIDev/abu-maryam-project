"use client";

import { apiRoutes } from "@/lib/api-routes";

const STORAGE_PREFIX = "am-viewed-";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Enregistre une vue plateforme pour un enseignement, une fois par visiteur par jour
 * (localStorage — pas de compte utilisateur sur ce site). Appelé pour tout type de contenu,
 * YouTube compris — voir incrementTeachingViews côté serveur pour le détail de ce qui est
 * mis à jour selon le type. Volontairement silencieux en cas d'échec (fetch, quota
 * localStorage…) — un compteur de vues n'a pas besoin de faire planter la lecture.
 */
export function registerView(teachingId: string): void {
  if (typeof window === "undefined") return;
  const key = `${STORAGE_PREFIX}${teachingId}`;
  try {
    if (localStorage.getItem(key) === today()) return;
    localStorage.setItem(key, today());
  } catch {
    // localStorage indisponible (navigation privée stricte, quota…) — on tente quand même
    // l'appel une fois, sans pouvoir dédoublonner localement.
  }
  fetch(apiRoutes.teachingView(teachingId), { method: "POST" }).catch(() => {});
}
