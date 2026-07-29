CREATE TYPE "public"."agenda_type" AS ENUM('séminaire', 'conférence', 'khoutba', 'cours', 'tafsir');--> statement-breakpoint
CREATE TYPE "public"."content_type" AS ENUM('video', 'audio');--> statement-breakpoint
CREATE TYPE "public"."difficulty_level" AS ENUM('débutant', 'intermédiaire', 'avancé');--> statement-breakpoint
CREATE TYPE "public"."language" AS ENUM('wolof', 'arabe');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('paid', 'unpaid', 'free');--> statement-breakpoint
CREATE TYPE "public"."registration_mode" AS ENUM('presentiel', 'ligne');--> statement-breakpoint
CREATE TYPE "public"."registration_status" AS ENUM('confirmed', 'pending', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."theme" AS ENUM('tafsir', 'tawhid', 'akhlaq', 'salat', 'famille', 'sunna', 'sahaba', 'khoutba', 'conférence');--> statement-breakpoint
CREATE TABLE "agenda_items" (
	"id" text PRIMARY KEY NOT NULL,
	"type" "agenda_type" NOT NULL,
	"title" text NOT NULL,
	"location" text NOT NULL,
	"date_start" timestamp NOT NULL,
	"date_end" timestamp,
	"registration_deadline" timestamp,
	"total_places" integer,
	"remaining_places" integer,
	"is_featured" boolean DEFAULT false NOT NULL,
	"cta_label" text,
	"replay_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "live_status" (
	"id" text PRIMARY KEY DEFAULT 'singleton' NOT NULL,
	"is_live" boolean DEFAULT false NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"arabic_verse" text DEFAULT '' NOT NULL,
	"viewers" integer DEFAULT 0 NOT NULL,
	"stream_url" text,
	"youtube_channel_id" text,
	"started_at" timestamp,
	"host_name" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "registrations" (
	"id" text PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"phone" text NOT NULL,
	"city" text DEFAULT '' NOT NULL,
	"registered_at" timestamp DEFAULT now() NOT NULL,
	"status" "registration_status" DEFAULT 'pending' NOT NULL,
	"payment_status" "payment_status" DEFAULT 'unpaid' NOT NULL,
	"notes" text,
	"age_range" text,
	"mode" "registration_mode",
	"message" text
);
--> statement-breakpoint
CREATE TABLE "replays" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"thumbnail" text,
	"youtube_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seminars" (
	"id" text PRIMARY KEY NOT NULL,
	"arabic_verse" text NOT NULL,
	"edition" text NOT NULL,
	"label" text NOT NULL,
	"label_short" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"date_start" timestamp NOT NULL,
	"date_end" timestamp NOT NULL,
	"registration_deadline" timestamp NOT NULL,
	"location" text NOT NULL,
	"price" text NOT NULL,
	"price_note" text,
	"contact_phone" text,
	"contact_phone_note" text,
	"contact_email" text,
	"total_places" integer DEFAULT 0 NOT NULL,
	"remaining_places" integer DEFAULT 0 NOT NULL,
	"perks" jsonb,
	"target_audience" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "series" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"theme" "theme" NOT NULL,
	"language" "language" NOT NULL,
	"total_episodes" integer DEFAULT 0 NOT NULL,
	"arabic_verse" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teachings" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"type" "content_type" NOT NULL,
	"theme" "theme" NOT NULL,
	"language" "language" NOT NULL,
	"duration" text NOT NULL,
	"duration_seconds" integer DEFAULT 0 NOT NULL,
	"thumbnail" text,
	"youtube_id" text,
	"audio_url" text,
	"published_at" timestamp DEFAULT now() NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"description" text,
	"series_id" text,
	"episode_number" integer,
	"level" "difficulty_level",
	"arabic_verse" text,
	"chapters" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "agenda_items" ADD CONSTRAINT "agenda_items_replay_id_replays_id_fk" FOREIGN KEY ("replay_id") REFERENCES "public"."replays"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teachings" ADD CONSTRAINT "teachings_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE set null ON UPDATE no action;