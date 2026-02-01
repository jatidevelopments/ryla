-- Add training model enum for LoRA models
-- Supports: flux (images), wan (video 1.3B), wan-14b (video 14B), qwen (images)

DO $$ BEGIN
  CREATE TYPE "public"."lora_training_model" AS ENUM('flux', 'wan', 'wan-14b', 'qwen');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint

ALTER TABLE "lora_models" ADD COLUMN "training_model" "lora_training_model" DEFAULT 'flux';--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "lora_models_training_model_idx" ON "lora_models" USING btree ("training_model");
