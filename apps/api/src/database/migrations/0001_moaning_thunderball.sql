CREATE TYPE "public"."credit_transaction_type" AS ENUM('subscription_grant', 'purchase', 'generation', 'refund', 'bonus', 'admin_adjustment');--> statement-breakpoint
CREATE TYPE "public"."aspect_ratio" AS ENUM('1:1', '9:16', '2:3');--> statement-breakpoint
CREATE TYPE "public"."environment_preset" AS ENUM('beach', 'home_bedroom', 'home_living_room', 'office', 'cafe', 'urban_street', 'studio');--> statement-breakpoint
CREATE TYPE "public"."quality_mode" AS ENUM('draft', 'hq');--> statement-breakpoint
CREATE TYPE "public"."scene_preset" AS ENUM('professional_portrait', 'candid_lifestyle', 'fashion_editorial', 'fitness_motivation', 'morning_vibes', 'night_out', 'cozy_home', 'beach_day');--> statement-breakpoint
CREATE TYPE "public"."lora_status" AS ENUM('pending', 'training', 'ready', 'failed', 'expired');--> statement-breakpoint
CREATE TYPE "public"."lora_type" AS ENUM('face', 'style', 'pose');--> statement-breakpoint
ALTER TYPE "public"."character_status" ADD VALUE 'training';--> statement-breakpoint
ALTER TYPE "public"."character_status" ADD VALUE 'hd_ready';--> statement-breakpoint
ALTER TYPE "public"."job_type" ADD VALUE 'lora_training';--> statement-breakpoint
ALTER TYPE "public"."job_type" ADD VALUE 'hd_generation';--> statement-breakpoint
ALTER TYPE "public"."job_type" ADD VALUE 'caption_generation';--> statement-breakpoint
CREATE TABLE "credit_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "credit_transaction_type" NOT NULL,
	"amount" integer NOT NULL,
	"balance_after" integer NOT NULL,
	"reference_type" text,
	"reference_id" uuid,
	"description" text,
	"quality_mode" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_credits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"balance" integer DEFAULT 0 NOT NULL,
	"total_earned" integer DEFAULT 0 NOT NULL,
	"total_spent" integer DEFAULT 0 NOT NULL,
	"low_balance_warning_shown" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_credits_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"character_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"job_id" uuid,
	"image_url" text NOT NULL,
	"thumbnail_url" text,
	"s3_key" text NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"caption" text,
	"caption_edited" boolean DEFAULT false,
	"scene" "scene_preset" NOT NULL,
	"environment" "environment_preset" NOT NULL,
	"outfit" text NOT NULL,
	"aspect_ratio" "aspect_ratio" DEFAULT '9:16' NOT NULL,
	"quality_mode" "quality_mode" DEFAULT 'draft' NOT NULL,
	"nsfw" boolean DEFAULT false,
	"prompt" text,
	"negative_prompt" text,
	"seed" text,
	"liked" boolean DEFAULT false,
	"exported" boolean DEFAULT false,
	"exported_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "lora_models" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"character_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "lora_type" DEFAULT 'face' NOT NULL,
	"status" "lora_status" DEFAULT 'pending' NOT NULL,
	"config" jsonb,
	"model_path" text,
	"model_url" text,
	"trigger_word" text,
	"base_model" text,
	"external_job_id" text,
	"external_provider" text,
	"training_steps" integer,
	"training_duration_ms" integer,
	"training_cost" integer,
	"error_message" text,
	"retry_count" integer DEFAULT 0,
	"training_started_at" timestamp,
	"training_completed_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "handle" text;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "lora_status" text;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "lora_model_id" uuid;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "post_count" text DEFAULT '0';--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "liked_count" text DEFAULT '0';--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "generation_jobs" ADD COLUMN "image_count" integer;--> statement-breakpoint
ALTER TABLE "generation_jobs" ADD COLUMN "completed_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "generation_jobs" ADD COLUMN "credits_used" integer;--> statement-breakpoint
ALTER TABLE "generation_jobs" ADD COLUMN "retry_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "generation_jobs" ADD COLUMN "external_provider" text;--> statement-breakpoint
ALTER TABLE "images" ADD COLUMN "thumbnail_key" text;--> statement-breakpoint
ALTER TABLE "images" ADD COLUMN "thumbnail_url" text;--> statement-breakpoint
ALTER TABLE "images" ADD COLUMN "negative_prompt" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "settings" text;--> statement-breakpoint
ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_credits" ADD CONSTRAINT "user_credits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_job_id_generation_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."generation_jobs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lora_models" ADD CONSTRAINT "lora_models_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lora_models" ADD CONSTRAINT "lora_models_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "credit_transactions_user_idx" ON "credit_transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "credit_transactions_type_idx" ON "credit_transactions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "credit_transactions_created_at_idx" ON "credit_transactions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "user_credits_user_idx" ON "user_credits" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "posts_character_idx" ON "posts" USING btree ("character_id");--> statement-breakpoint
CREATE INDEX "posts_user_idx" ON "posts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "posts_liked_idx" ON "posts" USING btree ("character_id","liked");--> statement-breakpoint
CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "lora_models_character_idx" ON "lora_models" USING btree ("character_id");--> statement-breakpoint
CREATE INDEX "lora_models_user_idx" ON "lora_models" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "lora_models_status_idx" ON "lora_models" USING btree ("status");--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "characters_user_idx" ON "characters" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "characters_status_idx" ON "characters" USING btree ("status");--> statement-breakpoint
CREATE INDEX "generation_jobs_user_idx" ON "generation_jobs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "generation_jobs_character_idx" ON "generation_jobs" USING btree ("character_id");--> statement-breakpoint
CREATE INDEX "generation_jobs_status_idx" ON "generation_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "generation_jobs_type_idx" ON "generation_jobs" USING btree ("type");--> statement-breakpoint
CREATE INDEX "images_character_idx" ON "images" USING btree ("character_id");--> statement-breakpoint
CREATE INDEX "images_user_idx" ON "images" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "images_status_idx" ON "images" USING btree ("status");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");