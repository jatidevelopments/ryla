-- Create admin_users table if it doesn't exist
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

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS "admin_users_email_idx" ON "admin_users" USING btree ("email");
CREATE INDEX IF NOT EXISTS "admin_users_role_idx" ON "admin_users" USING btree ("role");
CREATE INDEX IF NOT EXISTS "admin_users_is_active_idx" ON "admin_users" USING btree ("is_active");

-- Create admin_sessions table if it doesn't exist
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

-- Create indexes for admin_sessions
CREATE INDEX IF NOT EXISTS "admin_sessions_admin_id_idx" ON "admin_sessions" USING btree ("admin_id");
CREATE INDEX IF NOT EXISTS "admin_sessions_token_hash_idx" ON "admin_sessions" USING btree ("token_hash");
CREATE INDEX IF NOT EXISTS "admin_sessions_expires_at_idx" ON "admin_sessions" USING btree ("expires_at");

-- Create foreign key if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'admin_sessions_admin_id_admin_users_id_fk'
    ) THEN
        ALTER TABLE "admin_sessions" 
        ADD CONSTRAINT "admin_sessions_admin_id_admin_users_id_fk" 
        FOREIGN KEY ("admin_id") REFERENCES "public"."admin_users"("id") 
        ON DELETE cascade ON UPDATE no action;
    END IF;
END $$;

-- Create admin_audit_log table if it doesn't exist
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

-- Create indexes for admin_audit_log
CREATE INDEX IF NOT EXISTS "admin_audit_log_admin_id_idx" ON "admin_audit_log" USING btree ("admin_id");
CREATE INDEX IF NOT EXISTS "admin_audit_log_action_idx" ON "admin_audit_log" USING btree ("action");
CREATE INDEX IF NOT EXISTS "admin_audit_log_entity_type_idx" ON "admin_audit_log" USING btree ("entity_type");
CREATE INDEX IF NOT EXISTS "admin_audit_log_created_at_idx" ON "admin_audit_log" USING btree ("created_at");

-- Create foreign key for admin_audit_log if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'admin_audit_log_admin_id_admin_users_id_fk'
    ) THEN
        ALTER TABLE "admin_audit_log" 
        ADD CONSTRAINT "admin_audit_log_admin_id_admin_users_id_fk" 
        FOREIGN KEY ("admin_id") REFERENCES "public"."admin_users"("id") 
        ON DELETE set null ON UPDATE no action;
    END IF;
END $$;
