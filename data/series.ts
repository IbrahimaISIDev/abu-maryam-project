import type { Series } from "@/lib/types";

export const seriesList: Series[] = [
  {
    id: "tafsir-al-kahf",
    title: "Tafsir Sourate Al-Kahf",
    description:
      "Explication complète de la sourate Al-Kahf verset par verset, avec les enseignements tirés de chaque passage.",
    theme: "tafsir",
    language: "wolof",
    totalEpisodes: 4,
    arabicVerse: "وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا",
  },
  {
    id: "usul-tawhid",
    title: "Fondements du Tawhîd",
    description:
      "Série d'introduction à la connaissance d'Allah — les noms, attributs et unicité divine selon les textes authentiques.",
    theme: "tawhid",
    language: "français",
    totalEpisodes: 3,
    arabicVerse: "قُلْ هُوَ اللَّهُ أَحَدٌ",
  },
  {
    id: "hayatu-sahaba",
    title: "Hayâtu Sahaba",
    description:
      "Vie et biographies des Compagnons du Prophète — leurs vertus, sacrifices et enseignements pour aujourd'hui.",
    theme: "sahaba",
    language: "wolof",
    totalEpisodes: 3,
  },
];

export function getSeriesById(id: string): Series | undefined {
  return seriesList.find((s) => s.id === id);
}
