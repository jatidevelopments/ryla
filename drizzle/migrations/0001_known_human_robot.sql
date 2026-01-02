ALTER TABLE "prompt_sets" DROP CONSTRAINT "prompt_sets_character_id_characters_id_fk";
--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "profile_picture_set_id" uuid;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "profile_picture_images" jsonb;--> statement-breakpoint
ALTER TABLE "images" ADD COLUMN "source_image_id" uuid;--> statement-breakpoint
ALTER TABLE "images" ADD COLUMN "edit_type" text;--> statement-breakpoint
ALTER TABLE "images" ADD COLUMN "edit_mask_s3_key" text;--> statement-breakpoint
ALTER TABLE "images" ADD COLUMN "scene" "scene_preset";--> statement-breakpoint
ALTER TABLE "images" ADD COLUMN "environment" "environment_preset";--> statement-breakpoint
ALTER TABLE "images" ADD COLUMN "outfit" text;--> statement-breakpoint
ALTER TABLE "images" ADD COLUMN "aspect_ratio" "aspect_ratio";--> statement-breakpoint
ALTER TABLE "images" ADD COLUMN "quality_mode" "quality_mode";--> statement-breakpoint
ALTER TABLE "images" ADD COLUMN "nsfw" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "characters" ADD CONSTRAINT "characters_profile_picture_set_id_prompt_sets_id_fk" FOREIGN KEY ("profile_picture_set_id") REFERENCES "public"."prompt_sets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_source_image_id_images_id_fk" FOREIGN KEY ("source_image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "images_source_image_idx" ON "images" USING btree ("source_image_id");