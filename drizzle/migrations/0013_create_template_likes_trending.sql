-- Migration: Create Template Likes and Trending View
-- Epic: EP-049 (Likes & Popularity System)
-- Initiative: IN-011 (Template Gallery & Content Library)
-- Date: 2026-01-19

-- ============================================
-- Template Likes
-- ============================================

CREATE TABLE IF NOT EXISTS template_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, template_id)
);

--> statement-breakpoint

CREATE INDEX IF NOT EXISTS template_likes_template_idx ON template_likes(template_id);

--> statement-breakpoint

CREATE INDEX IF NOT EXISTS template_likes_user_idx ON template_likes(user_id);

--> statement-breakpoint

CREATE INDEX IF NOT EXISTS template_likes_created_at_idx ON template_likes(created_at DESC);

--> statement-breakpoint

-- ============================================
-- Add likes_count to templates table
-- ============================================

ALTER TABLE templates ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;

--> statement-breakpoint

CREATE INDEX IF NOT EXISTS templates_likes_count_idx ON templates(likes_count DESC);

--> statement-breakpoint

-- ============================================
-- Trending Materialized View
-- Calculates usage rate and trending score for public templates
-- ============================================

CREATE MATERIALIZED VIEW IF NOT EXISTS template_trending AS
SELECT
  id,
  usage_count,
  COALESCE(likes_count, 0) AS likes_count,
  created_at,
  -- Usage rate: usage per day since creation (minimum 1 day to avoid division by zero)
  COALESCE(usage_count, 0)::float / GREATEST(EXTRACT(EPOCH FROM (NOW() - created_at)) / 86400, 1) AS usage_rate,
  -- Combined score: 70% likes + 30% usage, normalized by age
  (COALESCE(usage_count, 0) * 0.3 + COALESCE(likes_count, 0) * 0.7)::float / GREATEST(EXTRACT(EPOCH FROM (NOW() - created_at)) / 86400, 1) AS trending_score
FROM templates
WHERE is_public = true 
  AND created_at > NOW() - INTERVAL '90 days';

--> statement-breakpoint

-- Unique index for CONCURRENT refresh
CREATE UNIQUE INDEX IF NOT EXISTS template_trending_id_idx ON template_trending(id);

--> statement-breakpoint

-- Index for sorting by trending score
CREATE INDEX IF NOT EXISTS template_trending_score_idx ON template_trending(trending_score DESC);

--> statement-breakpoint

-- Index for sorting by usage rate
CREATE INDEX IF NOT EXISTS template_trending_usage_rate_idx ON template_trending(usage_rate DESC);

--> statement-breakpoint

-- ============================================
-- Template Sets Trending Materialized View
-- ============================================

CREATE MATERIALIZED VIEW IF NOT EXISTS template_set_trending AS
SELECT
  id,
  usage_count,
  COALESCE(likes_count, 0) AS likes_count,
  created_at,
  -- Usage rate: usage per day since creation
  COALESCE(usage_count, 0)::float / GREATEST(EXTRACT(EPOCH FROM (NOW() - created_at)) / 86400, 1) AS usage_rate,
  -- Combined score: 70% likes + 30% usage, normalized by age
  (COALESCE(usage_count, 0) * 0.3 + COALESCE(likes_count, 0) * 0.7)::float / GREATEST(EXTRACT(EPOCH FROM (NOW() - created_at)) / 86400, 1) AS trending_score
FROM template_sets
WHERE is_public = true 
  AND created_at > NOW() - INTERVAL '90 days';

--> statement-breakpoint

CREATE UNIQUE INDEX IF NOT EXISTS template_set_trending_id_idx ON template_set_trending(id);

--> statement-breakpoint

CREATE INDEX IF NOT EXISTS template_set_trending_score_idx ON template_set_trending(trending_score DESC);
