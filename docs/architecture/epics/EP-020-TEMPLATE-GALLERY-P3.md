# EP-020 (P3) — Template Gallery: Architecture

Working in **PHASE P3 (Architecture + API)** on **EP-020, ST-031-ST-035**.

## Goal

Ship a Template Gallery system that enables users to:
- Discover successful generation configurations through visual examples
- Save their own successful generations as reusable templates
- Apply templates to instantly configure Content Studio with all settings
- Browse templates by category, scene, environment, and style

MVP constraint: Templates are **complete snapshots** of all generation settings (scene, environment, outfit, pose, style, lighting, model, objects, aspectRatio, quality, nsfw).

---

## Architecture (Layers)

- **apps/web**: Template browsing UI, template application, template creation
- **apps/api**: Template CRUD endpoints, template usage tracking
- **libs/business**: Template service (validation, analytics)
- **libs/data**: Template repository, template usage tracking

Data flow:
1. Web loads templates → calls `GET /api/templates`
2. API calls `TemplateService.findAll(filters)`
3. Service queries `TemplateRepository` with filters
4. Returns template list with preview images
5. User applies template → loads config into Content Studio state
6. User saves template → extracts settings from generation job/image

---

## Data Model

### `templates` Table

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
```

**Config JSONB Structure:**
```typescript
{
  // Core settings (currently saved in images)
  scene: string | null;
  environment: string | null;
  outfit: string | OutfitComposition | null;
  aspectRatio: '1:1' | '9:16' | '2:3' | '3:4' | '4:3' | '16:9' | '3:2';
  qualityMode: 'draft' | 'hq';
  nsfw: boolean;
  
  // Missing settings (need to add to images table first)
  poseId: string | null;
  styleId: string | null;
  lightingId: string | null;
  modelId: string;
  objects: SelectedObject[] | null;
  
  // Prompt settings
  prompt?: string;
  promptEnhance?: boolean;
}
```

### `template_usage` Table

```sql
CREATE TABLE template_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  job_id UUID REFERENCES generation_jobs(id),
  generation_successful BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Purpose**: Track template usage for analytics and success rate calculation.

---

## API Contracts

### `GET /api/templates`

**Query Params:**
- `scene?: string` - Filter by scene
- `environment?: string` - Filter by environment
- `aspectRatio?: string` - Filter by aspect ratio
- `qualityMode?: 'draft' | 'hq'` - Filter by quality
- `nsfw?: boolean` - Filter NSFW templates
- `search?: string` - Text search in name/description
- `sort?: 'popular' | 'recent' | 'success_rate'` - Sort order
- `category?: 'all' | 'my_templates' | 'curated' | 'popular'` - Category filter
- `page?: number` - Pagination (default: 1)
- `limit?: number` - Results per page (default: 20, max: 100)

**Response:**
```typescript
{
  templates: Template[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
```

### `GET /api/templates/:id`

**Response:**
```typescript
{
  template: Template;
}
```

### `POST /api/templates`

**Body:**
```typescript
{
  name: string;
  description?: string;
  previewImageId: string; // Image ID to use as preview
  config: TemplateConfig; // Complete generation config
  isPublic?: boolean;
  tags?: string[];
}
```

**Response:**
```typescript
{
  template: Template;
}
```

### `PUT /api/templates/:id`

**Body:**
```typescript
{
  name?: string;
  description?: string;
  isPublic?: boolean;
  tags?: string[];
}
```

**Response:**
```typescript
{
  template: Template;
}
```

### `DELETE /api/templates/:id`

**Response:**
```typescript
{
  deleted: true;
}
```

### `POST /api/templates/:id/apply`

**Response:**
```typescript
{
  config: TemplateConfig; // Returns template config for frontend
}
```

### `GET /api/templates/:id/stats`

**Response:**
```typescript
{
  usageCount: number;
  successRate: number | null;
  recentUsage: Array<{
    userId: string;
    jobId: string;
    successful: boolean;
    createdAt: string;
  }>;
}
```

---

## Component Architecture

### Frontend Components

**Content Studio Integration:**
- `TemplateLibraryTab.tsx` - Templates tab in Content Studio
- `TemplateCard.tsx` - Individual template card component
- `TemplateFilters.tsx` - Filter sidebar component
- `TemplateSearch.tsx` - Search bar component
- `ApplyTemplateButton.tsx` - "Try Template" button

**Template Browsing Page:**
- `app/templates/page.tsx` - Main templates page route
- `TemplateGrid.tsx` - Grid layout component
- `TemplateDetailModal.tsx` - Template detail view modal
- `TemplateHero.tsx` - Hero section component

**Template Creation:**
- `SaveTemplateDialog.tsx` - Dialog for saving template
- `TemplatePreviewSelector.tsx` - Image selector for preview

### Backend Services

**API Module:**
- `apps/api/src/modules/templates/templates.module.ts`
- `apps/api/src/modules/templates/templates.controller.ts`
- `apps/api/src/modules/templates/templates.service.ts`
- `apps/api/src/modules/templates/dto/create-template.dto.ts`
- `apps/api/src/modules/templates/dto/update-template.dto.ts`
- `apps/api/src/modules/templates/dto/get-templates.dto.ts`

**Data Layer:**
- `libs/data/src/schema/templates.schema.ts`
- `libs/data/src/repositories/templates.repository.ts`

---

## Event Schema (PostHog)

### Template Discovery Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `template_library_opened` | User opens Templates tab | `influencer_id`, `source` (studio/browse_page) |
| `template_browsed` | User views template card | `template_id`, `scene`, `environment`, `pose`, `style` |
| `template_applied` | User clicks "Try Template" | `template_id`, `influencer_id` |
| `template_saved` | User saves generation as template | `template_id`, `source_job_id`, `source_image_id` |
| `template_used` | Generation starts with template | `template_id`, `job_id`, `modified` (boolean) |
| `template_page_visited` | User visits `/templates` | `source` (nav_link/onboarding/etc) |
| `template_searched` | User searches templates | `query`, `filters_applied` |
| `template_filtered` | User applies filter | `filter_type`, `filter_value` |

### Funnel Definitions

**Template Discovery Funnel:**
1. `template_library_opened` → User discovers templates
2. `template_browsed` → User views template details
3. `template_applied` → User applies template
4. `generation_started` (with template) → User generates with template
5. `generation_completed` → Successful generation

**Template Creation Funnel:**
1. `generation_completed` → Generation successful
2. `template_saved` → User saves as template
3. `template_used` → Template reused by user or others

---

## Dependencies

### Prerequisites (Must Complete First)

1. **EP-005 Content Studio** - Must be fully implemented
2. **Missing Settings Migration** - Add pose, style, lighting, model, objects to images table
3. **Outfit Presets (EP-021)** - Templates can reference outfit presets

### External Dependencies

- Supabase Storage (for preview images)
- PostHog (for analytics)
- Existing image gallery system

---

## Data Flow Examples

### Template Application Flow

```
1. User clicks "Try Template" in Content Studio
   → Frontend: GET /api/templates/:id
   → API: TemplateService.findOne(id)
   → Returns: Template with complete config

2. Frontend loads template config into GenerationSettings state
   → Updates: scene, environment, outfit, pose, style, lighting, model, objects, aspectRatio, quality
   → Shows: "Template applied" notification
   → Updates: Credit cost preview

3. User can modify any setting or generate immediately
   → On generate: POST /api/template-usage with template_id
   → Backend: Increment usage_count, track success
```

### Template Creation Flow

```
1. After successful generation (job completed)
   → Frontend: Show "Save as Template?" dialog
   → User: Provides name, description, selects preview image

2. Frontend: POST /api/templates
   → Body: { name, description, previewImageId, config (from job), isPublic }
   → API: TemplateService.create(userId, dto)
   → Service: Validates config, creates template record
   → Service: Generates thumbnail from preview image
   → Returns: Created template

3. Frontend: Shows "Template saved" notification
   → Template appears in "My Templates" section
```

### Template Discovery Flow

```
1. User opens Templates tab in Content Studio
   → Frontend: GET /api/templates?category=all&limit=20
   → API: TemplateService.findAll(filters)
   → Returns: Template list with preview images

2. User filters by scene/environment
   → Frontend: GET /api/templates?scene=beach&environment=beach
   → Returns: Filtered template list

3. User clicks template card
   → Frontend: Opens template detail modal
   → Shows: Full config breakdown, preview image, stats
   → User clicks "Try Template"
   → Applies template config to generation form
```

---

## Indexes

```sql
CREATE INDEX idx_templates_user ON templates(user_id);
CREATE INDEX idx_templates_influencer ON templates(influencer_id);
CREATE INDEX idx_templates_public ON templates(is_public, is_curated) 
  WHERE is_public = TRUE OR is_curated = TRUE;
CREATE INDEX idx_templates_config ON templates USING GIN (config);
CREATE INDEX idx_templates_usage_count ON templates(usage_count DESC);
CREATE INDEX idx_templates_created_at ON templates(created_at DESC);
CREATE INDEX idx_template_usage_template ON template_usage(template_id);
CREATE INDEX idx_template_usage_user ON template_usage(user_id);
```

---

## Security & Validation

### Access Control

- **Public Templates**: Visible to all users (`is_public = true` or `is_curated = true`)
- **User Templates**: Only visible to creator (`user_id = current_user_id`)
- **Template Creation**: Requires authentication
- **Template Updates**: Only creator can update/delete their templates
- **Template Application**: No restrictions (anyone can apply any visible template)

### Validation Rules

- Template name: 1-100 characters
- Template description: max 500 characters
- Preview image: Must be valid image URL
- Config: Must contain valid generation settings
- Tags: Max 10 tags, each max 20 characters

---

## Performance Considerations

- **Template List**: Pagination required (default 20, max 100)
- **Preview Images**: Use thumbnails for grid view, full images for detail
- **Config Filtering**: GIN index on JSONB config for efficient filtering
- **Caching**: Consider caching curated templates (rarely change)
- **Search**: Full-text search on name/description (PostgreSQL `tsvector`)

---

## Open Questions

1. **Template Limits**: Should there be limits on user-created templates?
   - **Recommendation**: No hard limit for MVP, monitor storage costs

2. **Template Moderation**: How to handle inappropriate templates?
   - **Recommendation**: Report/flag system (Phase 2), manual review for public templates

3. **Template Attribution**: Should templates show creator info?
   - **Recommendation**: Show "Created by @username" for user templates (Phase 2)

4. **Template Versioning**: What if template config changes (e.g., scene renamed)?
   - **Recommendation**: Store full config, handle migrations gracefully


