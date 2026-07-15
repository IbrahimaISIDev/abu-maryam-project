export type ContentType = "video" | "audio";
export type Language = "wolof" | "arabe" | "français";
export type Theme =
  | "tafsir"
  | "tawhid"
  | "akhlaq"
  | "salat"
  | "famille"
  | "sunna"
  | "sahaba"
  | "khoutba"
  | "conférence";

export type DifficultyLevel = "débutant" | "intermédiaire" | "avancé";

export interface Series {
  id: string;
  title: string;
  description: string;
  theme: Theme;
  language: Language;
  totalEpisodes: number;
  arabicVerse?: string;
}

export interface Teaching {
  id: string;
  title: string;
  type: ContentType;
  theme: Theme;
  language: Language;
  duration: string;          // "1:12:04"
  durationSeconds: number;   // pour la progression
  thumbnail: string | null;
  mediaUrl: string | null;   // YouTube video ID ou URL directe
  publishedAt: string;       // ISO date string
  published?: boolean;       // true = visible public, false = brouillon
  description?: string;
  seriesId?: string;
  episodeNumber?: number;
  level?: DifficultyLevel;
  arabicVerse?: string;
}

export interface LiveStatus {
  isLive: boolean;
  title: string;
  arabicVerse: string;
  viewers: number;
  streamUrl: string | null;
  youtubeChannelId: string | null;
  startedAt: string | null;
  hostName: string;
  description: string;
}

export interface Replay {
  id: string;
  title: string;
  thumbnail: string | null;
  daysAgo: number;
}

export interface ScheduleItem {
  dayShort: string;
  time: string;
  title: string;
  subtitle: string;
}

export interface AgendaItem {
  id: string;
  type: "séminaire" | "conférence" | "khoutba" | "cours" | "tafsir";
  title: string;
  location: string;
  dateStart: string;
  dateEnd?: string;
  registrationDeadline?: string;
  totalPlaces?: number;
  remainingPlaces?: number;
  isUpcoming: boolean;
  isFeatured: boolean;
  ctaLabel?: string;
}

export interface ThemeItem {
  id: Theme;
  arabicLetter: string;
  labelFr: string;
  count: number;
}

export interface FormState {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  city: string;
  ageRange: string;
  mode: "presentiel" | "ligne";
  message: string;
  consent: boolean;
}

export type SubmitStatus = "idle" | "loading" | "success" | "error";

// Progression (localStorage)
export interface TeachingProgress {
  teachingId: string;
  positionSeconds: number;
  completed: boolean;
  lastPlayedAt: string;
}

// État global du mini-player
export interface PlayerState {
  teaching: Teaching | null;
  isPlaying: boolean;
  positionSeconds: number;
}
