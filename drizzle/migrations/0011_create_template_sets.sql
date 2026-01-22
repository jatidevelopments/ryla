-- Migration: Create template sets tables
-- Epic: EP-046 (Template Sets Data Model & API)
-- Initiative: IN-011 (Template Gallery & Content Library)
-- Date: 2026-01-19

-- Create content type enum for template sets
CREATE TYPE "template_set_content_type" AS ENUM ('image', 'video', 'lip_sync', 'audio', 'mixed');
--> statement-breakpoint

-- Create template_sets table
CREATE TABLE "template_sets" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "description" text,
  "preview_image_url" text,
  "thumbnail_url" text,
  "is_public" boolean NOT NULL DEFAULT false,
  "is_curated" boolean NOT NULL DEFAULT false,
  "content_type" "template_set_content_type" NOT NULL DEFAULT 'image',
  "likes_count" integer NOT NULL DEFAULT 0,
  "usage_count" integer NOT NULL DEFAULT 0,
  "member_count" integer NOT NULL DEFAULT 0,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);
--> statement-breakpoint

-- Create template_set_members junction table
CREATE TABLE "template_set_members" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "set_id" uuid NOT NULL REFERENCES "template_sets"("id") ON DELETE CASCADE,
  "template_id" uuid NOT NULL REFERENCES "templates"("id") ON DELETE CASCADE,
  "order_position" integer NOT NULL DEFAULT 0,
  "created_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "template_set_members_unique" UNIQUE ("set_id", "template_id")
);
--> statement-breakpoint

-- Create template_set_likes table
CREATE TABLE "template_set_likes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "set_id" uuid NOT NULL REFERENCES "template_sets"("id") ON DELETE CASCADE,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "created_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "template_set_likes_unique" UNIQUE ("set_id", "user_id")
);
--> statement-breakpoint

-- Create indexes for template_sets
CREATE INDEX "template_sets_user_idx" ON "template_sets" ("user_id");
--> statement-breakpoint
CREATE INDEX "template_sets_public_idx" ON "template_sets" ("is_public");
--> statement-breakpoint
CREATE INDEX "template_sets_content_type_idx" ON "template_sets" ("content_type");
--> statement-breakpoint
CREATE INDEX "template_sets_created_at_idx" ON "template_sets" ("created_at");
--> statement-breakpoint
CREATE INDEX "template_sets_usage_count_idx" ON "template_sets" ("usage_count");
--> statement-breakpoint
CREATE INDEX "template_sets_likes_count_idx" ON "template_sets" ("likes_count");
--> statement-breakpoint

-- Create indexes for template_set_members
CREATE INDEX "template_set_members_set_idx" ON "template_set_members" ("set_id");
--> statement-breakpoint
CREATE INDEX "template_set_members_template_idx" ON "template_set_members" ("template_id");
--> statement-breakpoint
CREATE INDEX "template_set_members_order_idx" ON "template_set_members" ("set_id", "order_position");
--> statement-breakpoint

-- Create indexes for template_set_likes
CREATE INDEX "template_set_likes_set_idx" ON "template_set_likes" ("set_id");
--> statement-breakpoint
CREATE INDEX "template_set_likes_user_idx" ON "template_set_likes" ("user_id");
