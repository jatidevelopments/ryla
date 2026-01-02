ALTER TABLE "images" ADD COLUMN "liked" boolean DEFAULT false;
--> statement-breakpoint
ALTER TABLE "images" ADD COLUMN "deleted_at" timestamp;
--> statement-breakpoint
CREATE INDEX "images_liked_idx" ON "images" USING btree ("character_id","liked");


