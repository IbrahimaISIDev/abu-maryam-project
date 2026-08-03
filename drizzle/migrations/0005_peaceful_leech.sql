CREATE TYPE "public"."question_status" AS ENUM('pending', 'answered', 'archived');--> statement-breakpoint
CREATE TABLE "questions" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"theme" "theme" DEFAULT 'rappel' NOT NULL,
	"question_text" text NOT NULL,
	"status" "question_status" DEFAULT 'pending' NOT NULL,
	"answer_note" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
