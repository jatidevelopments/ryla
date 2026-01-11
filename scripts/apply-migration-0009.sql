-- Migration 0009: Add cards table and expired_at column
-- This script applies only the changes from migration 0009

-- Create cards table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS "cards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"card_hash" text NOT NULL,
	"last4" text,
	"card_type" text,
	"expiry_date" text,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Add expired_at column to subscriptions (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subscriptions' AND column_name = 'expired_at'
    ) THEN
        ALTER TABLE "subscriptions" ADD COLUMN "expired_at" timestamp;
    END IF;
END $$;

-- Add foreign key constraint (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'cards_user_id_users_id_fk'
    ) THEN
        ALTER TABLE "cards" ADD CONSTRAINT "cards_user_id_users_id_fk" 
        FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") 
        ON DELETE cascade ON UPDATE no action;
    END IF;
END $$;

-- Create indexes (if they don't exist)
CREATE INDEX IF NOT EXISTS "cards_user_id_idx" ON "cards" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "cards_is_default_idx" ON "cards" USING btree ("is_default");

