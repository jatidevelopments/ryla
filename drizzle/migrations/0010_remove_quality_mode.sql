-- Migration: Remove qualityMode from templates config JSONB
-- Epic: EP-045 (qualityMode Removal)
-- Initiative: IN-011 (Template Gallery & Content Library)
-- Date: 2026-01-19

-- Remove qualityMode key from all templates.config JSONB records
UPDATE templates SET config = config - 'qualityMode' WHERE config ? 'qualityMode';
