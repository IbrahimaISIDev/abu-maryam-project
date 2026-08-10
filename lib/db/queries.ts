import { cache } from "react";
import { eq, and, ne, asc, desc, sql } from "drizzle-orm";
import { db } from "./client";
import { teachings, series, agendaItems, liveStatus, seminars, replays, registrations, siteSettings } from "./schema";
import type { Teaching, Series, AgendaItem, LiveStatus, Replay, Seminar, Registration, Theme } from "@/lib/types";
import { fetchYoutubeLiveStatus, computeLiveCheckRevalidateSeconds, buildYoutubeWatchUrl } from "@/lib/youtube";

function toTeaching(row: typeof teachings.$inferSelect): Teaching {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    theme: row.theme,
    language: row.language,
    duration: row.duration,
    durationSeconds: row.durationSeconds,
    thumbnail: row.thumbnail,
    youtubeId: row.youtubeId,
    videoUrl: row.videoUrl,
    audioUrl: row.audioUrl,
    publishedAt: row.publishedAt.toISOString().slice(0, 10),
    published: row.published,
    description: row.description ?? undefined,
    seriesId: row.seriesId,
    episodeNumber: row.episodeNumber,
    agendaItemId: row.agendaItemId,
    level: row.level,
    arabicVerse: row.arabicVerse,
    chapters: row.chapters,
  };
}

function toSeries(row: typeof series.$inferSelect): Series {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    theme: row.theme,
    language: row.language,
    totalEpisodes: row.totalEpisodes,
    arabicVerse: row.arabicVerse ?? undefined,
  };
}

function toAgendaItem(row: typeof agendaItems.$inferSelect): AgendaItem {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    location: row.location,
    dateStart: row.dateStart.toISOString().slice(0, 10),
    dateEnd: row.dateEnd?.toISOString().slice(0, 10) ?? null,
    registrationDeadline: row.registrationDeadline?.toISOString().slice(0, 10) ?? null,
    totalPlaces: row.totalPlaces,
    remainingPlaces: row.remainingPlaces,
    isFeatured: row.isFeatured,
    ctaLabel: row.ctaLabel,
    replayId: row.replayId,
  };
}

function toLiveStatus(row: typeof liveStatus.$inferSelect): LiveStatus {
  const startedAt = row.startedAt?.toISOString() ?? null;
  return {
    isLive: row.isLive,
    title: row.title,
    arabicVerse: row.arabicVerse,
    viewers: row.viewers,
    streamUrl: row.streamUrl,
    youtubeChannelId: row.youtubeChannelId,
    startedAt,
    startedMinutesAgo: minutesSince(startedAt),
    hostName: row.hostName,
    description: row.description,
  };
}

/** Calcul dérivé côté requêtes (pas dans un composant) — voir `toReplay` pour le même principe avec `daysAgo`. */
function minutesSince(iso: string | null): number | null {
  if (!iso) return null;
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60_000));
}

function toSeminar(row: typeof seminars.$inferSelect): Seminar {
  return {
    id: row.id,
    arabicVerse: row.arabicVerse,
    edition: row.edition,
    label: row.label,
    labelShort: row.labelShort,
    title: row.title,
    description: row.description,
    dateStart: row.dateStart.toISOString().slice(0, 10),
    dateEnd: row.dateEnd.toISOString().slice(0, 10),
    registrationDeadline: row.registrationDeadline.toISOString().slice(0, 10),
    location: row.location,
    price: row.price,
    priceNote: row.priceNote,
    contactPhone: row.contactPhone,
    contactPhoneNote: row.contactPhoneNote,
    contactEmail: row.contactEmail,
    totalPlaces: row.totalPlaces,
    remainingPlaces: row.remainingPlaces,
    perks: row.perks,
    targetAudience: row.targetAudience,
  };
}

function toReplay(row: typeof replays.$inferSelect): Replay {
  const daysAgo = Math.max(0, Math.floor((Date.now() - row.createdAt.getTime()) / 86_400_000));
  return { id: row.id, title: row.title, thumbnail: row.thumbnail, youtubeId: row.youtubeId, daysAgo };
}

export const getTeachingsCount = cache(async (): Promise<number> => {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(teachings)
    .where(eq(teachings.published, true));
  return row?.count ?? 0;
});

export const getAllTeachings = cache(async (): Promise<Teaching[]> => {
  const rows = await db
    .select()
    .from(teachings)
    .where(eq(teachings.published, true))
    .orderBy(desc(teachings.publishedAt));
  return rows.map(toTeaching);
});

/** Inclut les brouillons — usage admin uniquement. */
export const getAllTeachingsAdmin = cache(async (): Promise<Teaching[]> => {
  const rows = await db.select().from(teachings).orderBy(desc(teachings.publishedAt));
  return rows.map(toTeaching);
});

export const getTeachingById = cache(async (id: string): Promise<Teaching | undefined> => {
  const [row] = await db.select().from(teachings).where(eq(teachings.id, id));
  return row ? toTeaching(row) : undefined;
});

export const getSeriesEpisodes = cache(async (seriesId: string): Promise<Teaching[]> => {
  const rows = await db
    .select()
    .from(teachings)
    .where(and(eq(teachings.seriesId, seriesId), eq(teachings.published, true)))
    .orderBy(asc(teachings.episodeNumber));
  return rows.map(toTeaching);
});

export const getRelatedTeachings = cache(
  async (teaching: Teaching, limit = 4): Promise<Teaching[]> => {
    const rows = await db
      .select()
      .from(teachings)
      .where(
        and(
          eq(teachings.theme, teaching.theme),
          eq(teachings.published, true),
          ne(teachings.id, teaching.id)
        )
      )
      .limit(limit);
    return rows.map(toTeaching);
  }
);

export const getAllSeries = cache(async (): Promise<Series[]> => {
  const rows = await db.select().from(series);
  return rows.map(toSeries);
});

export const getSeriesById = cache(async (id: string): Promise<Series | undefined> => {
  const [row] = await db.select().from(series).where(eq(series.id, id));
  return row ? toSeries(row) : undefined;
});

export const getThemeCounts = cache(async (): Promise<Partial<Record<Theme, number>>> => {
  const rows = await db
    .select({ theme: teachings.theme, count: sql<number>`count(*)::int` })
    .from(teachings)
    .where(eq(teachings.published, true))
    .groupBy(teachings.theme);
  const map: Partial<Record<Theme, number>> = {};
  for (const r of rows) map[r.theme] = r.count;
  return map;
});

/** Heure courante (0-23, Sénégal = UTC, pas de DST) au sein d'une ou plusieurs plages « heures creuses ». Gère le passage à minuit (ex. {start:22,end:6}). */
function isWithinQuietHours(ranges: { start: number; end: number }[], hour: number): boolean {
  return ranges.some(({ start, end }) =>
    start < end ? hour >= start && hour < end : hour >= start || hour < end
  );
}

/** Somme des heures couvertes par les plages « heures creuses » (approximation par excès si des plages se chevauchent — sans risque, ça ne fait que resserrer l'intervalle de vérification). */
function totalQuietHours(ranges: { start: number; end: number }[]): number {
  const sum = ranges.reduce((acc, { start, end }) => acc + (start < end ? end - start : 24 - start + end), 0);
  return Math.min(24, sum);
}

/**
 * Statut « en direct » effectif. La ligne en base (via /admin/direct) reste la source des
 * champs éditoriaux (hôte, verset, description) et sert de repli manuel pour `isLive` —
 * mais si un youtubeChannelId est renseigné et que YOUTUBE_API_KEY est configurée, le
 * statut réel (live ou non, titre, spectateurs, heure de début) est vérifié auprès de
 * YouTube et prend le dessus. En cas de clé absente, de coupure manuelle
 * (site_settings.live_check_enabled), d'heure creuse configurée, ou d'erreur réseau, on
 * retombe silencieusement sur le toggle manuel — jamais de page cassée pour ça.
 */
export const getLiveStatus = cache(async (): Promise<LiveStatus> => {
  const [row] = await db.select().from(liveStatus).where(eq(liveStatus.id, "singleton"));
  const manual: LiveStatus = row
    ? toLiveStatus(row)
    : {
        isLive: false,
        title: "",
        arabicVerse: "",
        viewers: 0,
        streamUrl: null,
        youtubeChannelId: null,
        startedAt: null,
        startedMinutesAgo: null,
        hostName: "",
        description: "",
      };

  if (!manual.youtubeChannelId) return manual;

  const [settingsRow] = await db.select().from(siteSettings).where(eq(siteSettings.id, "singleton"));
  if (settingsRow && !settingsRow.liveCheckEnabled) return manual; // désactivé (ex. aucune activité prévue)
  const currentHour = new Date().getUTCHours();
  if (settingsRow && isWithinQuietHours(settingsRow.liveCheckQuietHours, currentHour)) return manual;

  const activeHours = settingsRow ? 24 - totalQuietHours(settingsRow.liveCheckQuietHours) : 19;
  const revalidateSeconds = computeLiveCheckRevalidateSeconds(activeHours);
  const live = await fetchYoutubeLiveStatus(manual.youtubeChannelId, revalidateSeconds);
  if (!live) return manual; // clé absente ou vérification impossible — repli manuel
  if (!live.isLive) return { ...manual, isLive: false };

  const startedAt = live.startedAt ? live.startedAt.toISOString() : manual.startedAt;
  return {
    ...manual,
    isLive: true,
    title: live.title || manual.title,
    viewers: live.viewers ?? manual.viewers,
    startedAt,
    startedMinutesAgo: minutesSince(startedAt),
    streamUrl: live.videoId ? buildYoutubeWatchUrl(live.videoId) : manual.streamUrl,
  };
});

export const getReplays = cache(async (): Promise<Replay[]> => {
  const rows = await db.select().from(replays).orderBy(asc(replays.createdAt));
  return rows.map(toReplay);
});

export const getAgendaItems = cache(async (): Promise<AgendaItem[]> => {
  const rows = await db.select().from(agendaItems).orderBy(asc(agendaItems.dateStart));
  return rows.map(toAgendaItem);
});

export const getSeminar = cache(async (): Promise<Seminar | undefined> => {
  const [row] = await db.select().from(seminars).limit(1);
  return row ? toSeminar(row) : undefined;
});

export const getRegistrations = cache(async (): Promise<Registration[]> => {
  const rows = await db.select().from(registrations).orderBy(desc(registrations.registeredAt));
  return rows.map((r) => ({
    id: r.id,
    fullName: r.fullName,
    email: r.email,
    phone: r.phone,
    city: r.city,
    registeredAt: r.registeredAt.toISOString(),
    status: r.status,
    paymentStatus: r.paymentStatus,
    notes: r.notes ?? undefined,
    ageRange: r.ageRange ?? undefined,
    mode: r.mode ?? undefined,
    message: r.message ?? undefined,
  }));
});

export const getSiteSettings = cache(async () => {
  const [row] = await db.select().from(siteSettings).where(eq(siteSettings.id, "singleton"));
  return row ?? null;
});
