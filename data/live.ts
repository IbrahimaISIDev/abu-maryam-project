import type { ScheduleItem } from "@/lib/types";

// Programme hebdomadaire récurrent — reste statique (pas de table dédiée,
// contrairement au statut live et aux replays qui vivent en base).
export const schedule: ScheduleItem[] = [
  {
    dayShort: "Ven",
    time: "13h",
    title: "Khoutba du Vendredi",
    subtitle: "Sermon hebdomadaire",
  },
  {
    dayShort: "Sam",
    time: "21h",
    title: "Tafsir — Sourate Yâ-Sîn",
    subtitle: "Série hebdomadaire",
  },
  {
    dayShort: "Dim",
    time: "20h",
    title: "Hayâtu Sahaba",
    subtitle: "Vie des Compagnons",
  },
];
