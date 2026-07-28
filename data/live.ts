import type { LiveStatus, Replay, ScheduleItem } from "@/lib/types";

export const liveStatus: LiveStatus = {
  isLive: true,
  title: "Dars du soir — La place d'Allah dans nos cœurs",
  arabicVerse: "مكانة الله في قلوبنا",
  viewers: 1248,
  streamUrl: null,
  youtubeChannelId: "UCiMv6OE5QEAZsGVaqJUuhYg", // Oustaz Niang Mbaye TV officiel
  startedAt: "2026-07-15T20:30:00",
  hostName: "Oustaz Niang Mbaye (H.A)",
  description:
    "Une leçon du soir sur la nécessité d'ancrer l'amour d'Allah au cœur de nos vies, en s'appuyant sur le Qur'an et les enseignements authentiques de la Sunna.",
};

export const replays: Replay[] = [
  {
    id: "r1",
    title: "Tafsir Sourate Qâf",
    thumbnail: null,
    daysAgo: 2,
  },
  {
    id: "r2",
    title: "L'appel au Tawhîd pur",
    thumbnail: null,
    daysAgo: 5,
  },
  {
    id: "r3",
    title: "La persévérance dans la Sunna",
    thumbnail: null,
    daysAgo: 7,
  },
];

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
