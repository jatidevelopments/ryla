-- Migration: Add credit tracking columns to lora_models table
-- Date: 2026-01-30
-- Epic: EP-026 LoRA Training

-- Add credits_charged column to track credits deducted at training start
ALTER TABLE lora_models 
ADD COLUMN IF NOT EXISTS credits_charged INTEGER;

-- Add credits_refunded column to track credits refunded on failure
ALTER TABLE lora_models 
ADD COLUMN IF NOT EXISTS credits_refunded INTEGER;

-- Add comment for documentation
COMMENT ON COLUMN lora_models.credits_charged IS 'Credits charged when training started';
COMMENT ON COLUMN lora_models.credits_refunded IS 'Credits refunded if training failed';
