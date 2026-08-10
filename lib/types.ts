export type ContentType = "video" | "audio";
export type Language = "wolof" | "arabe";
export type Theme =
  | "tafsir"
  | "tawhid"
  | "akhlaq"
  | "salat"
  | "famille"
  | "sunna"
  | "sahaba"
  | "khoutba"
  | "conférence"
  | "rappel";

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
  titleAr?: string | null;
  type: ContentType;
  theme: Theme;
  language: Language;
  duration: string;          // "1:12:04"
  durationSeconds: number;   // pour la progression
  thumbnail: string | null;
  youtubeId: string | null;  // pour type "video" hébergé sur YouTube
  videoUrl: string | null;   // pour type "video" auto-hébergé (R2)
  audioUrl: string | null;   // pour type "audio"
  publishedAt: string;       // ISO date string
  published?: boolean;       // true = visible public, false = brouillon
  description?: string;
  descriptionAr?: string | null;
  seriesId?: string | null;
  episodeNumber?: number | null;
  agendaItemId?: string | null; // rattache à un événement/activité (ex. vidéos d'un séminaire) — indépendant de seriesId
  level?: DifficultyLevel | null;
  arabicVerse?: string | null;
  chapters?: Chapter[] | null;
}

export interface Chapter {
  label: string;
  timeSeconds: number;
}

export interface LiveStatus {
  isLive: boolean;
  title: string;
  arabicVerse: string;
  viewers: number;
  streamUrl: string | null;
  youtubeChannelId: string | null;
  startedAt: string | null;
  startedMinutesAgo: number | null;
  hostName: string;
  description: string;
}

export interface Replay {
  id: string;
  title: string;
  thumbnail: string | null;
  youtubeId: string | null;
  daysAgo: number;
}

export interface ScheduleItem {
  dayShort: string;
  time: string;
  title: string;
  subtitle: string;
}

export type AgendaStatus = "upcoming" | "live" | "past";

export interface AgendaItem {
  id: string;
  type: "séminaire" | "conférence" | "khoutba" | "cours" | "tafsir";
  title: string;
  location: string;
  dateStart: string;
  dateEnd?: string | null;
  registrationDeadline?: string | null;
  totalPlaces?: number | null;
  remainingPlaces?: number | null;
  isFeatured: boolean;
  ctaLabel?: string | null;
  replayId?: string | null;
}

export interface Seminar {
  id: string;
  arabicVerse: string;
  edition: string;
  label: string;
  labelShort: string;
  title: string;
  description: string;
  dateStart: string;
  dateEnd: string;
  registrationDeadline: string;
  location: string;
  price: string;
  priceNote?: string | null;
  contactPhone?: string | null;
  contactPhoneNote?: string | null;
  contactEmail?: string | null;
  totalPlaces: number;
  remainingPlaces: number;
  perks?: string[] | null;
  targetAudience?: string | null;
}

export interface ThemeItem {
  id: Theme;
  arabicLetter: string;
  labelFr: string;
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
  hasError: boolean;
}

export interface Registration {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  registeredAt: string;
  status: "confirmed" | "pending" | "cancelled";
  paymentStatus: "paid" | "unpaid" | "free";
  notes?: string;
  ageRange?: string;
  mode?: "presentiel" | "ligne";
  message?: string;
}
