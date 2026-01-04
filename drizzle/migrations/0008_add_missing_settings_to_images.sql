-- Add missing settings columns to images table for template support
ALTER TABLE "images" 
  ADD COLUMN IF NOT EXISTS "style_id" text,
  ADD COLUMN IF NOT EXISTS "lighting_id" text,
  ADD COLUMN IF NOT EXISTS "model_id" text,
  ADD COLUMN IF NOT EXISTS "objects" jsonb;

