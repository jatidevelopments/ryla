# Template Gallery Integration Analysis

## Current State Analysis

### Settings Available in Content Studio

From `GenerationSettings` interface:
- ✅ **Scene** (`sceneId`) - Saved in images table
- ✅ **Environment** - Saved in images table  
- ✅ **Outfit** (`outfit`) - Saved in images table (supports both legacy string and new `OutfitComposition`)
- ✅ **Pose** (`poseId`) - ❌ **NOT SAVED** in images table
- ✅ **Style** (`styleId`) - ❌ **NOT SAVED** in images table
- ✅ **Lighting** (`lightingId`) - ❌ **NOT SAVED** in images table
- ✅ **Aspect Ratio** (`aspectRatio`) - Saved in images table
- ✅ **Quality** (`quality`) - Saved as `qualityMode` in images table
- ✅ **Model** (`modelId`) - ❌ **NOT SAVED** in images table
- ✅ **Objects** (`objects[]`) - ❌ **NOT SAVED** in images table (up to 3 objects for composition)
- ✅ **NSFW** (`nsfw`) - Saved in images table
- ✅ **Prompt** (`prompt`) - Saved in images table
- ✅ **Prompt Enhance** (`promptEnhance`) - UI-only setting, not saved (affects prompt building)

### What's Currently Saved with Images

From `images.schema.ts`:
```typescript
{
  scene: scenePresetEnum('scene'),           // ✅ Saved
  environment: environmentPresetEnum('environment'), // ✅ Saved
  outfit: text('outfit'),                     // ✅ Saved (but needs to support OutfitComposition)
  aspectRatio: aspectRatioEnum('aspect_ratio'), // ✅ Saved
  qualityMode: qualityModeEnum('quality_mode'), // ✅ Saved
  nsfw: boolean('nsfw'),                      // ✅ Saved
  prompt: text('prompt'),                      // ✅ Saved
  negativePrompt: text('negative_prompt'),    // ✅ Saved
  seed: text('seed'),                         // ✅ Saved
}
```

### Missing Settings (Not Saved)

❌ **poseId** - Pose selection is NOT saved
❌ **styleId** - Visual style is NOT saved
❌ **lightingId** - Lighting setting is NOT saved
❌ **modelId** - AI model used is NOT saved
❌ **objects** - Selected objects for composition are NOT saved

---

## Template Definition

A **Template** should be a complete snapshot of ALL generation settings that can be reused:

```typescript
interface Template {
  id: string;
  userId?: string; // null for curated/system templates
  influencerId?: string; // null for global templates
  name: string;
  description?: string;
  previewImageUrl: string;
  thumbnailUrl: string;
  
  // Complete generation configuration
  config: {
    // Core settings (currently saved)
    scene: string | null;              // sceneId
    environment: string | null;        // environment preset
    outfit: string | OutfitComposition | null; // outfit selection
    aspectRatio: AspectRatio;
    qualityMode: 'draft' | 'hq';
    nsfw: boolean;
    
    // Missing settings (need to add to images table)
    poseId: string | null;             // Pose selection
    styleId: string | null;            // Visual style
    lightingId: string | null;          // Lighting setting
    modelId: string;                    // AI model used
    objects: SelectedObject[];         // Objects for composition (up to 3)
    
    // Prompt settings
    prompt?: string;                   // Custom prompt (optional)
    promptEnhance?: boolean;           // Whether prompt enhancement was used
  };
  
  metadata: {
    sourceImageId?: string;            // If created from existing image
    sourceJobId?: string;              // If created from generation job
    createdAt: Date;
    usageCount: number;
    successRate?: number;
    tags?: string[];
  };
  
  isPublic: boolean;
  isCurated: boolean;
}
```

---

## Required Changes

### 1. Database Schema Updates

**Add missing columns to `images` table:**

```sql
ALTER TABLE images ADD COLUMN IF NOT EXISTS pose_id TEXT;
ALTER TABLE images ADD COLUMN IF NOT EXISTS style_id TEXT;
ALTER TABLE images ADD COLUMN IF NOT EXISTS lighting_id TEXT;
ALTER TABLE images ADD COLUMN IF NOT EXISTS model_id TEXT;
ALTER TABLE images ADD COLUMN IF NOT EXISTS objects JSONB; -- Array of SelectedObject
```

**Update `images.schema.ts`:**

```typescript
poseId: text('pose_id'),
styleId: text('style_id'),
lightingId: text('lighting_id'),
modelId: text('model_id'),
objects: jsonb('objects').$type<SelectedObject[]>(),
```

### 2. Update Image Creation Services

**Files to update:**
- `apps/api/src/modules/image/services/studio-generation.service.ts`
- `apps/api/src/modules/image/services/comfyui-results.service.ts`
- `apps/api/src/modules/image/services/profile-picture-set.service.ts`

**Add to `createImage` calls:**
```typescript
poseId: (trackedJob?.input as any)?.poseId ?? null,
styleId: (trackedJob?.input as any)?.styleId ?? null,
lightingId: (trackedJob?.input as any)?.lightingId ?? null,
modelId: (trackedJob?.input as any)?.modelId ?? null,
objects: (trackedJob?.input as any)?.objects ?? null,
```

### 3. Update Generation Job Input Type

**Ensure `GenerationJobsRepository` stores all settings:**

```typescript
interface GenerationInput {
  prompt?: string;
  characterId: string;
  scene?: string;
  environment?: string;
  outfit?: string | OutfitComposition;
  aspectRatio: AspectRatio;
  qualityMode: 'draft' | 'hq';
  nsfw: boolean;
  poseId?: string | null;
  styleId?: string | null;
  lightingId?: string | null;
  modelId: string;
  objects?: SelectedObject[];
  seed?: number;
}
```

### 4. Template Schema

**Create `templates` table:**

```sql
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  influencer_id UUID REFERENCES influencers(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  preview_image_url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  
  -- Complete template configuration (JSONB for flexibility)
  config JSONB NOT NULL,
  
  -- Metadata
  source_image_id UUID REFERENCES images(id) ON DELETE SET NULL,
  source_job_id UUID REFERENCES generation_jobs(id) ON DELETE SET NULL,
  is_public BOOLEAN DEFAULT FALSE,
  is_curated BOOLEAN DEFAULT FALSE,
  tags TEXT[],
  usage_count INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_templates_user ON templates(user_id);
CREATE INDEX idx_templates_influencer ON templates(influencer_id);
CREATE INDEX idx_templates_public ON templates(is_public, is_curated) WHERE is_public = TRUE OR is_curated = TRUE;
CREATE INDEX idx_templates_config ON templates USING GIN (config); -- For filtering
```

---

## Template Integration in Content Studio

### UI Structure

**Option A: Tabs (Recommended - Like ZenCreator)**
```
[Generate] [Templates] [My Templates]
─────────────────────────────────────
[Generation Form] or [Template Grid]
```

**Template Card Display:**
```
┌─────────────────────┐
│  [Preview Image]    │
│                     │
├─────────────────────┤
│ Scene: Beach        │
│ Environment: Beach  │
│ Outfit: Bikini      │
│ Pose: Standing      │
│ Style: Realistic    │
│ Lighting: Golden    │
│ 9:16 • HQ • Flux    │
│                     │
│ [Try Template]      │
│ Used 1.2k times     │
└─────────────────────┘
```

### Template Application Flow

1. User clicks "Try Template" → Template config loads into generation form
2. All settings pre-filled: Scene, Environment, Outfit, Pose, Style, Lighting, Aspect Ratio, Quality, Model, Objects
3. User can modify any setting before generating
4. Credit cost preview updates
5. Generate button ready

### Template Creation Flow

**Auto-Save After Generation:**
1. After successful generation (all images completed)
2. Show "Save as Template?" dialog
3. User provides:
   - Template name (defaults to "Scene + Environment + Pose")
   - Description (optional)
   - Select preview image (defaults to first image)
4. System extracts ALL generation settings from job
5. Create template record with complete config
6. Template appears in "My Templates" section

**Manual Save from Gallery:**
1. User selects existing image in gallery
2. Click "Save as Template"
3. System extracts settings from image metadata
4. User can edit settings before saving
5. Create template record

---

## Migration Plan

### Phase 1: Save Missing Settings (Immediate)
1. ✅ Add database columns for pose, style, lighting, model, objects
2. ✅ Update image schema
3. ✅ Update image creation services to save all settings
4. ✅ Update generation job input to include all settings
5. ✅ Test that all settings are saved correctly

### Phase 2: Template System (Next)
1. ✅ Create templates table
2. ✅ Create template API endpoints
3. ✅ Build template UI in Content Studio
4. ✅ Implement template application flow
5. ✅ Implement template creation flow
6. ✅ Add template browsing page

### Phase 3: Template Discovery (Future)
1. Template search and filtering
2. Template analytics and success tracking
3. Curated template library
4. Template sharing (public templates)

---

## Key Insights

1. **Current Gap**: We're only saving ~60% of generation settings (scene, environment, outfit, aspectRatio, qualityMode, nsfw). Missing: pose, style, lighting, model, objects.

2. **Template = Complete Config**: A template should capture ALL settings that affect the final output, not just some.

3. **Outfit Evolution**: We now support `OutfitComposition` (multi-piece outfits) and `OutfitPresets` (saved outfit sets). Templates should support both.

4. **Template vs Outfit Preset**: 
   - **Outfit Preset**: Just the outfit composition (top, bottom, shoes, etc.)
   - **Template**: Complete generation config (scene + environment + outfit + pose + style + lighting + model + objects + aspectRatio + quality)

5. **Template Hierarchy**:
   - **Outfit Presets** → Saved outfit compositions (can be used in templates)
   - **Templates** → Complete generation configs (can include outfit presets)

---

## Next Steps

1. **Immediate**: Add missing columns to images table and update services
2. **Short-term**: Create templates table and API
3. **Medium-term**: Build template UI in Content Studio
4. **Long-term**: Template discovery, analytics, curation

---

## Questions to Resolve

1. **Outfit Storage**: Should we store `outfit` as JSONB to support both legacy string and new `OutfitComposition`?
   - **Recommendation**: Yes, use JSONB with type discrimination

2. **Objects Storage**: How to store `SelectedObject[]`?
   - **Recommendation**: JSONB array with structure: `[{id, imageUrl, thumbnailUrl, name}]`

3. **Template Limits**: Should there be limits on user-created templates?
   - **Recommendation**: No hard limit for MVP, monitor storage costs

4. **Template Versioning**: What if a setting option is removed/renamed?
   - **Recommendation**: Store full config, handle gracefully with fallbacks

5. **Template Sharing**: Should templates be public by default?
   - **Recommendation**: Opt-in (is_public = false by default)

