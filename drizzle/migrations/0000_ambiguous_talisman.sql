CREATE TYPE "public"."character_status" AS ENUM('draft', 'generating', 'ready', 'failed', 'training', 'hd_ready');--> statement-breakpoint
CREATE TYPE "public"."credit_transaction_type" AS ENUM('subscription_grant', 'purchase', 'generation', 'refund', 'bonus', 'admin_adjustment');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('queued', 'processing', 'completed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."job_type" AS ENUM('base_image_generation', 'character_sheet_generation', 'image_generation', 'character_generation', 'image_upscale', 'lora_training', 'hd_generation', 'caption_generation');--> statement-breakpoint
CREATE TYPE "public"."image_status" AS ENUM('pending', 'generating', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'cancelled', 'expired', 'past_due');--> statement-breakpoint
CREATE TYPE "public"."subscription_tier" AS ENUM('free', 'starter', 'pro', 'unlimited');--> statement-breakpoint
CREATE TYPE "public"."aspect_ratio" AS ENUM('1:1', '9:16', '2:3');--> statement-breakpoint
CREATE TYPE "public"."environment_preset" AS ENUM('beach', 'home_bedroom', 'home_living_room', 'office', 'cafe', 'urban_street', 'studio');--> statement-breakpoint
CREATE TYPE "public"."quality_mode" AS ENUM('draft', 'hq');--> statement-breakpoint
CREATE TYPE "public"."scene_preset" AS ENUM('professional_portrait', 'candid_lifestyle', 'fashion_editorial', 'fitness_motivation', 'morning_vibes', 'night_out', 'cozy_home', 'beach_day');--> statement-breakpoint
CREATE TYPE "public"."lora_status" AS ENUM('pending', 'training', 'ready', 'failed', 'expired');--> statement-breakpoint
CREATE TYPE "public"."lora_type" AS ENUM('face', 'style', 'pose');--> statement-breakpoint
CREATE TYPE "public"."prompt_aspect_ratio" AS ENUM('1:1', '9:16', '16:9', '4:5', '3:4');--> statement-breakpoint
CREATE TYPE "public"."prompt_category" AS ENUM('portrait', 'fullbody', 'lifestyle', 'fashion', 'fitness', 'social_media', 'artistic', 'video_reference');--> statement-breakpoint
CREATE TYPE "public"."prompt_rating" AS ENUM('sfw', 'suggestive', 'nsfw');--> statement-breakpoint
CREATE TABLE "characters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"handle" text,
	"config" jsonb NOT NULL,
	"seed" text,
	"status" character_status DEFAULT 'draft',
	"generation_error" text,
	"base_image_id" uuid,
	"base_image_url" text,
	"lora_status" text,
	"lora_model_id" uuid,
	"post_count" text DEFAULT '0',
	"liked_count" text DEFAULT '0',
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
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
CREATE TABLE "generation_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"character_id" uuid,
	"type" "job_type" NOT NULL,
	"status" "job_status" DEFAULT 'queued',
	"input" jsonb NOT NULL,
	"output" jsonb,
	"image_count" integer,
	"completed_count" integer DEFAULT 0,
	"credits_used" integer,
	"error" text,
	"retry_count" integer DEFAULT 0,
	"external_job_id" text,
	"external_provider" text,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"character_id" uuid,
	"user_id" uuid NOT NULL,
	"s3_key" text NOT NULL,
	"s3_url" text,
	"thumbnail_key" text,
	"thumbnail_url" text,
	"prompt" text,
	"negative_prompt" text,
	"seed" text,
	"status" "image_status" DEFAULT 'pending',
	"width" integer,
	"height" integer,
	"generation_error" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"name" text NOT NULL,
	"public_name" text NOT NULL,
	"role" "role" DEFAULT 'user',
	"is_email_verified" boolean DEFAULT false,
	"email_verification_token" text,
	"password_reset_token" text,
	"password_reset_expires_at" timestamp,
	"banned" boolean DEFAULT false,
	"settings" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_public_name_unique" UNIQUE("public_name")
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"finby_subscription_id" text,
	"tier" "subscription_tier" DEFAULT 'free',
	"status" "subscription_status" DEFAULT 'active',
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"cancel_at_period_end" boolean DEFAULT false,
	"cancelled_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "subscriptions_finby_subscription_id_unique" UNIQUE("finby_subscription_id")
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"character_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"job_id" uuid,
	"prompt_id" uuid,
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
CREATE TABLE "prompt_favorites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prompt_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "prompt_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prompt_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"character_id" uuid,
	"post_id" uuid,
	"job_id" uuid,
	"scene" text,
	"environment" text,
	"outfit" text,
	"success" boolean DEFAULT false,
	"generation_time_ms" integer,
	"error_message" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "prompts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_by" uuid,
	"name" text NOT NULL,
	"description" text,
	"category" "prompt_category" NOT NULL,
	"subcategory" text,
	"template" text NOT NULL,
	"negative_prompt" text,
	"required_dna" jsonb,
	"tags" jsonb,
	"rating" "prompt_rating" DEFAULT 'sfw' NOT NULL,
	"recommended_workflow" text,
	"aspect_ratio" "prompt_aspect_ratio",
	"is_system_prompt" boolean DEFAULT false,
	"is_public" boolean DEFAULT true,
	"is_active" boolean DEFAULT true,
	"usage_count" integer DEFAULT 0,
	"success_count" integer DEFAULT 0,
	"favorite_count" integer DEFAULT 0,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "prompt_sets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"character_id" uuid,
	"name" text NOT NULL,
	"description" text,
	"style" text,
	"is_system_set" boolean DEFAULT false,
	"is_public" boolean DEFAULT false,
	"config" jsonb NOT NULL,
	"usage_count" text DEFAULT '0',
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "characters" ADD CONSTRAINT "characters_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_credits" ADD CONSTRAINT "user_credits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generation_jobs" ADD CONSTRAINT "generation_jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generation_jobs" ADD CONSTRAINT "generation_jobs_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_job_id_generation_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."generation_jobs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_prompt_id_prompts_id_fk" FOREIGN KEY ("prompt_id") REFERENCES "public"."prompts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lora_models" ADD CONSTRAINT "lora_models_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lora_models" ADD CONSTRAINT "lora_models_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompt_favorites" ADD CONSTRAINT "prompt_favorites_prompt_id_prompts_id_fk" FOREIGN KEY ("prompt_id") REFERENCES "public"."prompts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompt_favorites" ADD CONSTRAINT "prompt_favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompt_usage" ADD CONSTRAINT "prompt_usage_prompt_id_prompts_id_fk" FOREIGN KEY ("prompt_id") REFERENCES "public"."prompts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompt_usage" ADD CONSTRAINT "prompt_usage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompts" ADD CONSTRAINT "prompts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompt_sets" ADD CONSTRAINT "prompt_sets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompt_sets" ADD CONSTRAINT "prompt_sets_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "characters_user_idx" ON "characters" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "characters_status_idx" ON "characters" USING btree ("status");--> statement-breakpoint
CREATE INDEX "credit_transactions_user_idx" ON "credit_transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "credit_transactions_type_idx" ON "credit_transactions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "credit_transactions_created_at_idx" ON "credit_transactions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "user_credits_user_idx" ON "user_credits" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "generation_jobs_user_idx" ON "generation_jobs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "generation_jobs_character_idx" ON "generation_jobs" USING btree ("character_id");--> statement-breakpoint
CREATE INDEX "generation_jobs_status_idx" ON "generation_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "generation_jobs_type_idx" ON "generation_jobs" USING btree ("type");--> statement-breakpoint
CREATE INDEX "images_character_idx" ON "images" USING btree ("character_id");--> statement-breakpoint
CREATE INDEX "images_user_idx" ON "images" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "images_status_idx" ON "images" USING btree ("status");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "posts_character_idx" ON "posts" USING btree ("character_id");--> statement-breakpoint
CREATE INDEX "posts_user_idx" ON "posts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "posts_liked_idx" ON "posts" USING btree ("character_id","liked");--> statement-breakpoint
CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "lora_models_character_idx" ON "lora_models" USING btree ("character_id");--> statement-breakpoint
CREATE INDEX "lora_models_user_idx" ON "lora_models" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "lora_models_status_idx" ON "lora_models" USING btree ("status");--> statement-breakpoint
CREATE INDEX "prompt_favorites_user_prompt_unique" ON "prompt_favorites" USING btree ("user_id","prompt_id");--> statement-breakpoint
CREATE INDEX "prompt_favorites_prompt_idx" ON "prompt_favorites" USING btree ("prompt_id");--> statement-breakpoint
CREATE INDEX "prompt_favorites_user_idx" ON "prompt_favorites" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "prompt_favorites_sort_order_idx" ON "prompt_favorites" USING btree ("user_id","sort_order");--> statement-breakpoint
CREATE INDEX "prompt_usage_prompt_idx" ON "prompt_usage" USING btree ("prompt_id");--> statement-breakpoint
CREATE INDEX "prompt_usage_user_idx" ON "prompt_usage" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "prompt_usage_character_idx" ON "prompt_usage" USING btree ("character_id");--> statement-breakpoint
CREATE INDEX "prompt_usage_success_idx" ON "prompt_usage" USING btree ("success");--> statement-breakpoint
CREATE INDEX "prompt_usage_created_at_idx" ON "prompt_usage" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "prompt_usage_prompt_success_idx" ON "prompt_usage" USING btree ("prompt_id","success");--> statement-breakpoint
CREATE INDEX "prompts_category_idx" ON "prompts" USING btree ("category");--> statement-breakpoint
CREATE INDEX "prompts_rating_idx" ON "prompts" USING btree ("rating");--> statement-breakpoint
CREATE INDEX "prompts_system_idx" ON "prompts" USING btree ("is_system_prompt");--> statement-breakpoint
CREATE INDEX "prompts_public_idx" ON "prompts" USING btree ("is_public");--> statement-breakpoint
CREATE INDEX "prompts_active_idx" ON "prompts" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "prompts_usage_count_idx" ON "prompts" USING btree ("usage_count");--> statement-breakpoint
CREATE INDEX "prompts_favorite_count_idx" ON "prompts" USING btree ("favorite_count");--> statement-breakpoint
CREATE INDEX "prompts_created_by_idx" ON "prompts" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "prompt_sets_user_idx" ON "prompt_sets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "prompt_sets_character_idx" ON "prompt_sets" USING btree ("character_id");--> statement-breakpoint
CREATE INDEX "prompt_sets_system_idx" ON "prompt_sets" USING btree ("is_system_set");--> statement-breakpoint
CREATE INDEX "prompt_sets_public_idx" ON "prompt_sets" USING btree ("is_public");