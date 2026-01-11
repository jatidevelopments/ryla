CREATE TABLE "cards" (
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
--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "expired_at" timestamp;--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cards_user_id_idx" ON "cards" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "cards_is_default_idx" ON "cards" USING btree ("is_default");