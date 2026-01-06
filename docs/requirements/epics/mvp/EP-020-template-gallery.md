# [EPIC] EP-020: Template Gallery & Library

## Overview

The Template Gallery enables users to discover, save, and reuse successful generation configurations. Users can browse curated templates, see example outputs, and instantly apply templates to generate similar content. This feature reduces the learning curve and increases generation success rates.

> **Inspiration**: ZenCreator's "Library" tab pattern with visual Input → Output examples  
> **Goal**: Help users discover successful scene/environment/outfit combinations through visual examples

---

## Terminology

| Term | Definition |
|------|------------|
| **Template** | A saved generation configuration (scene + environment + outfit + aspect ratio + quality mode) with example output image |
| **Template Library** | Curated collection of templates organized by category (scene, environment, style) |
| **My Templates** | User's saved templates from their own successful generations |
| **Template Preview** | Visual example showing the template configuration and resulting output image |
| **Apply Template** | Action to load a template's configuration into Content Studio for generation |

---

## Business Impact

**Target Metric**: A - Activation, C - Core Value

**Hypothesis**: When users can see visual examples of successful generations and easily replicate them, they will:
- Generate more content (higher activation)
- Achieve better results (higher satisfaction)
- Learn the platform faster (reduced time to value)

**Success Criteria**:
- Template usage rate: **>40%** of generations use templates
- Template discovery: **>60%** of users browse templates before first generation
- Generation success rate improvement: **+10%** when using templates vs manual configuration
- Time to first successful generation: **<2 minutes** (down from <30 seconds to <2 minutes total flow)

---

## Features

### F1: Template Library Integration (Content Studio)

**Location**: Content Studio (`/influencer/[id]/studio`)

**UI Pattern**: Tabs (similar to ZenCreator)
- **"Generate" Tab** (default): Current generation form with scene/environment/outfit selectors
- **"Templates" Tab**: Browse and search templates with visual previews

**Template Display**:
- Grid layout with template cards
- Each card shows:
  - Preview image (example output)
  - Scene + Environment + Outfit labels
  - Aspect ratio indicator
  - Quality mode indicator (Draft/HQ)
  - "Try Template" button
  - Success metrics (optional): "Used 1.2k times", "95% success rate"

**Template Categories**:
- **All Templates** (default)
- **By Scene**: Professional Portrait, Candid Lifestyle, Fashion Editorial, etc.
- **By Environment**: Beach, Home, Office, Studio, etc.
- **My Templates**: User's saved templates
- **Popular**: Most used templates
- **Recent**: Recently added templates

**Filter Options**:
- Scene filter
- Environment filter
- Aspect ratio filter
- Quality mode filter
- NSFW toggle (show/hide NSFW templates)

### F2: Template Application Flow

**When user clicks "Try Template"**:
1. Template configuration loads into Content Studio generation form
2. Scene, Environment, Outfit, Aspect Ratio, Quality Mode are pre-filled
3. User can modify any setting before generating
4. Credit cost preview updates based on template settings
5. Generate button ready to use

**Visual Feedback**:
- "Template applied" toast notification
- Generation form highlights pre-filled fields
- Option to "Clear Template" and start fresh

### F3: Template Creation (Auto-Save)

**Automatic Template Creation**:
- After successful generation (all images completed)
- User can optionally save generation as template
- Prompt: "Save this as a template?" with preview
- User provides:
  - Template name (optional, defaults to "Scene + Environment")
  - Template description (optional)
  - Select which image to use as preview (defaults to first image)

**Manual Template Creation**:
- From existing image in gallery
- User selects image → "Save as Template"
- System extracts generation metadata (scene, environment, outfit, etc.)
- User can edit configuration before saving

### F4: Template Browsing Page (Separate Route)

**Location**: `/templates` (global, not per-influencer)

**Purpose**: 
- Discover templates across all AI Influencers
- Learn what's possible with different combinations
- Browse by category/style
- See community-generated templates (if sharing enabled)

**Page Structure**:
- **Hero Section**: "Discover Successful Generations"
- **Category Navigation**: Scene, Environment, Style, Popular
- **Template Grid**: Same card layout as Content Studio
- **Search Bar**: Search by scene, environment, outfit, or description
- **Filter Sidebar**: Scene, Environment, Aspect Ratio, Quality, NSFW
- **Template Detail Modal**: 
  - Full-size preview image
  - Complete configuration breakdown
  - "Use This Template" button (redirects to Content Studio)
  - Success metrics and usage stats

**Integration Points**:
- "Browse Templates" link in Content Studio
- "View All Templates" button in Templates tab
- Direct link from onboarding/tutorial

### F5: Template Metadata & Storage

**Template Schema**:
```typescript
interface Template {
  id: string;
  userId?: string; // null for curated/system templates
  influencerId?: string; // null for global templates
  name: string;
  description?: string;
  previewImageUrl: string;
  thumbnailUrl: string;
  config: {
    scene: ScenePreset;
    environment: EnvironmentPreset;
    outfit: string;
    aspectRatio: '1:1' | '9:16' | '2:3';
    qualityMode: 'draft' | 'hq';
    nsfw: boolean;
  };
  metadata: {
    sourceImageId?: string; // If created from existing image
    sourceJobId?: string; // If created from generation job
    createdAt: Date;
    usageCount: number; // How many times template was used
    successRate?: number; // % of successful generations using this template
    tags?: string[]; // For search/filtering
  };
  isPublic: boolean; // Whether template is visible to all users
  isCurated: boolean; // Whether template is system/curated
}
```

**Template Sources**:
1. **Curated Templates**: System-created templates showcasing best practices
2. **User Templates**: Auto-saved from successful generations
3. **Community Templates**: Public templates from other users (Phase 2)

### F6: Template Search & Discovery

**Search Functionality**:
- Full-text search across template names and descriptions
- Filter by scene, environment, outfit, aspect ratio, quality
- Sort by: Popular, Recent, Success Rate, Alphabetical

**Discovery Features**:
- **"Similar Templates"**: Show templates with similar scene/environment
- **"You Might Like"**: Based on user's generation history
- **"Trending"**: Templates gaining popularity
- **"Featured"**: Curated templates highlighted by RYLA team

### F7: Template Analytics & Success Tracking

**Track Template Performance**:
- Count how many times each template is used
- Track generation success rate per template
- Identify most successful template combinations
- Surface high-performing templates in "Popular" section

**User Analytics**:
- Track which templates users discover
- Measure template usage impact on generation success
- Identify templates that lead to user activation

---

## Acceptance Criteria

### AC-1: Template Library in Content Studio

- [ ] Content Studio has "Generate" and "Templates" tabs
- [ ] Templates tab shows grid of template cards
- [ ] Each template card displays preview image, scene, environment, outfit
- [ ] User can filter templates by scene, environment, aspect ratio, quality
- [ ] User can search templates by name/description
- [ ] "Try Template" button loads template into generation form

### AC-2: Template Application

- [ ] Clicking "Try Template" pre-fills generation form with template config
- [ ] User can modify any pre-filled setting
- [ ] Credit cost preview updates based on template settings
- [ ] "Template applied" notification appears
- [ ] User can clear template and start fresh

### AC-3: Template Creation (Auto-Save)

- [ ] After successful generation, user can save as template
- [ ] System extracts generation metadata automatically
- [ ] User can name template and select preview image
- [ ] Saved template appears in "My Templates" section
- [ ] Template can be edited or deleted by creator

### AC-4: Template Browsing Page

- [ ] Separate `/templates` route exists
- [ ] Page shows hero section and category navigation
- [ ] Template grid displays with filters and search
- [ ] Template detail modal shows full configuration
- [ ] "Use This Template" redirects to Content Studio with template applied
- [ ] Page is accessible from Content Studio and main navigation

### AC-5: Template Metadata

- [ ] Templates store complete generation configuration
- [ ] Templates link to source image/job (if applicable)
- [ ] Usage count and success rate tracked
- [ ] Templates can be marked public/private
- [ ] Curated templates are clearly marked

### AC-6: Template Discovery

- [ ] Search functionality works across names and descriptions
- [ ] Filters work correctly (scene, environment, etc.)
- [ ] Sort options work (Popular, Recent, Success Rate)
- [ ] "Similar Templates" shows relevant suggestions
- [ ] "You Might Like" based on user history (if available)

---

## User Stories

### ST-031: Browse Templates in Content Studio

**As a** user in Content Studio  
**I want to** browse templates with visual examples  
**So that** I can discover successful generation configurations

**AC**: AC-1

### ST-032: Apply Template to Generation

**As a** user browsing templates  
**I want to** click "Try Template" to load configuration  
**So that** I can quickly generate similar content

**AC**: AC-2

### ST-033: Save Successful Generation as Template

**As a** user after generating images  
**I want to** save the generation configuration as a template  
**So that** I can reuse it later

**AC**: AC-3

### ST-034: Discover Templates on Separate Page

**As a** new user  
**I want to** browse a dedicated templates page  
**So that** I can learn what's possible and see examples

**AC**: AC-4

### ST-035: Search and Filter Templates

**As a** user looking for specific styles  
**I want to** search and filter templates  
**So that** I can find templates matching my needs

**AC**: AC-6

---

## Technical Architecture

### Database Schema

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
  
  -- Template configuration
  scene TEXT NOT NULL,
  environment TEXT NOT NULL,
  outfit TEXT NOT NULL,
  aspect_ratio TEXT NOT NULL,
  quality_mode TEXT NOT NULL,
  nsfw BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  source_image_id UUID REFERENCES images(id) ON DELETE SET NULL,
  source_job_id UUID REFERENCES generation_jobs(id) ON DELETE SET NULL,
  is_public BOOLEAN DEFAULT FALSE,
  is_curated BOOLEAN DEFAULT FALSE,
  tags TEXT[],
  usage_count INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2), -- Percentage (0-100)
  
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
CREATE INDEX idx_templates_public ON templates(is_public, is_curated) WHERE is_public = TRUE OR is_curated = TRUE;
CREATE INDEX idx_templates_scene_env ON templates(scene, environment);
CREATE INDEX idx_templates_usage_count ON templates(usage_count DESC);
CREATE INDEX idx_template_usage_template ON template_usage(template_id);
```

### API Endpoints

```
GET /api/templates
  Query params: 
    - scene, environment, aspect_ratio, quality_mode, nsfw
    - search (text search)
    - sort (popular, recent, success_rate)
    - category (all, my_templates, curated, popular)
  Response: { templates: Template[], total: number, page: number }

GET /api/templates/:id
  Response: { template: Template }

POST /api/templates
  Body: {
    name, description, preview_image_id,
    scene, environment, outfit, aspect_ratio, quality_mode, nsfw,
    is_public
  }
  Response: { template: Template }

PUT /api/templates/:id
  Body: { name, description, is_public }
  Response: { template: Template }

DELETE /api/templates/:id
  Response: { deleted: true }

POST /api/templates/:id/apply
  Response: { 
    config: GenerationConfig,
    redirect_url: "/influencer/:id/studio?template=:template_id"
  }

GET /api/templates/:id/stats
  Response: {
    usage_count: number,
    success_rate: number,
    recent_usage: TemplateUsage[]
  }
```

### Frontend Components

**Content Studio Integration**:
- `TemplateLibraryTab.tsx`: Templates tab component
- `TemplateCard.tsx`: Individual template card
- `TemplateFilters.tsx`: Filter sidebar
- `TemplateSearch.tsx`: Search bar component

**Template Browsing Page**:
- `app/templates/page.tsx`: Main templates page
- `TemplateGrid.tsx`: Grid layout component
- `TemplateDetailModal.tsx`: Template detail view
- `TemplateHero.tsx`: Hero section

**Template Creation**:
- `SaveTemplateDialog.tsx`: Dialog for saving template
- `TemplatePreviewSelector.tsx`: Image selector for preview

### Template Application Flow

```
1. User clicks "Try Template" in Content Studio or Templates page
2. Frontend: GET /api/templates/:id
3. Frontend: Load template config into generation form state
4. Frontend: Update scene/environment/outfit/aspect_ratio/quality selectors
5. Frontend: Show "Template applied" notification
6. Frontend: Update credit cost preview
7. User can modify any setting or generate immediately
8. On generation: POST /api/template-usage with template_id
9. Backend: Increment template usage_count
10. Backend: Track generation success for success_rate calculation
```

### Template Creation Flow

```
1. After successful generation (job completed)
2. Frontend: Show "Save as Template?" dialog
3. User: Optionally name template, select preview image
4. Frontend: POST /api/templates with:
   - Generation config (scene, environment, outfit, etc.)
   - Preview image ID
   - User-provided name/description
5. Backend: Create template record
6. Backend: Generate thumbnail from preview image
7. Backend: Return created template
8. Frontend: Show "Template saved" notification
9. Template appears in "My Templates" section
```

---

## Analytics Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `template_library_opened` | User opens Templates tab | `influencer_id`, `source` (studio/browse_page) |
| `template_browsed` | User views template card | `template_id`, `scene`, `environment` |
| `template_applied` | User clicks "Try Template" | `template_id`, `influencer_id` |
| `template_saved` | User saves generation as template | `template_id`, `source_job_id`, `source_image_id` |
| `template_used` | Generation starts with template | `template_id`, `job_id`, `modified` (boolean) |
| `template_page_visited` | User visits `/templates` | `source` (nav_link/onboarding/etc) |
| `template_searched` | User searches templates | `query`, `filters_applied` |
| `template_filtered` | User applies filter | `filter_type`, `filter_value` |

### Key Metrics

1. **Template Discovery Rate**: % of users who browse templates before first generation
2. **Template Usage Rate**: % of generations that use templates
3. **Template Success Rate**: Generation success rate with templates vs without
4. **Template Creation Rate**: % of successful generations saved as templates
5. **Template Reuse Rate**: Average times a template is reused
6. **Time to First Template**: Time from account creation to first template usage

---

## Design Considerations

### Content Studio Integration

**Option A: Tabs (Recommended - Like ZenCreator)**
```
[Generate] [Templates]
─────────────────────
[Generation Form] or [Template Grid]
```

**Option B: Sidebar**
```
[Generation Form] | [Template Library Sidebar]
```

**Option C: Modal Overlay**
```
[Generation Form] → Click "Browse Templates" → Modal opens
```

**Recommendation**: Option A (Tabs) - Most discoverable, doesn't hide generation form

### Template Browsing Page

**Layout**:
- Hero section with search bar
- Category navigation (horizontal tabs)
- Filter sidebar (collapsible on mobile)
- Template grid (responsive: 1-4 columns)
- Infinite scroll or pagination

**Template Card Design**:
```
┌─────────────────────┐
│  [Preview Image]    │
│                     │
├─────────────────────┤
│ Scene: Professional │
│ Environment: Studio │
│ Outfit: Casual      │
│ 9:16 • HQ           │
│                     │
│ [Try Template]      │
│ Used 1.2k times     │
└─────────────────────┘
```

---

## Curated Templates (System Templates)

**Initial Set**: Create 20-30 curated templates showcasing:
- All 8 scene presets
- All 7 environment presets
- Popular outfit combinations
- Different aspect ratios
- Both Draft and HQ examples

**Template Creation Process**:
1. Generate high-quality examples using best practices
2. Select best outputs for each scene/environment combination
3. Create template records with `is_curated = true`
4. Mark as public for all users

**Maintenance**:
- Review and update curated templates quarterly
- Add new templates as new scenes/environments are added
- Remove underperforming templates

---

## Phase 2 Enhancements

- **Template Sharing**: Public templates visible to all users
- **Template Collections**: Group templates by theme (e.g., "Beach Collection")
- **Template Ratings**: Users can rate templates (thumbs up/down)
- **Template Comments**: Community feedback on templates
- **Template Variations**: "Generate variations of this template"
- **Template Export/Import**: Share templates via URL or file
- **AI-Powered Recommendations**: ML-based template suggestions
- **Template Analytics Dashboard**: For creators (if sharing enabled)

---

## Dependencies

- Content Studio (EP-005) - Must be implemented first
- Image Gallery (EP-008) - For template preview images
- Generation Jobs (EP-005) - For template creation from jobs
- User Authentication (EP-002)
- Credits System (EP-009) - For credit cost preview in templates

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Template overload | Medium | Medium | Curate initial set, limit user templates, good filtering |
| Template quality varies | High | Medium | Curated templates, success rate tracking, user ratings (Phase 2) |
| Performance with many templates | Medium | Low | Pagination, caching, efficient queries |
| Users don't discover templates | Medium | High | Prominent placement, onboarding hints, analytics tracking |

---

## Phase Checklist

- [x] P1: Requirements (this epic) ✅
- [x] P2: Stories created ✅
- [x] P3: Architecture design ✅ **See**: `docs/architecture/epics/EP-020-TEMPLATE-GALLERY-P3.md`
- [x] P4: UI mockups (Content Studio tabs, Template page) ✅ **See**: `docs/specs/epics/EP-020-TEMPLATE-GALLERY-P4-UI-SKELETON.md`
- [x] P5: Tech spec ✅ **See**: `docs/specs/epics/EP-020-TEMPLATE-GALLERY-P5-TECH-SPEC.md`
- [ ] P6: Implementation ❌ **Not started** (blocked by missing settings migration)
- [ ] P7: Testing ❌ **Not started**
- [ ] P8: Integration with Content Studio ❌ **Not started**
- [ ] P9: Deployment ❌ **Not started**
- [ ] P10: Validation (template usage metrics) ❌ **Not started**

**Phase Status**: See `EP-020-template-gallery-phase-status.md` for detailed breakdown.

---

## Open Questions

1. **Template Sharing**: Should user templates be public by default, or opt-in?
   - **Recommendation**: Opt-in (is_public = false by default)

2. **Template Limits**: Should there be limits on user-created templates?
   - **Recommendation**: No hard limit for MVP, monitor storage costs

3. **Template Moderation**: How to handle inappropriate templates?
   - **Recommendation**: Report/flag system (Phase 2), manual review for public templates

4. **Template Attribution**: Should templates show creator info?
   - **Recommendation**: Show "Created by @username" for user templates (Phase 2)

5. **Template Versioning**: What if template config changes (e.g., scene renamed)?
   - **Recommendation**: Store full config, handle migrations gracefully

