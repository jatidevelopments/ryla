CREATE TABLE "broadcast_notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"href" text,
	"targeting" jsonb,
	"scheduled_for" timestamp with time zone,
	"sent_at" timestamp with time zone,
	"status" text DEFAULT 'draft' NOT NULL,
	"target_count" integer,
	"sent_count" integer DEFAULT 0,
	"read_count" integer DEFAULT 0,
	"metadata" jsonb,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feature_flag_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"flag_id" uuid NOT NULL,
	"admin_user_id" uuid,
	"old_config" jsonb,
	"new_config" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feature_flags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" text NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"config" jsonb,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "feature_flags_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "system_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"value" jsonb NOT NULL,
	"category" text NOT NULL,
	"description" text,
	"validation_type" text,
	"updated_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "system_config_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "system_config_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"config_key" text NOT NULL,
	"old_value" jsonb,
	"new_value" jsonb,
	"admin_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "template_sets" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "broadcast_notifications" ADD CONSTRAINT "broadcast_notifications_created_by_admin_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."admin_users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_flag_history" ADD CONSTRAINT "feature_flag_history_flag_id_feature_flags_id_fk" FOREIGN KEY ("flag_id") REFERENCES "public"."feature_flags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_flag_history" ADD CONSTRAINT "feature_flag_history_admin_user_id_admin_users_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_flags" ADD CONSTRAINT "feature_flags_created_by_admin_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_config" ADD CONSTRAINT "system_config_updated_by_admin_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_config_history" ADD CONSTRAINT "system_config_history_admin_user_id_admin_users_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "broadcast_notifications_status_idx" ON "broadcast_notifications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "broadcast_notifications_scheduled_for_idx" ON "broadcast_notifications" USING btree ("scheduled_for");--> statement-breakpoint
CREATE INDEX "broadcast_notifications_created_by_idx" ON "broadcast_notifications" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "broadcast_notifications_created_at_idx" ON "broadcast_notifications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "feature_flag_history_flag_id_idx" ON "feature_flag_history" USING btree ("flag_id");--> statement-breakpoint
CREATE INDEX "feature_flag_history_created_at_idx" ON "feature_flag_history" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "feature_flags_name_idx" ON "feature_flags" USING btree ("name");--> statement-breakpoint
CREATE INDEX "feature_flags_enabled_idx" ON "feature_flags" USING btree ("enabled");--> statement-breakpoint
CREATE INDEX "feature_flags_type_idx" ON "feature_flags" USING btree ("type");--> statement-breakpoint
CREATE INDEX "system_config_key_idx" ON "system_config" USING btree ("key");--> statement-breakpoint
CREATE INDEX "system_config_category_idx" ON "system_config" USING btree ("category");--> statement-breakpoint
CREATE INDEX "system_config_history_key_idx" ON "system_config_history" USING btree ("config_key");--> statement-breakpoint
CREATE INDEX "system_config_history_created_at_idx" ON "system_config_history" USING btree ("created_at");