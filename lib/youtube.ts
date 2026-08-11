/**
 * Helpers serveur pour résoudre une URL YouTube en métadonnées exploitables.
 * oEmbed (titre, vignette) ne nécessite aucune clé ; la durée exacte passe
 * par la Data API v3 et nécessite YOUTUBE_API_KEY.
 */

const YOUTUBE_ID_PATTERNS = [
  /(?:youtube\.com\/watch\?v=)([\w-]{11})/,
  /(?:youtube\.com\/live\/)([\w-]{11})/,
  /(?:youtube\.com\/embed\/)([\w-]{11})/,
  /(?:youtu\.be\/)([\w-]{11})/,
];

/** Accepte une URL YouTube complète (watch/live/embed/youtu.be) ou un ID brut de 11 caractères. */
export function extractYoutubeId(input: string): string | null {
  const trimmed = input.trim();
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed;
  for (const pattern of YOUTUBE_ID_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/** Vignette YouTube — `quality` par défaut `hqdefault` (480×360), `mqdefault` (320×180) pour les aperçus compacts. */
export function buildYoutubeThumbnailUrl(id: string, quality: "hqdefault" | "mqdefault" = "hqdefault"): string {
  return `https://img.youtube.com/vi/${id}/${quality}.jpg`;
}

export function buildYoutubeWatchUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}

export function buildYoutubeLiveEmbedUrl(channelId: string): string {
  return `https://www.youtube.com/embed/live_stream?channel=${channelId}&autoplay=1`;
}

export const YOUTUBE_IFRAME_API_SRC = "https://www.youtube.com/iframe_api";

export interface YoutubeOembedResult {
  title: string;
  thumbnailUrl: string;
}

export async function fetchYoutubeOembed(id: string): Promise<YoutubeOembedResult | null> {
  const url = `https://www.youtube.com/oembed?url=${encodeURIComponent(buildYoutubeWatchUrl(id))}&format=json`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  return { title: data.title, thumbnailUrl: buildYoutubeThumbnailUrl(id) };
}

/** Parse une durée ISO-8601 (ex. "PT1H12M4S") en secondes. */
export function parseIsoDuration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  const seconds = Number(match[3] ?? 0);
  return hours * 3600 + minutes * 60 + seconds;
}

/** Formate un nombre de secondes en "H:MM:SS" (ou "MM:SS" sous l'heure), convention déjà utilisée par `Teaching.duration`. */
export function formatDurationString(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/** Parse "H:MM:SS" ou "MM:SS" (ou un nombre brut de secondes) en secondes — inverse de `formatDurationString`. */
export function parseTimeToSeconds(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (/^\d+$/.test(trimmed)) return Number(trimmed);

  const parts = trimmed.split(":").map((p) => p.trim());
  if (parts.length < 2 || parts.length > 3 || parts.some((p) => !/^\d+$/.test(p))) return null;

  const nums = parts.map(Number);
  if (nums.length === 2) return nums[0] * 60 + nums[1];
  return nums[0] * 3600 + nums[1] * 60 + nums[2];
}

export interface YoutubeDurationResult {
  duration: string;
  durationSeconds: number;
}

/**
 * Nécessite YOUTUBE_API_KEY — retourne null si la vidéo est introuvable, la clé absente, ou la
 * durée pas encore disponible. Cas fréquent juste après un direct : YouTube renvoie une durée
 * à "PT0S" (ou "P0D", hors du format PT.. donc non reconnu par parseIsoDuration) tant qu'il n'a
 * pas fini de traiter la vidéo — on traite ce cas comme "pas encore disponible" plutôt que
 * d'enregistrer silencieusement une durée de 0, qui casse la barre de progression et les
 * boutons de saut côté lecteur (voir components/bibliotheque/TeachingPlayer.tsx).
 */
export async function fetchYoutubeDuration(id: string): Promise<YoutubeDurationResult | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return null;

  const url = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${id}&key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const iso = data.items?.[0]?.contentDetails?.duration;
  if (!iso) return null;

  const durationSeconds = parseIsoDuration(iso);
  if (durationSeconds <= 0) return null;
  return { duration: formatDurationString(durationSeconds), durationSeconds };
}

/**
 * Nombre de vues réelles d'une vidéo YouTube. Nécessite YOUTUBE_API_KEY — retourne null si la
 * clé est absente, l'appel échoue, ou la vidéo est introuvable (repli sur la dernière valeur
 * connue côté appelant). `videos.list?part=statistics` coûte 1 unité de quota — cache 1h,
 * largement suffisant pour un compteur de vues (pas besoin de fraîcheur à la minute).
 */
export async function fetchYoutubeViewCount(videoId: string): Promise<number | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return null;

  try {
    const url = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}&key=${apiKey}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();
    const count = data.items?.[0]?.statistics?.viewCount;
    return count !== undefined ? Number(count) : null;
  } catch {
    return null;
  }
}

export interface YoutubeLiveCheckResult {
  isLive: boolean;
  videoId?: string;
  title?: string;
  viewers?: number;
  startedAt?: Date;
}

/** Budget de quota quotidien réservé à la détection de direct (unités YouTube — plafond gratuit : 10 000/jour). */
const LIVE_CHECK_DAILY_UNIT_BUDGET = 9500;
/** Coût d'un cycle de vérification complet (search.list + videos.list) en unités de quota. */
const LIVE_CHECK_UNIT_COST = 101;
const MIN_REVALIDATE_SECONDS = 300;
const DEFAULT_REVALIDATE_SECONDS = 900;

/**
 * Calcule l'intervalle de cache (secondes) à partir du nombre d'heures actives par jour
 * (24 − heures creuses configurées dans /admin/paramètres), pour rester sous le budget
 * de quota même en heures creuses désactivées. Plus il y a d'heures creuses, plus
 * l'intervalle se resserre pendant les heures actives, sans jamais dépasser le quota.
 */
export function computeLiveCheckRevalidateSeconds(activeHoursPerDay: number): number {
  const clamped = Math.max(1, Math.min(24, activeHoursPerDay));
  const maxCallsPerDay = LIVE_CHECK_DAILY_UNIT_BUDGET / LIVE_CHECK_UNIT_COST;
  const seconds = Math.floor((clamped * 3600) / maxCallsPerDay);
  return Math.max(MIN_REVALIDATE_SECONDS, seconds || DEFAULT_REVALIDATE_SECONDS);
}

/**
 * Détecte si une chaîne diffuse actuellement en direct, via la Data API v3.
 * Nécessite YOUTUBE_API_KEY — retourne `null` (pas `{isLive:false}`) si la clé est
 * absente ou si l'appel échoue, pour que l'appelant puisse distinguer « pas de live »
 * de « impossible de vérifier » et se replier sur un statut géré manuellement.
 *
 * `search.list` (eventType=live) coûte 100 unités + ~1 unité pour le détail vidéo, sur
 * les 10 000/jour du quota gratuit par défaut. `revalidateSeconds` (calculé par
 * `computeLiveCheckRevalidateSeconds` à partir des heures creuses configurées) borne le
 * nombre d'appels réels par jour pour ne jamais dépasser le quota — en dessous de ce
 * plancher, le quota peut s'épuiser en cours de journée et désactiver la détection
 * automatique (repli manuel silencieux) pour le reste de la journée, y compris
 * potentiellement pendant le direct lui-même. Pour aller plus vite sans ce risque,
 * demander une augmentation de quota (gratuite) dans Google Cloud Console → API et
 * services → YouTube Data API v3 → Quotas.
 */
export async function fetchYoutubeLiveStatus(
  channelId: string,
  revalidateSeconds: number = DEFAULT_REVALIDATE_SECONDS
): Promise<YoutubeLiveCheckResult | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return null;

  try {
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=live&type=video&key=${apiKey}`;
    const searchRes = await fetch(searchUrl, { next: { revalidate: revalidateSeconds } });
    if (!searchRes.ok) return null;
    const searchData = await searchRes.json();
    const videoId: string | undefined = searchData.items?.[0]?.id?.videoId;
    if (!videoId) return { isLive: false };

    const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails&id=${videoId}&key=${apiKey}`;
    const detailsRes = await fetch(detailsUrl, { next: { revalidate: revalidateSeconds } });
    if (!detailsRes.ok) return { isLive: true, videoId };
    const detailsData = await detailsRes.json();
    const video = detailsData.items?.[0];
    const streaming = video?.liveStreamingDetails;

    return {
      isLive: true,
      videoId,
      title: video?.snippet?.title,
      viewers: streaming?.concurrentViewers !== undefined ? Number(streaming.concurrentViewers) : undefined,
      startedAt: streaming?.actualStartTime ? new Date(streaming.actualStartTime) : undefined,
    };
  } catch {
    return null;
  }
}
