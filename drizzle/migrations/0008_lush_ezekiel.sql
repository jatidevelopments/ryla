CREATE TABLE "template_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_id" uuid NOT NULL,
	"user_id" uuid,
	"job_id" uuid,
	"generation_successful" boolean,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"influencer_id" uuid,
	"name" text NOT NULL,
	"description" text,
	"preview_image_url" text NOT NULL,
	"thumbnail_url" text NOT NULL,
	"config" jsonb NOT NULL,
	"source_image_id" uuid,
	"source_job_id" uuid,
	"is_public" boolean DEFAULT false,
	"is_curated" boolean DEFAULT false,
	"tags" text[],
	"usage_count" integer DEFAULT 0,
	"success_rate" numeric(5, 2),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "influencer_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"consent" boolean NOT NULL,
	"instagram" text,
	"tiktok" text,
	"description" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"admin_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"reviewed_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "images" ADD COLUMN "prompt_enhance" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "images" ADD COLUMN "original_prompt" text;--> statement-breakpoint
ALTER TABLE "images" ADD COLUMN "enhanced_prompt" text;--> statement-breakpoint
ALTER TABLE "images" ADD COLUMN "style_id" text;--> statement-breakpoint
ALTER TABLE "images" ADD COLUMN "lighting_id" text;--> statement-breakpoint
ALTER TABLE "images" ADD COLUMN "model_id" text;--> statement-breakpoint
ALTER TABLE "images" ADD COLUMN "objects" jsonb;--> statement-breakpoint
ALTER TABLE "template_usage" ADD CONSTRAINT "template_usage_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_usage" ADD CONSTRAINT "template_usage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_usage" ADD CONSTRAINT "template_usage_job_id_generation_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."generation_jobs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "templates" ADD CONSTRAINT "templates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "templates" ADD CONSTRAINT "templates_influencer_id_characters_id_fk" FOREIGN KEY ("influencer_id") REFERENCES "public"."characters"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "templates" ADD CONSTRAINT "templates_source_image_id_images_id_fk" FOREIGN KEY ("source_image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "templates" ADD CONSTRAINT "templates_source_job_id_generation_jobs_id_fk" FOREIGN KEY ("source_job_id") REFERENCES "public"."generation_jobs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "influencer_requests" ADD CONSTRAINT "influencer_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "template_usage_template_idx" ON "template_usage" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "template_usage_user_idx" ON "template_usage" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "template_usage_job_idx" ON "template_usage" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "templates_user_idx" ON "templates" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "templates_influencer_idx" ON "templates" USING btree ("influencer_id");--> statement-breakpoint
CREATE INDEX "templates_public_idx" ON "templates" USING btree ("is_public","is_curated");--> statement-breakpoint
CREATE INDEX "templates_config_idx" ON "templates" USING gin ("config");--> statement-breakpoint
CREATE INDEX "templates_usage_count_idx" ON "templates" USING btree ("usage_count");--> statement-breakpoint
CREATE INDEX "templates_created_at_idx" ON "templates" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "influencer_requests_user_idx" ON "influencer_requests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "influencer_requests_status_idx" ON "influencer_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "influencer_requests_created_at_idx" ON "influencer_requests" USING btree ("created_at");