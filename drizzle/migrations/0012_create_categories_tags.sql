-- Migration: Create Template Categories and Tags
-- Epic: EP-048 (Category & Tag System)
-- Initiative: IN-011 (Template Gallery & Content Library)
-- Date: 2026-01-19

-- ============================================
-- Template Categories (hierarchical)
-- ============================================

CREATE TABLE IF NOT EXISTS template_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES template_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

--> statement-breakpoint

CREATE INDEX IF NOT EXISTS template_categories_parent_idx ON template_categories(parent_id);

--> statement-breakpoint

CREATE INDEX IF NOT EXISTS template_categories_active_idx ON template_categories(is_active);

--> statement-breakpoint

CREATE INDEX IF NOT EXISTS template_categories_sort_idx ON template_categories(parent_id, sort_order);

--> statement-breakpoint

-- ============================================
-- Template Tags (flat)
-- ============================================

CREATE TABLE IF NOT EXISTS template_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  usage_count INTEGER DEFAULT 0,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

--> statement-breakpoint

CREATE INDEX IF NOT EXISTS template_tags_usage_idx ON template_tags(usage_count DESC);

--> statement-breakpoint

CREATE INDEX IF NOT EXISTS template_tags_system_idx ON template_tags(is_system);

--> statement-breakpoint

-- ============================================
-- Template Tag Assignments (junction)
-- ============================================

CREATE TABLE IF NOT EXISTS template_tag_assignments (
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES template_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (template_id, tag_id)
);

--> statement-breakpoint

CREATE INDEX IF NOT EXISTS template_tag_assignments_template_idx ON template_tag_assignments(template_id);

--> statement-breakpoint

CREATE INDEX IF NOT EXISTS template_tag_assignments_tag_idx ON template_tag_assignments(tag_id);

--> statement-breakpoint

-- ============================================
-- Add category_id to templates table
-- ============================================

ALTER TABLE templates ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES template_categories(id) ON DELETE SET NULL;

--> statement-breakpoint

CREATE INDEX IF NOT EXISTS templates_category_idx ON templates(category_id);

--> statement-breakpoint

-- ============================================
-- Seed Initial Categories
-- ============================================

-- Scene category
INSERT INTO template_categories (id, parent_id, name, slug, icon, sort_order, is_active)
VALUES 
  ('00000000-0000-4000-8000-000000000001', NULL, 'Scene', 'scene', '🏖️', 1, true)
ON CONFLICT (slug) DO NOTHING;

--> statement-breakpoint

INSERT INTO template_categories (id, parent_id, name, slug, icon, sort_order, is_active)
VALUES 
  ('00000000-0000-4000-8000-000000000011', '00000000-0000-4000-8000-000000000001', 'Beach', 'beach', NULL, 1, true),
  ('00000000-0000-4000-8000-000000000012', '00000000-0000-4000-8000-000000000001', 'Studio', 'studio', NULL, 2, true),
  ('00000000-0000-4000-8000-000000000013', '00000000-0000-4000-8000-000000000001', 'Urban', 'urban', NULL, 3, true),
  ('00000000-0000-4000-8000-000000000014', '00000000-0000-4000-8000-000000000001', 'Nature', 'nature', NULL, 4, true),
  ('00000000-0000-4000-8000-000000000015', '00000000-0000-4000-8000-000000000001', 'Indoor', 'indoor', NULL, 5, true),
  ('00000000-0000-4000-8000-000000000016', '00000000-0000-4000-8000-000000000001', 'Fantasy', 'fantasy', NULL, 6, true)
ON CONFLICT (slug) DO NOTHING;

--> statement-breakpoint

-- Style category
INSERT INTO template_categories (id, parent_id, name, slug, icon, sort_order, is_active)
VALUES 
  ('00000000-0000-4000-8000-000000000002', NULL, 'Style', 'style', '✨', 2, true)
ON CONFLICT (slug) DO NOTHING;

--> statement-breakpoint

INSERT INTO template_categories (id, parent_id, name, slug, icon, sort_order, is_active)
VALUES 
  ('00000000-0000-4000-8000-000000000021', '00000000-0000-4000-8000-000000000002', 'Fashion', 'fashion', NULL, 1, true),
  ('00000000-0000-4000-8000-000000000022', '00000000-0000-4000-8000-000000000002', 'Artistic', 'artistic', NULL, 2, true),
  ('00000000-0000-4000-8000-000000000023', '00000000-0000-4000-8000-000000000002', 'Minimal', 'minimal', NULL, 3, true),
  ('00000000-0000-4000-8000-000000000024', '00000000-0000-4000-8000-000000000002', 'Retro', 'retro', NULL, 4, true)
ON CONFLICT (slug) DO NOTHING;

--> statement-breakpoint

-- Fashion sub-categories
INSERT INTO template_categories (id, parent_id, name, slug, icon, sort_order, is_active)
VALUES 
  ('00000000-0000-4000-8000-000000000211', '00000000-0000-4000-8000-000000000021', 'Streetwear', 'streetwear', NULL, 1, true),
  ('00000000-0000-4000-8000-000000000212', '00000000-0000-4000-8000-000000000021', 'Glamour', 'glamour', NULL, 2, true),
  ('00000000-0000-4000-8000-000000000213', '00000000-0000-4000-8000-000000000021', 'Casual', 'casual', NULL, 3, true)
ON CONFLICT (slug) DO NOTHING;

--> statement-breakpoint

-- Mood category
INSERT INTO template_categories (id, parent_id, name, slug, icon, sort_order, is_active)
VALUES 
  ('00000000-0000-4000-8000-000000000003', NULL, 'Mood', 'mood', '🎭', 3, true)
ON CONFLICT (slug) DO NOTHING;

--> statement-breakpoint

INSERT INTO template_categories (id, parent_id, name, slug, icon, sort_order, is_active)
VALUES 
  ('00000000-0000-4000-8000-000000000031', '00000000-0000-4000-8000-000000000003', 'Cozy', 'cozy', NULL, 1, true),
  ('00000000-0000-4000-8000-000000000032', '00000000-0000-4000-8000-000000000003', 'Energetic', 'energetic', NULL, 2, true),
  ('00000000-0000-4000-8000-000000000033', '00000000-0000-4000-8000-000000000003', 'Romantic', 'romantic', NULL, 3, true),
  ('00000000-0000-4000-8000-000000000034', '00000000-0000-4000-8000-000000000003', 'Professional', 'professional', NULL, 4, true),
  ('00000000-0000-4000-8000-000000000035', '00000000-0000-4000-8000-000000000003', 'Playful', 'playful', NULL, 5, true)
ON CONFLICT (slug) DO NOTHING;

--> statement-breakpoint

-- Activity category
INSERT INTO template_categories (id, parent_id, name, slug, icon, sort_order, is_active)
VALUES 
  ('00000000-0000-4000-8000-000000000004', NULL, 'Activity', 'activity', '🏃', 4, true)
ON CONFLICT (slug) DO NOTHING;

--> statement-breakpoint

INSERT INTO template_categories (id, parent_id, name, slug, icon, sort_order, is_active)
VALUES 
  ('00000000-0000-4000-8000-000000000041', '00000000-0000-4000-8000-000000000004', 'Fitness', 'fitness', NULL, 1, true),
  ('00000000-0000-4000-8000-000000000042', '00000000-0000-4000-8000-000000000004', 'Travel', 'travel', NULL, 2, true),
  ('00000000-0000-4000-8000-000000000043', '00000000-0000-4000-8000-000000000004', 'Lifestyle', 'lifestyle', NULL, 3, true),
  ('00000000-0000-4000-8000-000000000044', '00000000-0000-4000-8000-000000000004', 'Work', 'work', NULL, 4, true)
ON CONFLICT (slug) DO NOTHING;
