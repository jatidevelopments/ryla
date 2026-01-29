-- Note: template_set_content_type enum was already created in migration 0011
-- CREATE TYPE "public"."template_set_content_type" AS ENUM('image', 'video', 'lip_sync', 'audio', 'mixed');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "admin_audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" uuid NOT NULL,
	"action" varchar(100) NOT NULL,
	"entity_type" varchar(50),
	"entity_id" uuid,
	"details" jsonb,
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "admin_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" uuid NOT NULL,
	"token_hash" varchar(64) NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "admin_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"role" varchar(50) DEFAULT 'viewer' NOT NULL,
	"permissions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"avatar_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp with time zone,
	"last_login_ip" varchar(45),
	"failed_login_attempts" varchar(10) DEFAULT '0' NOT NULL,
	"locked_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	CONSTRAINT "admin_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "template_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_id" uuid,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"icon" text,
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "template_tag_assignments" (
	"template_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "template_tag_assignments_template_id_tag_id_pk" PRIMARY KEY("template_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "template_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"usage_count" integer DEFAULT 0,
	"is_system" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "template_likes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"template_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "template_likes_unique" UNIQUE("user_id","template_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "template_set_likes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"set_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "template_set_likes_unique" UNIQUE("set_id","user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "template_set_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"set_id" uuid NOT NULL,
	"template_id" uuid NOT NULL,
	"order_position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "template_set_members_unique" UNIQUE("set_id","template_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "template_sets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"preview_image_url" text,
	"thumbnail_url" text,
	"is_public" boolean DEFAULT false NOT NULL,
	"is_curated" boolean DEFAULT false NOT NULL,
	"content_type" "template_set_content_type" DEFAULT 'image' NOT NULL,
	"likes_count" integer DEFAULT 0 NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"member_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'templates' AND column_name = 'category_id') THEN
        ALTER TABLE "templates" ADD COLUMN "category_id" uuid;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'templates' AND column_name = 'likes_count') THEN
        ALTER TABLE "templates" ADD COLUMN "likes_count" integer DEFAULT 0;
    END IF;
END $$;--> statement-breakpoint
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'admin_audit_log_admin_id_admin_users_id_fk') THEN
        ALTER TABLE "admin_audit_log" ADD CONSTRAINT "admin_audit_log_admin_id_admin_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'admin_sessions_admin_id_admin_users_id_fk') THEN
        ALTER TABLE "admin_sessions" ADD CONSTRAINT "admin_sessions_admin_id_admin_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admin_users"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'template_tag_assignments_template_id_templates_id_fk') THEN
        ALTER TABLE "template_tag_assignments" ADD CONSTRAINT "template_tag_assignments_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'template_tag_assignments_tag_id_template_tags_id_fk') THEN
        ALTER TABLE "template_tag_assignments" ADD CONSTRAINT "template_tag_assignments_tag_id_template_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."template_tags"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'template_likes_user_id_users_id_fk') THEN
        ALTER TABLE "template_likes" ADD CONSTRAINT "template_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'template_likes_template_id_templates_id_fk') THEN
        ALTER TABLE "template_likes" ADD CONSTRAINT "template_likes_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'template_set_likes_set_id_template_sets_id_fk') THEN
        ALTER TABLE "template_set_likes" ADD CONSTRAINT "template_set_likes_set_id_template_sets_id_fk" FOREIGN KEY ("set_id") REFERENCES "public"."template_sets"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'template_set_likes_user_id_users_id_fk') THEN
        ALTER TABLE "template_set_likes" ADD CONSTRAINT "template_set_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'template_set_members_set_id_template_sets_id_fk') THEN
        ALTER TABLE "template_set_members" ADD CONSTRAINT "template_set_members_set_id_template_sets_id_fk" FOREIGN KEY ("set_id") REFERENCES "public"."template_sets"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'template_set_members_template_id_templates_id_fk') THEN
        ALTER TABLE "template_set_members" ADD CONSTRAINT "template_set_members_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'template_sets_user_id_users_id_fk') THEN
        ALTER TABLE "template_sets" ADD CONSTRAINT "template_sets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'templates_category_id_template_categories_id_fk') THEN
        ALTER TABLE "templates" ADD CONSTRAINT "templates_category_id_template_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."template_categories"("id") ON DELETE set null ON UPDATE no action;
    END IF;
END $$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "admin_audit_log_admin_id_idx" ON "admin_audit_log" USING btree ("admin_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "admin_audit_log_action_idx" ON "admin_audit_log" USING btree ("action");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "admin_audit_log_entity_type_idx" ON "admin_audit_log" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "admin_audit_log_created_at_idx" ON "admin_audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "admin_sessions_admin_id_idx" ON "admin_sessions" USING btree ("admin_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "admin_sessions_token_hash_idx" ON "admin_sessions" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "admin_sessions_expires_at_idx" ON "admin_sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "admin_users_email_idx" ON "admin_users" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "admin_users_role_idx" ON "admin_users" USING btree ("role");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "admin_users_is_active_idx" ON "admin_users" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "template_categories_parent_idx" ON "template_categories" USING btree ("parent_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "template_categories_slug_unique" ON "template_categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "template_categories_active_idx" ON "template_categories" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "template_categories_sort_idx" ON "template_categories" USING btree ("parent_id","sort_order");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "template_tag_assignments_template_idx" ON "template_tag_assignments" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "template_tag_assignments_tag_idx" ON "template_tag_assignments" USING btree ("tag_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "template_tags_name_unique" ON "template_tags" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "template_tags_slug_unique" ON "template_tags" USING btree ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "template_tags_usage_idx" ON "template_tags" USING btree ("usage_count");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "template_tags_system_idx" ON "template_tags" USING btree ("is_system");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "template_likes_template_idx" ON "template_likes" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "template_likes_user_idx" ON "template_likes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "template_likes_created_at_idx" ON "template_likes" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "template_set_likes_set_idx" ON "template_set_likes" USING btree ("set_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "template_set_likes_user_idx" ON "template_set_likes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "template_set_members_set_idx" ON "template_set_members" USING btree ("set_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "template_set_members_template_idx" ON "template_set_members" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "template_set_members_order_idx" ON "template_set_members" USING btree ("set_id","order_position");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "template_sets_user_idx" ON "template_sets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "template_sets_public_idx" ON "template_sets" USING btree ("is_public");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "template_sets_content_type_idx" ON "template_sets" USING btree ("content_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "template_sets_created_at_idx" ON "template_sets" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "template_sets_usage_count_idx" ON "template_sets" USING btree ("usage_count");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "template_sets_likes_count_idx" ON "template_sets" USING btree ("likes_count");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "templates_category_idx" ON "templates" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "templates_likes_count_idx" ON "templates" USING btree ("likes_count");--> statement-breakpoint
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'images' AND column_name = 'quality_mode') THEN
        ALTER TABLE "images" DROP COLUMN "quality_mode";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'quality_mode') THEN
        ALTER TABLE "posts" DROP COLUMN "quality_mode";
    END IF;
END $$;
