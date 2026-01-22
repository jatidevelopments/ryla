-- Migration: Fix template_sets.user_id to be nullable
-- Curated template sets don't have a user owner
-- Epic: EP-050
-- Initiative: IN-017

-- Make user_id nullable (already has default null, just need to drop NOT NULL constraint)
ALTER TABLE "template_sets" ALTER COLUMN "user_id" DROP NOT NULL;
