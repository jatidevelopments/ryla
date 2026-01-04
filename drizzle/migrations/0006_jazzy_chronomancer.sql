CREATE TYPE "public"."gallery_item_type" AS ENUM('pose', 'style', 'scene', 'lighting', 'outfit', 'object', 'outfit-composition');--> statement-breakpoint
CREATE TABLE "gallery_favorites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"item_type" "gallery_item_type" NOT NULL,
	"item_id" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "gallery_favorites" ADD CONSTRAINT "gallery_favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "gallery_favorites_user_item_unique" ON "gallery_favorites" USING btree ("user_id","item_type","item_id");--> statement-breakpoint
CREATE INDEX "gallery_favorites_user_idx" ON "gallery_favorites" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "gallery_favorites_item_type_idx" ON "gallery_favorites" USING btree ("item_type");--> statement-breakpoint
CREATE INDEX "gallery_favorites_item_id_idx" ON "gallery_favorites" USING btree ("item_id");