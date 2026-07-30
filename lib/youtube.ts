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

export interface YoutubeOembedResult {
  title: string;
  thumbnailUrl: string;
}

export async function fetchYoutubeOembed(id: string): Promise<YoutubeOembedResult | null> {
  const url = `https://www.youtube.com/oembed?url=${encodeURIComponent(
    `https://www.youtube.com/watch?v=${id}`
  )}&format=json`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  return { title: data.title, thumbnailUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg` };
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

export interface YoutubeDurationResult {
  duration: string;
  durationSeconds: number;
}

/** Nécessite YOUTUBE_API_KEY — retourne null si la vidéo est introuvable ou la clé absente. */
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
  return { duration: formatDurationString(durationSeconds), durationSeconds };
}
