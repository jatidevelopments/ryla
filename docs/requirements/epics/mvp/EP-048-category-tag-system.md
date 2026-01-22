# [EPIC] EP-048: Category & Tag System with AI Auto-tagging

**Status**: Completed
**Phase**: P2
**Created**: 2026-01-21
**Last Updated**: 2026-01-21


> **Initiative**: [IN-011: Template Gallery & Content Library](../../../initiatives/IN-011-template-gallery-content-library.md)  
> **Phase**: 2-3 (Template Sets Foundation + Discovery & Sorting)  
> **Priority**: P1  
> **Depends On**: EP-046 (Template Sets)

---

## P1: Requirements

### Problem Statement

Templates currently lack a structured categorization system. Users cannot effectively browse templates by theme or style because there are no categories or tags. Additionally, manually tagging every template is time-consuming and inconsistent. An AI-powered auto-tagging system combined with user-editable tags would solve both problems.

### MVP Objective

Implement a category and tag system that:
- Supports hierarchical categories (e.g., "Fashion > Streetwear")
- Supports flat, searchable tags
- Auto-generates tags using AI when templates are created
- Allows users to add/remove tags from their templates
- Provides category pills UI for filtering

**Measurable**: 90% of templates have at least 3 tags within 1 week of feature launch. Category-based browsing accounts for 40% of template discoveries.

### Non-Goals

- Machine learning model training (use existing vision/text models)
- Category creation by users (admin-only)
- Tag moderation/approval workflow
- Multi-language tags

### Business Metric

**Target**: C - Core Value, A - Activation (better discovery = more template usage)

---

## P2: Scoping

### Feature List

| ID | Feature | Description |
|----|---------|-------------|
| F1 | Categories Schema | Hierarchical categories with parent-child relationships |
| F2 | Tags Schema | Flat tags with usage counts and system flag |
| F3 | Category Repository | Data access for categories |
| F4 | Tag Repository | Data access for tags and assignments |
| F5 | AI Auto-tagging Service | Generate tags from template preview images |
| F6 | Tag Management API | CRUD for tags on templates |
| F7 | Seed Categories | Predefined category hierarchy |

### Stories

#### ST-048-001: Categories Database Schema

**As a** developer  
**I want to** create the categories database schema  
**So that** templates can be organized hierarchically

**Acceptance Criteria**:
- [ ] AC1: `template_categories` table created with parent_id self-reference
- [ ] AC2: Unique slug constraint for URL-friendly identifiers
- [ ] AC3: Sort order column for display ordering
- [ ] AC4: is_active flag for soft hiding categories
- [ ] AC5: Indexes for parent_id and slug

#### ST-048-002: Tags Database Schema

**As a** developer  
**I want to** create the tags database schema  
**So that** templates can have searchable labels

**Acceptance Criteria**:
- [ ] AC1: `template_tags` table created
- [ ] AC2: Unique name and slug constraints
- [ ] AC3: `is_system` flag to distinguish AI-generated vs user-created
- [ ] AC4: `usage_count` for popularity tracking
- [ ] AC5: `template_tag_assignments` junction table created
- [ ] AC6: Proper indexes for performance

#### ST-048-003: Category Repository

**As a** developer  
**I want to** create the category repository  
**So that** category data is properly abstracted

**Acceptance Criteria**:
- [ ] AC1: `findAll` returns flat list with parent references
- [ ] AC2: `findTree` returns nested tree structure
- [ ] AC3: `findBySlug` returns single category
- [ ] AC4: `getChildren` returns direct children of a category
- [ ] AC5: `getAncestors` returns path to root

#### ST-048-004: Tag Repository

**As a** developer  
**I want to** create the tag repository  
**So that** tag operations are properly abstracted

**Acceptance Criteria**:
- [ ] AC1: `findAll` with search and pagination
- [ ] AC2: `findByTemplateId` returns tags for a template
- [ ] AC3: `findOrCreate` creates tag if not exists
- [ ] AC4: `assignToTemplate` adds tag to template
- [ ] AC5: `removeFromTemplate` removes tag from template
- [ ] AC6: `incrementUsage` updates usage_count
- [ ] AC7: `getPopular` returns most-used tags

#### ST-048-005: AI Auto-tagging Service

**As a** system  
**I want to** automatically generate tags for new templates  
**So that** templates are searchable without manual effort

**Acceptance Criteria**:
- [ ] AC1: Analyze template preview image using vision model
- [ ] AC2: Extract relevant tags (scene, mood, style, colors, objects)
- [ ] AC3: Normalize tags to existing tag vocabulary when possible
- [ ] AC4: Create new tags if no match (marked as system-generated)
- [ ] AC5: Assign 3-8 tags per template
- [ ] AC6: Queue-based processing for async tagging
- [ ] AC7: Retry logic for API failures

#### ST-048-006: Tag Management tRPC Endpoints

**As a** user  
**I want to** manage tags on my templates  
**So that** I can improve discoverability

**Acceptance Criteria**:
- [ ] AC1: `tags.list` - List all tags with optional search
- [ ] AC2: `tags.getByTemplate` - Get tags for a template
- [ ] AC3: `tags.addToTemplate` - Add tag to user's template
- [ ] AC4: `tags.removeFromTemplate` - Remove tag from user's template
- [ ] AC5: `tags.getPopular` - Get most-used tags
- [ ] AC6: Only template owner can modify tags

#### ST-048-007: Seed Categories

**As a** user  
**I want to** browse predefined categories  
**So that** I can discover templates by theme

**Acceptance Criteria**:
- [ ] AC1: Seed script creates initial category hierarchy
- [ ] AC2: Categories cover major themes: Scene, Style, Mood, Content Type
- [ ] AC3: Each category has icon/emoji
- [ ] AC4: Categories sorted by popularity/relevance

### Predefined Categories (Seed Data)

```yaml
categories:
  - name: Scene
    slug: scene
    icon: 🏖️
    children:
      - name: Beach
        slug: beach
      - name: Studio
        slug: studio
      - name: Urban
        slug: urban
      - name: Nature
        slug: nature
      - name: Indoor
        slug: indoor
      - name: Fantasy
        slug: fantasy

  - name: Style
    slug: style
    icon: ✨
    children:
      - name: Fashion
        slug: fashion
        children:
          - name: Streetwear
            slug: streetwear
          - name: Glamour
            slug: glamour
          - name: Casual
            slug: casual
      - name: Artistic
        slug: artistic
      - name: Minimal
        slug: minimal
      - name: Retro
        slug: retro

  - name: Mood
    slug: mood
    icon: 🎭
    children:
      - name: Cozy
        slug: cozy
      - name: Energetic
        slug: energetic
      - name: Romantic
        slug: romantic
      - name: Professional
        slug: professional
      - name: Playful
        slug: playful

  - name: Activity
    slug: activity
    icon: 🏃
    children:
      - name: Fitness
        slug: fitness
      - name: Travel
        slug: travel
      - name: Lifestyle
        slug: lifestyle
      - name: Work
        slug: work
```

### Analytics Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `template_auto_tagged` | AI generates tags | `template_id`, `tag_count`, `tags` |
| `template_tag_added` | User adds tag | `template_id`, `tag_name`, `is_new_tag` |
| `template_tag_removed` | User removes tag | `template_id`, `tag_name` |
| `category_filter_applied` | User filters by category | `category_slug`, `category_name` |
| `tag_search` | User searches tags | `query`, `result_count` |

### Non-MVP Items

- User-created categories
- Tag synonyms/aliases
- Tag translation
- Category images/thumbnails
- Tag recommendations based on user history

---

## P3: Architecture

### Data Model

```sql
-- Template Categories (hierarchical)
CREATE TABLE template_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES template_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT, -- emoji or icon name
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_template_categories_parent ON template_categories(parent_id);
CREATE INDEX idx_template_categories_slug ON template_categories(slug);
CREATE INDEX idx_template_categories_active ON template_categories(is_active) WHERE is_active = true;

-- Template Tags (flat)
CREATE TABLE template_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  usage_count INTEGER DEFAULT 0,
  is_system BOOLEAN DEFAULT false, -- true = AI-generated
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_template_tags_slug ON template_tags(slug);
CREATE INDEX idx_template_tags_usage ON template_tags(usage_count DESC);
CREATE INDEX idx_template_tags_system ON template_tags(is_system);

-- Template Tag Assignments (junction)
CREATE TABLE template_tag_assignments (
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES template_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (template_id, tag_id)
);

-- Indexes
CREATE INDEX idx_template_tag_assignments_template ON template_tag_assignments(template_id);
CREATE INDEX idx_template_tag_assignments_tag ON template_tag_assignments(tag_id);

-- Add category_id to templates table
ALTER TABLE templates ADD COLUMN category_id UUID REFERENCES template_categories(id);
CREATE INDEX idx_templates_category ON templates(category_id);
```

### TypeScript Types

```typescript
// libs/shared/src/types/template-categories.ts

export interface TemplateCategory {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
}

export interface TemplateCategoryTree extends TemplateCategory {
  children: TemplateCategoryTree[];
}

// libs/shared/src/types/template-tags.ts

export interface TemplateTag {
  id: string;
  name: string;
  slug: string;
  usageCount: number;
  isSystem: boolean;
  createdAt: Date;
}

export interface TemplateTagAssignment {
  templateId: string;
  tagId: string;
  createdAt: Date;
}
```

### AI Auto-tagging Flow

```
1. Template created/updated with preview image
2. Queue job: "auto-tag-template" with template_id
3. Worker picks up job:
   a. Fetch template preview image
   b. Call vision model (GPT-4V / Claude Vision) with prompt:
      "Analyze this image and provide 5-8 descriptive tags covering:
       - Scene/location (beach, studio, urban, etc.)
       - Style (casual, glamour, minimal, etc.)
       - Mood (cozy, energetic, romantic, etc.)
       - Key objects/elements visible
       Return as JSON array of lowercase strings."
   c. Parse response, normalize to existing tags
   d. Create new tags if needed (is_system = true)
   e. Assign tags to template
   f. Emit analytics event
4. Template now has tags for discovery
```

---

## Files to Create/Modify

### New Files

| File | Purpose |
|------|---------|
| `libs/data/src/schema/template-categories.schema.ts` | Category schema |
| `libs/data/src/schema/template-tags.schema.ts` | Tags and assignments schema |
| `libs/data/src/repositories/template-categories.repository.ts` | Category data access |
| `libs/data/src/repositories/template-tags.repository.ts` | Tags data access |
| `libs/business/src/services/template-tagging.service.ts` | AI tagging logic |
| `libs/trpc/src/routers/template-categories.router.ts` | Category API |
| `libs/trpc/src/routers/template-tags.router.ts` | Tags API |
| `libs/shared/src/types/template-categories.ts` | Category types |
| `libs/shared/src/types/template-tags.ts` | Tag types |
| `scripts/setup/seed-template-categories.ts` | Seed script |
| `drizzle/migrations/XXXX_create_categories_tags.sql` | Migration |

### Modify Files

| File | Changes |
|------|---------|
| `libs/data/src/schema/templates.schema.ts` | Add category_id column |
| `libs/data/src/schema/index.ts` | Export new schemas |
| `libs/trpc/src/root.ts` | Register new routers |

---

## Task Breakdown

| Task ID | Story | Task | Estimate |
|---------|-------|------|----------|
| TSK-048-001 | ST-048-001 | Create categories schema | 1h |
| TSK-048-002 | ST-048-001 | Create migration | 0.5h |
| TSK-048-003 | ST-048-002 | Create tags schema | 1h |
| TSK-048-004 | ST-048-002 | Create assignments junction table | 0.5h |
| TSK-048-005 | ST-048-003 | Create CategoryRepository | 2h |
| TSK-048-006 | ST-048-003 | Implement tree building | 1h |
| TSK-048-007 | ST-048-004 | Create TagRepository | 2h |
| TSK-048-008 | ST-048-004 | Implement findOrCreate | 0.5h |
| TSK-048-009 | ST-048-005 | Create TemplateTaggingService | 2h |
| TSK-048-010 | ST-048-005 | Implement vision model call | 2h |
| TSK-048-011 | ST-048-005 | Implement tag normalization | 1h |
| TSK-048-012 | ST-048-005 | Add queue job processing | 1h |
| TSK-048-013 | ST-048-006 | Create categories tRPC router | 1h |
| TSK-048-014 | ST-048-006 | Create tags tRPC router | 1h |
| TSK-048-015 | ST-048-007 | Create seed script | 1h |
| TSK-048-016 | ST-048-007 | Run seed and verify | 0.5h |
| TSK-048-017 | - | Write unit tests | 2h |
| TSK-048-018 | - | Add analytics events | 0.5h |
| **Total** | | | **20.5h** |

---

## Dependencies

- **Blocks**: EP-047 (UX Redesign - needs categories for pills)
- **Blocked By**: EP-046 (Template Sets - shared infrastructure)

---

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| AI tagging quality | Medium | Medium | Allow user overrides, review system tags |
| Vision API costs | Medium | Low | Cache results, batch processing |
| Category hierarchy too deep | Low | Low | Limit to 3 levels |

---

## Phase Checklist

- [x] P1: Requirements ✅
- [x] P2: Scoping ✅
- [x] P3: Architecture ✅
- [ ] P4: UI Skeleton (covered in EP-047)
- [x] P5: Technical Spec ✅
- [x] P6: Implementation ✅ (schema, repositories, services, tRPC routers, seed data)
- [ ] P7: Testing
- [ ] P8: Integration
- [ ] P9: Deployment
- [ ] P10: Validation

---

## Related Documentation

- Initiative: `docs/initiatives/IN-011-template-gallery-content-library.md`
- Parent Epic: `docs/requirements/epics/mvp/EP-020-template-gallery.md`
- Existing Categories: `docs/specs/general/TEMPLATE-CATEGORIES.md`
