import {
  pgTable,
  pgEnum,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

export const contentTypeEnum = pgEnum("content_type", ["video", "audio"]);
export const languageEnum = pgEnum("language", ["wolof", "arabe"]);
export const themeEnum = pgEnum("theme", [
  "tafsir",
  "tawhid",
  "akhlaq",
  "salat",
  "famille",
  "sunna",
  "sahaba",
  "khoutba",
  "conférence",
  "rappel",
]);
export const difficultyLevelEnum = pgEnum("difficulty_level", [
  "débutant",
  "intermédiaire",
  "avancé",
]);
export const agendaTypeEnum = pgEnum("agenda_type", [
  "séminaire",
  "conférence",
  "khoutba",
  "cours",
  "tafsir",
]);
export const registrationStatusEnum = pgEnum("registration_status", [
  "confirmed",
  "pending",
  "cancelled",
]);
export const paymentStatusEnum = pgEnum("payment_status", ["paid", "unpaid", "free"]);
export const registrationModeEnum = pgEnum("registration_mode", ["presentiel", "ligne"]);
export const questionStatusEnum = pgEnum("question_status", [
  "pending",
  "answered",
  "archived",
]);

export const series = pgTable("series", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  theme: themeEnum("theme").notNull(),
  language: languageEnum("language").notNull(),
  totalEpisodes: integer("total_episodes").notNull().default(0),
  arabicVerse: text("arabic_verse"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Chapitres stockés en jsonb (tableau {label, timeSeconds}) — pas de table
// enfant : aucun besoin de requêter les chapitres indépendamment d'un teaching.
export interface ChapterJson {
  label: string;
  timeSeconds: number;
}

export const teachings = pgTable("teachings", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  titleAr: text("title_ar"),
  type: contentTypeEnum("type").notNull(),
  theme: themeEnum("theme").notNull(),
  language: languageEnum("language").notNull(),
  duration: text("duration").notNull(),
  durationSeconds: integer("duration_seconds").notNull().default(0),
  thumbnail: text("thumbnail"),
  // Vidéo : `youtubeId` (hébergement YouTube) OU `videoUrl` (fichier auto-hébergé,
  // typiquement R2 — voir lib/r2.ts) selon le choix fait à la création. Audio : `audioUrl` seul.
  youtubeId: text("youtube_id"),
  videoUrl: text("video_url"),
  audioUrl: text("audio_url"),
  publishedAt: timestamp("published_at").notNull().defaultNow(),
  published: boolean("published").notNull().default(true),
  description: text("description"),
  descriptionAr: text("description_ar"),
  seriesId: text("series_id").references((): typeof series.id => series.id, {
    onDelete: "set null",
  }),
  episodeNumber: integer("episode_number"),
  // Rattache un enseignement à un événement/activité de l'agenda (ex. les vidéos
  // filmées pendant un séminaire) — indépendant de seriesId (regroupement thématique).
  agendaItemId: text("agenda_item_id").references((): typeof agendaItems.id => agendaItems.id, {
    onDelete: "set null",
  }),
  level: difficultyLevelEnum("level"),
  arabicVerse: text("arabic_verse"),
  chapters: jsonb("chapters").$type<ChapterJson[]>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const replays = pgTable("replays", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  thumbnail: text("thumbnail"),
  youtubeId: text("youtube_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const agendaItems = pgTable("agenda_items", {
  id: text("id").primaryKey(),
  type: agendaTypeEnum("type").notNull(),
  title: text("title").notNull(),
  location: text("location").notNull(),
  dateStart: timestamp("date_start").notNull(),
  dateEnd: timestamp("date_end"),
  registrationDeadline: timestamp("registration_deadline"),
  totalPlaces: integer("total_places"),
  remainingPlaces: integer("remaining_places"),
  isFeatured: boolean("is_featured").notNull().default(false),
  ctaLabel: text("cta_label"),
  // Préparé pour la Phase E : relie un item passé à son replay pour un lien "Voir le replay".
  replayId: text("replay_id").references((): typeof replays.id => replays.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Table singleton (une seule ligne, id fixe "singleton") — pas de pattern
// clé-valeur générique nécessaire pour une seule config.
export const liveStatus = pgTable("live_status", {
  id: text("id").primaryKey().default("singleton"),
  isLive: boolean("is_live").notNull().default(false),
  title: text("title").notNull().default(""),
  arabicVerse: text("arabic_verse").notNull().default(""),
  viewers: integer("viewers").notNull().default(0),
  streamUrl: text("stream_url"),
  youtubeChannelId: text("youtube_channel_id"),
  startedAt: timestamp("started_at"),
  hostName: text("host_name").notNull().default(""),
  description: text("description").notNull().default(""),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const seminars = pgTable("seminars", {
  id: text("id").primaryKey(),
  arabicVerse: text("arabic_verse").notNull(),
  edition: text("edition").notNull(),
  label: text("label").notNull(),
  labelShort: text("label_short").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  dateStart: timestamp("date_start").notNull(),
  dateEnd: timestamp("date_end").notNull(),
  registrationDeadline: timestamp("registration_deadline").notNull(),
  location: text("location").notNull(),
  price: text("price").notNull(),
  priceNote: text("price_note"),
  contactPhone: text("contact_phone"),
  contactPhoneNote: text("contact_phone_note"),
  contactEmail: text("contact_email"),
  totalPlaces: integer("total_places").notNull().default(0),
  remainingPlaces: integer("remaining_places").notNull().default(0),
  perks: jsonb("perks").$type<string[]>(),
  targetAudience: text("target_audience"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const registrations = pgTable("registrations", {
  id: text("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().default(""),
  phone: text("phone").notNull(),
  city: text("city").notNull().default(""),
  registeredAt: timestamp("registered_at").notNull().defaultNow(),
  status: registrationStatusEnum("status").notNull().default("pending"),
  paymentStatus: paymentStatusEnum("payment_status").notNull().default("unpaid"),
  notes: text("notes"),
  ageRange: text("age_range"),
  mode: registrationModeEnum("mode"),
  message: text("message"),
});

export const adminUsers = pgTable("admin_users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull().default("Administrateur"),
  // Format "salt:hash" (scrypt, node:crypto) — voir lib/passwordHash.ts.
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Table singleton (une seule ligne, id fixe "singleton"), même pattern que live_status.
export const siteSettings = pgTable("site_settings", {
  id: text("id").primaryKey().default("singleton"),
  siteName: text("site_name").notNull().default("Abu Maryam TV"),
  siteDescription: text("site_description").notNull().default(""),
  notifyByEmail: boolean("notify_by_email").notNull().default(true),
  notifyByWhatsapp: boolean("notify_by_whatsapp").notNull().default(false),
  showDailyVerse: boolean("show_daily_verse").notNull().default(false),
  // Détection automatique du direct YouTube (lib/youtube.ts) — coupe-circuit général
  // (ex. période sans activité prévue : vacances, voyage...) et plages d'heures creuses
  // (0-23, heure du Sénégal = UTC) pendant lesquelles l'API n'est pas interrogée, pour
  // économiser le quota gratuit et resserrer l'intervalle de vérification le reste du
  // temps. Plusieurs plages possibles (ex. nuit + après-midi calme).
  liveCheckEnabled: boolean("live_check_enabled").notNull().default(true),
  liveCheckQuietHours: jsonb("live_check_quiet_hours")
    .$type<{ start: number; end: number }[]>()
    .notNull()
    .default([{ start: 0, end: 5 }]),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const questions = pgTable("questions", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  theme: themeEnum("theme").notNull().default("rappel"),
  questionText: text("question_text").notNull(),
  status: questionStatusEnum("status").notNull().default("pending"),
  answerNote: text("answer_note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
