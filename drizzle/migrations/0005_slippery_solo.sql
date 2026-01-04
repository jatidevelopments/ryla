CREATE TABLE "outfit_presets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"influencer_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"composition" jsonb NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "outfit_presets" ADD CONSTRAINT "outfit_presets_influencer_id_characters_id_fk" FOREIGN KEY ("influencer_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outfit_presets" ADD CONSTRAINT "outfit_presets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_outfit_presets_influencer" ON "outfit_presets" USING btree ("influencer_id");--> statement-breakpoint
CREATE INDEX "idx_outfit_presets_user" ON "outfit_presets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_outfit_presets_default" ON "outfit_presets" USING btree ("influencer_id","is_default");