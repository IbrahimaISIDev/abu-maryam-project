import type { AgendaStatus } from "@/lib/types";

/**
 * Statut calculé à partir des dates plutôt qu'un booléen `isUpcoming` saisi à
 * la main en admin — évite qu'un oubli de bascule affiche un événement passé
 * comme "à venir" indéfiniment.
 */
export function computeAgendaStatus(item: { dateStart: string; dateEnd?: string | null }): AgendaStatus {
  const now = Date.now();
  const start = new Date(item.dateStart).getTime();
  const end = item.dateEnd ? new Date(item.dateEnd).getTime() : start;

  if (now < start) return "upcoming";
  if (now <= end) return "live";
  return "past";
}

/** Nombre de jours (arrondi au-dessus) entre maintenant et une date ISO. */
export function daysUntil(dateIso: string): number {
  return Math.ceil((new Date(dateIso).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}
