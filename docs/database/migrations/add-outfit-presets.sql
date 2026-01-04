-- Migration: Add outfit presets table
-- Allows users to save outfit compositions as presets for their AI Influencers

CREATE TABLE IF NOT EXISTS outfit_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  composition JSONB NOT NULL, -- OutfitComposition stored as JSON
  is_default BOOLEAN DEFAULT FALSE, -- One default preset per influencer
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT outfit_presets_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 100),
  CONSTRAINT outfit_presets_composition_valid CHECK (composition IS NOT NULL)
);

-- Indexes for performance
CREATE INDEX idx_outfit_presets_influencer ON outfit_presets(influencer_id);
CREATE INDEX idx_outfit_presets_user ON outfit_presets(user_id);
CREATE INDEX idx_outfit_presets_default ON outfit_presets(influencer_id, is_default) WHERE is_default = TRUE;

-- Unique constraint: only one default preset per influencer
CREATE UNIQUE INDEX idx_outfit_presets_one_default_per_influencer 
  ON outfit_presets(influencer_id) 
  WHERE is_default = TRUE;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_outfit_presets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER outfit_presets_updated_at
  BEFORE UPDATE ON outfit_presets
  FOR EACH ROW
  EXECUTE FUNCTION update_outfit_presets_updated_at();

-- Example composition structure:
-- {
--   "top": "tank-top",
--   "bottom": "jeans",
--   "shoes": "sneakers",
--   "headwear": "none-headwear",
--   "outerwear": "none-outerwear",
--   "accessories": ["necklace", "earrings"]
-- }

