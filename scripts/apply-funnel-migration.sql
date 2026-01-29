-- Manual script to apply funnel migration (0016) directly
-- Use this if Drizzle migration system is out of sync with database state

-- Create funnel_sessions table
CREATE TABLE IF NOT EXISTS "funnel_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" text NOT NULL,
	"email" text,
	"on_waitlist" boolean DEFAULT false,
	"current_step" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "funnel_sessions_session_id_unique" UNIQUE("session_id")
);

-- Create funnel_options table
CREATE TABLE IF NOT EXISTS "funnel_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" text NOT NULL,
	"option_key" text NOT NULL,
	"option_value" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "funnel_options_session_option_unique" UNIQUE("session_id","option_key")
);

-- Add foreign key constraint
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'funnel_options_session_id_funnel_sessions_session_id_fk') THEN
        ALTER TABLE "funnel_options" ADD CONSTRAINT "funnel_options_session_id_funnel_sessions_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."funnel_sessions"("session_id") ON DELETE cascade ON UPDATE no action;
    END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS "funnel_options_session_id_idx" ON "funnel_options" USING btree ("session_id");
CREATE INDEX IF NOT EXISTS "funnel_options_option_key_idx" ON "funnel_options" USING btree ("option_key");
CREATE INDEX IF NOT EXISTS "funnel_sessions_session_id_idx" ON "funnel_sessions" USING btree ("session_id");

-- Mark migration as applied (if __drizzle_migrations table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'drizzle' AND table_name = '__drizzle_migrations') THEN
        INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
        VALUES ('0016_needy_frightful_four', NOW())
        ON CONFLICT DO NOTHING;
    END IF;
END $$;
