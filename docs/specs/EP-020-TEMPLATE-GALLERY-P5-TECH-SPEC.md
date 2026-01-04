# EP-020 (P5) — Template Gallery: Tech Spec (File Plan + Tasks)

Working in **PHASE P5 (File plan + tasks)** on **EP-020, ST-031-ST-035**.

## Scope (MVP)

- Templates tab in Content Studio (alongside Generate tab)
- Template browsing with filters and search
- Template application (load config into generation form)
- Template creation (save successful generations as templates)
- Template browsing page (`/templates`)
- Template detail modal
- Template usage tracking and analytics

Out of scope (MVP):
- Template sharing (public templates visible to all - Phase 2)
- Template ratings/comments (Phase 2)
- Template collections (Phase 2)
- AI-powered recommendations (Phase 2)
- Template export/import (Phase 2)

---

## Prerequisites (Must Complete First)

### 1. Missing Settings Migration

**Status**: ⚠️ **REQUIRED BEFORE P6**

Add missing columns to `images` table:
- `style_id` (TEXT)
- `lighting_id` (TEXT)
- `model_id` (TEXT)
- `objects` (JSONB - array of SelectedObject)

**Files to update:**
- `libs/data/src/schema/images.schema.ts` - Add columns
- `drizzle/migrations/XXXX-add-missing-settings-to-images.sql` - Migration
- `apps/api/src/modules/image/services/studio-generation.service.ts` - Save all settings
- `apps/api/src/modules/image/services/comfyui-results.service.ts` - Save all settings
- `apps/api/src/modules/image/services/profile-picture-set.service.ts` - Save all settings

**Note**: `pose_id` already exists in images schema (line 62), so only need to add style, lighting, model, objects.

---

## API Contract (tRPC)

### `templates.list`

**Input:**
```typescript
{
  scene?: string;
  environment?: string;
  aspectRatio?: string;
  qualityMode?: 'draft' | 'hq';
  nsfw?: boolean;
  search?: string;
  sort?: 'popular' | 'recent' | 'success_rate';
  category?: 'all' | 'my_templates' | 'curated' | 'popular';
  influencerId?: string;
  page?: number;
  limit?: number;
}
```

**Output:**
```typescript
{
  templates: Template[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
```

### `templates.getById`

**Input:**
```typescript
{
  id: string;
}
```

**Output:**
```typescript
{
  template: Template;
}
```

### `templates.create`

**Input:**
```typescript
{
  name: string;
  description?: string;
  previewImageId: string;
  config: TemplateConfig;
  isPublic?: boolean;
  tags?: string[];
}
```

**Output:**
```typescript
{
  template: Template;
}
```

### `templates.update`

**Input:**
```typescript
{
  id: string;
  name?: string;
  description?: string;
  isPublic?: boolean;
  tags?: string[];
}
```

**Output:**
```typescript
{
  template: Template;
}
```

### `templates.delete`

**Input:**
```typescript
{
  id: string;
}
```

**Output:**
```typescript
{
  deleted: true;
}
```

### `templates.apply`

**Input:**
```typescript
{
  id: string;
}
```

**Output:**
```typescript
{
  config: TemplateConfig;
}
```

### `templates.trackUsage`

**Input:**
```typescript
{
  templateId: string;
  jobId: string;
}
```

**Output:**
```typescript
{
  tracked: true;
}
```

### `templates.getStats`

**Input:**
```typescript
{
  id: string;
}
```

**Output:**
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

## File Plan

### Data (libs/data)

- **Add** `libs/data/src/schema/templates.schema.ts`
  - `templates` table definition
  - `template_usage` table definition
  - Types: `Template`, `NewTemplate`, `TemplateUsage`, `TemplateConfig`
- **Update** `libs/data/src/schema/index.ts` exports
- **Add** `libs/data/src/repositories/templates.repository.ts`
  - `create(values)`
  - `findById(id)`
  - `findAll(filters, pagination)`
  - `update(id, values)`
  - `delete(id)`
  - `incrementUsageCount(id)`
  - `trackUsage(templateId, userId, jobId, successful)`
  - `getStats(id)`
- **Update** `libs/data/src/repositories/index.ts` exports
- **Add** migration: `drizzle/migrations/XXXX-templates.sql`

### Shared (libs/shared)

- **Add** `libs/shared/src/types/template.types.ts`
  - `TemplateConfig` interface
  - `TemplateFilters` interface
  - `SelectedObject` interface (if not already exists)
- **Update** `libs/shared/src/types/index.ts` exports

### Business (libs/business)

- **Add** `libs/business/src/services/template.service.ts`
  - `TemplateService` class
  - `create(userId, input)` method
  - `findAll(filters, pagination)` method
  - `findById(id)` method
  - `update(userId, id, input)` method (with ownership check)
  - `delete(userId, id)` method (with ownership check)
  - `apply(id)` method (returns config)
  - `trackUsage(templateId, userId, jobId, successful)` method
  - `getStats(id)` method
  - `generateThumbnail(imageUrl)` private method (if needed)
- **Update** `libs/business/src/services/index.ts` exports

### API (libs/trpc)

- **Add** `libs/trpc/src/routers/templates.router.ts`
  - `templates.list` procedure (public for curated, protected for user templates)
  - `templates.getById` procedure (public)
  - `templates.create` procedure (protected)
  - `templates.update` procedure (protected, ownership check)
  - `templates.delete` procedure (protected, ownership check)
  - `templates.apply` procedure (public)
  - `templates.trackUsage` procedure (protected)
  - `templates.getStats` procedure (public)
  - Input validation with Zod
- **Update** `libs/trpc/src/routers/index.ts` exports
- **Update** `libs/trpc/src/router.ts` to include `templates` router

### Web (apps/web)

#### Content Studio Integration

- **Update** `apps/web/app/influencer/[id]/studio/page.tsx`
  - Wrap generation form in `TemplateTabs` component
  - Handle `?template=:id` query param
  - Add template application logic
- **Add** `apps/web/components/studio/templates/template-tabs.tsx`
  - Tab navigation component
  - Switch between Generate and Templates tabs
- **Add** `apps/web/components/studio/templates/template-library-tab.tsx`
  - Main template library tab component
  - Integrates search, filters, and grid
- **Add** `apps/web/components/studio/templates/template-card.tsx`
  - Individual template card component
  - Preview image, metadata, apply button
- **Add** `apps/web/components/studio/templates/template-filters.tsx`
  - Filter sidebar component
  - Category, scene, environment, aspect ratio, quality, NSFW filters
- **Add** `apps/web/components/studio/templates/template-search.tsx`
  - Search input component
  - Debounced search
- **Add** `apps/web/components/studio/templates/template-grid.tsx`
  - Grid layout component
  - Responsive columns
  - Loading/empty states
- **Add** `apps/web/components/studio/templates/index.ts` (barrel export)

#### Template Browsing Page

- **Add** `apps/web/app/templates/page.tsx`
  - Main templates page route
  - Public access (no auth required)
- **Add** `apps/web/components/templates/template-hero.tsx`
  - Hero section with title and search
- **Add** `apps/web/components/templates/template-category-nav.tsx`
  - Category navigation tabs
- **Add** `apps/web/components/templates/index.ts` (barrel export)

#### Template Detail Modal

- **Add** `apps/web/components/templates/template-detail-modal.tsx`
  - Full template detail view
  - Preview image, config breakdown, stats
  - Apply button
- **Add** `apps/web/components/templates/template-config-breakdown.tsx`
  - Display all template settings
  - Read-only format

#### Template Creation

- **Add** `apps/web/components/templates/save-template-dialog.tsx`
  - Dialog for saving template
  - Name, description, preview selector, public toggle
- **Add** `apps/web/components/templates/template-preview-selector.tsx`
  - Image selector for template preview
  - Grid of thumbnails

#### Generation Settings Integration

- **Update** `apps/web/components/studio/generation/types.ts` (or wherever settings state is)
  - Add `applyTemplateConfig(template: Template)` method
  - Add `appliedTemplateId?: string` to track applied template
- **Update** generation form components to support template application:
  - Scene selector
  - Environment selector
  - Outfit selector
  - Pose selector
  - Style selector
  - Lighting selector
  - Model selector
  - Objects selector
  - Aspect ratio selector
  - Quality mode selector
  - NSFW toggle

#### Image Gallery Integration

- **Update** image gallery components (wherever image actions are)
  - Add "Save as Template" action to image context menu
  - Extract config from image metadata
  - Open `SaveTemplateDialog` with image data

### Analytics (libs/analytics)

- **Update** event types if enforced (verify during implementation)
- Add capture calls in template components:
  - `template_library_opened`
  - `template_browsed`
  - `template_applied`
  - `template_saved`
  - `template_used`
  - `template_page_visited`
  - `template_searched`
  - `template_filtered`

---

## Task Breakdown (P6-ready)

### Prerequisites

- **[TASK] TSK-EP020-000: Add missing settings to images table**
  - Add `style_id`, `lighting_id`, `model_id`, `objects` columns to `images.schema.ts`
  - Create migration: `XXXX-add-missing-settings-to-images.sql`
  - Update image creation services to save all settings:
    - `studio-generation.service.ts`
    - `comfyui-results.service.ts`
    - `profile-picture-set.service.ts`
  - Test that all settings are saved correctly
  - **Blocking**: Must complete before template system implementation

### [STORY] ST-031: Browse Templates in Content Studio

- **AC**: EP-020 AC-1

**Tasks:**
- **[TASK] TSK-EP020-001: Create templates database schema**
  - Add `templates.schema.ts` with `templates` and `template_usage` tables
  - Create migration: `XXXX-templates.sql`
  - Add indexes for performance
  - Export types

- **[TASK] TSK-EP020-002: Create templates repository**
  - Implement `TemplatesRepository`
  - Add CRUD methods: `create`, `findById`, `findAll`, `update`, `delete`
  - Add usage tracking: `trackUsage`, `incrementUsageCount`, `getStats`
  - Implement filtering and pagination in `findAll`
  - Export from repositories index

- **[TASK] TSK-EP020-003: Create template service**
  - Implement `TemplateService` in business layer
  - Add methods: `create`, `findAll`, `findById`, `update`, `delete`, `apply`, `trackUsage`, `getStats`
  - Add ownership validation for update/delete
  - Add access control (public vs user templates)
  - Export from services index

- **[TASK] TSK-EP020-004: Create templates tRPC router**
  - Add `templates.router.ts`
  - Implement all procedures: `list`, `getById`, `create`, `update`, `delete`, `apply`, `trackUsage`, `getStats`
  - Add input validation with Zod
  - Register in app router
  - Add proper auth checks (public vs protected)

- **[TASK] TSK-EP020-005: Build template tabs component**
  - Create `template-tabs.tsx`
  - Add tab navigation (Generate/Templates)
  - Integrate with existing generation form
  - Handle tab switching

- **[TASK] TSK-EP020-006: Build template library tab component**
  - Create `template-library-tab.tsx`
  - Integrate search, filters, and grid
  - Handle template fetching with filters
  - Add loading/error/empty states

- **[TASK] TSK-EP020-007: Build template card component**
  - Create `template-card.tsx`
  - Display preview image, metadata, stats
  - Add "Try Template" button
  - Handle click to view details

- **[TASK] TSK-EP020-008: Build template filters component**
  - Create `template-filters.tsx`
  - Add category, scene, environment, aspect ratio, quality, NSFW filters
  - Handle filter changes
  - Collapsible on mobile

- **[TASK] TSK-EP020-009: Build template search component**
  - Create `template-search.tsx`
  - Add search input with debounce (300ms)
  - Handle search query changes
  - Add clear button

- **[TASK] TSK-EP020-010: Build template grid component**
  - Create `template-grid.tsx`
  - Responsive grid layout (1/2/3/4 columns)
  - Loading skeleton cards
  - Empty state message
  - Pagination (if needed)

- **[TASK] TSK-EP020-011: Integrate templates tab into Content Studio**
  - Update `apps/web/app/influencer/[id]/studio/page.tsx`
  - Wrap generation form in `TemplateTabs`
  - Handle template query param: `?template=:id`
  - Test tab switching

### [STORY] ST-032: Apply Template to Generation

- **AC**: EP-020 AC-2

**Tasks:**
- **[TASK] TSK-EP020-012: Add template application to generation settings**
  - Update `GenerationSettings` type/state
  - Add `applyTemplateConfig(template: Template)` method
  - Add `appliedTemplateId?: string` tracking
  - Update all selectors to support template config:
    - Scene selector
    - Environment selector
    - Outfit selector
    - Pose selector
    - Style selector
    - Lighting selector
    - Model selector
    - Objects selector
    - Aspect ratio selector
    - Quality mode selector
    - NSFW toggle

- **[TASK] TSK-EP020-013: Implement template application flow**
  - Handle "Try Template" button click
  - Fetch template config via tRPC
  - Load config into generation settings
  - Switch to "Generate" tab
  - Show "Template applied" toast notification
  - Update credit cost preview
  - Analytics: `template_applied`

- **[TASK] TSK-EP020-014: Add template usage tracking**
  - Track when generation starts with template
  - Call `templates.trackUsage` mutation (async, don't block)
  - Increment usage count
  - Track generation success for success rate
  - Analytics: `template_used`

### [STORY] ST-033: Save Successful Generation as Template

- **AC**: EP-020 AC-3

**Tasks:**
- **[TASK] TSK-EP020-015: Build save template dialog component**
  - Create `save-template-dialog.tsx`
  - Add form fields: name, description, preview selector, public toggle
  - Handle form validation
  - Add loading/success/error states

- **[TASK] TSK-EP020-016: Build template preview selector component**
  - Create `template-preview-selector.tsx`
  - Display grid of available images
  - Handle image selection
  - Show selected state

- **[TASK] TSK-EP020-017: Implement template creation from generation**
  - Show dialog after successful generation
  - Extract config from generation job
  - Pre-fill template name (default: "Scene + Environment + Pose")
  - Allow user to edit and save
  - Call `templates.create` mutation
  - Show success notification
  - Analytics: `template_saved`

- **[TASK] TSK-EP020-018: Add "Save as Template" to image gallery**
  - Find image gallery components
  - Add "Save as Template" action to context menu
  - Extract config from image metadata
  - Open save template dialog with image data

### [STORY] ST-034: Discover Templates on Separate Page

- **AC**: EP-020 AC-4

**Tasks:**
- **[TASK] TSK-EP020-019: Create templates page route**
  - Add `apps/web/app/templates/page.tsx`
  - Public access (no auth required)
  - Fetch templates on load
  - Display hero, category nav, filters, grid

- **[TASK] TSK-EP020-020: Build template hero component**
  - Create `template-hero.tsx`
  - Display title and description
  - Integrate search bar
  - Responsive layout

- **[TASK] TSK-EP020-021: Build template category navigation**
  - Create `template-category-nav.tsx`
  - Horizontal tabs: All, By Scene, By Environment, Popular, Recent
  - Handle category selection
  - Update filters accordingly

- **[TASK] TSK-EP020-022: Build template detail modal**
  - Create `template-detail-modal.tsx`
  - Display full-size preview image
  - Show complete config breakdown
  - Display stats (usage count, success rate)
  - Add "Use This Template" button
  - Handle authentication check (redirect if needed)

- **[TASK] TSK-EP020-023: Build template config breakdown component**
  - Create `template-config-breakdown.tsx`
  - Display all settings: scene, environment, outfit, pose, style, lighting, model, objects, aspect ratio, quality, NSFW
  - Read-only format
  - Clear labels and values

- **[TASK] TSK-EP020-024: Add navigation links to templates page**
  - Add "Browse All Templates" link in Content Studio Templates tab
  - Add "Templates" link to main navigation (if exists)
  - Add link in onboarding/tutorial (if exists)
  - Analytics: `template_page_visited`

### [STORY] ST-035: Search and Filter Templates

- **AC**: EP-020 AC-6

**Tasks:**
- **[TASK] TSK-EP020-025: Implement template search functionality**
  - Full-text search across template names and descriptions
  - Debounce search input (300ms)
  - Update template list on search
  - Analytics: `template_searched`

- **[TASK] TSK-EP020-026: Implement template filtering**
  - Filter by scene, environment, aspect ratio, quality mode, NSFW
  - Multi-select filters where applicable
  - Update template list on filter change
  - Analytics: `template_filtered`

- **[TASK] TSK-EP020-027: Implement template sorting**
  - Sort by: Popular, Recent, Success Rate, Alphabetical
  - Update template list on sort change
  - Persist sort preference (optional)

- **[TASK] TSK-EP020-028: Add "Similar Templates" feature**
  - Find templates with similar scene/environment
  - Display in template detail modal
  - Link to similar templates

- **[TASK] TSK-EP020-029: Add "You Might Like" feature**
  - Based on user's generation history (if available)
  - Display in template library tab
  - Show personalized recommendations

---

## Tracking Plan (Analytics)

### Event: `template_library_opened`

**Location**: `apps/web/components/studio/templates/template-library-tab.tsx`
**Trigger**: Component mounts or tab becomes active
**Properties**: `influencer_id`, `source` ("studio" | "browse_page")

```typescript
analytics.capture('template_library_opened', {
  influencer_id: influencerId,
  source: 'studio',
});
```

### Event: `template_browsed`

**Location**: `apps/web/components/templates/template-detail-modal.tsx`
**Trigger**: Modal opens with template data
**Properties**: `template_id`, `scene`, `environment`, `pose`, `style`

```typescript
analytics.capture('template_browsed', {
  template_id: template.id,
  scene: template.config.scene,
  environment: template.config.environment,
  pose: template.config.poseId,
  style: template.config.styleId,
});
```

### Event: `template_applied`

**Location**: `apps/web/components/studio/templates/template-card.tsx` or `template-detail-modal.tsx`
**Trigger**: User clicks "Try Template" or "Use This Template"
**Properties**: `template_id`, `influencer_id`, `source` ("card" | "modal")

```typescript
analytics.capture('template_applied', {
  template_id: template.id,
  influencer_id: influencerId,
  source: 'card',
});
```

### Event: `template_used`

**Location**: `apps/web/app/influencer/[id]/studio/page.tsx` (generation handler)
**Trigger**: Generation starts with template applied
**Properties**: `template_id`, `job_id`, `modified` (boolean)

```typescript
analytics.capture('template_used', {
  template_id: appliedTemplateId,
  job_id: jobId,
  modified: hasUserModifiedSettings,
});
```

### Event: `template_saved`

**Location**: `apps/web/components/templates/save-template-dialog.tsx`
**Trigger**: Template successfully saved
**Properties**: `template_id`, `source_job_id`, `source_image_id`, `is_public`

```typescript
analytics.capture('template_saved', {
  template_id: template.id,
  source_job_id: sourceJobId,
  source_image_id: sourceImageId,
  is_public: isPublic,
});
```

### Event: `template_page_visited`

**Location**: `apps/web/app/templates/page.tsx`
**Trigger**: Page loads
**Properties**: `source` ("nav_link" | "onboarding" | "direct" | "studio_link")

```typescript
analytics.capture('template_page_visited', {
  source: 'nav_link',
});
```

### Event: `template_searched`

**Location**: `apps/web/components/studio/templates/template-search.tsx`
**Trigger**: Search query changes (debounced, after 300ms)
**Properties**: `query`, `filters_applied` (object)

```typescript
analytics.capture('template_searched', {
  query: searchQuery,
  filters_applied: activeFilters,
});
```

### Event: `template_filtered`

**Location**: `apps/web/components/studio/templates/template-filters.tsx`
**Trigger**: Filter value changes
**Properties**: `filter_type`, `filter_value`

```typescript
analytics.capture('template_filtered', {
  filter_type: 'scene',
  filter_value: 'beach',
});
```

---

## Dependencies

### Internal Dependencies

- **EP-005 Content Studio**: Must be fully implemented (generation form, settings state)
- **EP-002 User Authentication**: Required for user templates
- **EP-008 Image Gallery**: For template preview images
- **EP-009 Credits System**: For credit cost preview in templates

### External Dependencies

- **Supabase Storage**: For template preview images and thumbnails
- **PostHog**: For analytics tracking
- **tRPC**: Already in use, no new dependency

### NPM Dependencies

- No new dependencies required (using existing UI components, tRPC, etc.)

---

## Environment Variables

No new environment variables required. Uses existing:
- Database connection (via Drizzle)
- Supabase Storage (for images)
- PostHog (for analytics)

---

## Database Migrations

### Migration 1: Add Missing Settings to Images

**File**: `drizzle/migrations/XXXX-add-missing-settings-to-images.sql`

```sql
ALTER TABLE images 
  ADD COLUMN IF NOT EXISTS style_id TEXT,
  ADD COLUMN IF NOT EXISTS lighting_id TEXT,
  ADD COLUMN IF NOT EXISTS model_id TEXT,
  ADD COLUMN IF NOT EXISTS objects JSONB;
```

### Migration 2: Create Templates Tables

**File**: `drizzle/migrations/XXXX-templates.sql`

```sql
-- Templates table
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

-- Template usage tracking
CREATE TABLE template_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  job_id UUID REFERENCES generation_jobs(id),
  generation_successful BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
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

## Implementation Order

### Phase 1: Prerequisites (Blocking)

1. TSK-EP020-000: Add missing settings to images table
   - Must complete before template system

### Phase 2: Backend Foundation

2. TSK-EP020-001: Create templates database schema
3. TSK-EP020-002: Create templates repository
4. TSK-EP020-003: Create template service
5. TSK-EP020-004: Create templates tRPC router

### Phase 3: Frontend Core

6. TSK-EP020-005: Build template tabs component
7. TSK-EP020-006: Build template library tab component
8. TSK-EP020-010: Build template grid component
9. TSK-EP020-007: Build template card component
10. TSK-EP020-011: Integrate templates tab into Content Studio

### Phase 4: Template Application

11. TSK-EP020-012: Add template application to generation settings
12. TSK-EP020-013: Implement template application flow
13. TSK-EP020-014: Add template usage tracking

### Phase 5: Template Creation

14. TSK-EP020-015: Build save template dialog component
15. TSK-EP020-016: Build template preview selector component
16. TSK-EP020-017: Implement template creation from generation
17. TSK-EP020-018: Add "Save as Template" to image gallery

### Phase 6: Template Discovery

18. TSK-EP020-008: Build template filters component
19. TSK-EP020-009: Build template search component
20. TSK-EP020-025: Implement template search functionality
21. TSK-EP020-026: Implement template filtering
22. TSK-EP020-027: Implement template sorting

### Phase 7: Templates Page

23. TSK-EP020-019: Create templates page route
24. TSK-EP020-020: Build template hero component
25. TSK-EP020-021: Build template category navigation
26. TSK-EP020-022: Build template detail modal
27. TSK-EP020-023: Build template config breakdown component
28. TSK-EP020-024: Add navigation links to templates page

### Phase 8: Enhancements

29. TSK-EP020-028: Add "Similar Templates" feature
30. TSK-EP020-029: Add "You Might Like" feature

---

## Testing Considerations

### Unit Tests

- Template repository methods
- Template service methods
- Template config validation
- Filter/pagination logic

### Integration Tests

- tRPC router procedures
- Template creation flow
- Template application flow
- Usage tracking

### E2E Tests (Playwright)

- Browse templates in Content Studio
- Apply template to generation
- Save template after generation
- Search and filter templates
- Visit templates page
- Template detail modal

### Analytics Tests

- Verify all events fire correctly
- Verify event properties are correct
- Test event timing (e.g., debounced search)

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing settings migration blocks implementation | High | High | Complete TSK-EP020-000 first, verify all settings saved |
| Template config becomes outdated if settings change | Medium | Medium | Store full config, handle gracefully with fallbacks |
| Performance with many templates | Medium | Low | Pagination, efficient queries, GIN index on config |
| Users don't discover templates | Medium | High | Prominent placement, onboarding hints, analytics tracking |

---

## Next Steps (P6)

- Begin implementation with Phase 1 (Prerequisites)
- Follow implementation order
- Track progress in P6 implementation document
- Update AC status as tasks complete

