# [EPIC] EP-046: Template Sets Data Model & API

**Status**: Completed
**Phase**: P2
**Created**: 2026-01-21
**Last Updated**: 2026-01-21


> **Initiative**: [IN-011: Template Gallery & Content Library](../../../initiatives/IN-011-template-gallery-content-library.md)  
> **Phase**: 2 (Template Sets Foundation)  
> **Priority**: P1  
> **Depends On**: EP-045 (qualityMode Removal)

---

## P1: Requirements

### Problem Statement

Users want to apply multiple templates together as a cohesive set (similar to profile picture sets), but the current system only supports individual templates. This limits the ability to create curated content collections like "Beach Photoshoot Set" or "Professional Headshots Set" that generate multiple coordinated images at once.

### MVP Objective

Implement template sets as first-class entities that:
- Contain multiple individual templates in a specific order
- Can be created, browsed, and applied like individual templates
- Support all content types (image, video, lip_sync, audio, mixed)
- Have their own metadata (name, description, tags, likes)

**Measurable**: Users can create template sets containing 2+ templates and apply them to generate multiple images with a single action.

### Non-Goals

- AI-powered set generation (creating sets automatically)
- Set templates from external sources
- Collaborative set editing
- Set versioning

### Business Metric

**Target**: C - Core Value, A - Activation (sets make content creation faster and more consistent)

---

## P2: Scoping

### Feature List

| ID | Feature | Description |
|----|---------|-------------|
| F1 | Template Sets Schema | Database tables for template sets and memberships |
| F2 | Template Sets Repository | Data access layer for template sets |
| F3 | Template Sets Service | Business logic for set operations |
| F4 | Template Sets tRPC Router | API endpoints for set CRUD |
| F5 | Template Set Application | Logic to apply a set to an influencer |

### Stories

#### ST-046-001: Template Sets Database Schema

**As a** developer  
**I want to** create the template sets database schema  
**So that** sets can be stored and queried efficiently

**Acceptance Criteria**:
- [ ] AC1: `template_sets` table created with all required columns
- [ ] AC2: `template_set_members` junction table created
- [ ] AC3: Proper indexes for performance (user_id, is_public, content_type)
- [ ] AC4: Foreign key constraints properly defined
- [ ] AC5: Migration is reversible

#### ST-046-002: Template Sets Repository

**As a** developer  
**I want to** create the template sets repository  
**So that** data access is properly abstracted

**Acceptance Criteria**:
- [ ] AC1: `findAll` with filters (userId, isPublic, contentType, search)
- [ ] AC2: `findById` returns set with member templates
- [ ] AC3: `create` creates set with initial members
- [ ] AC4: `update` updates set metadata and members
- [ ] AC5: `delete` removes set (cascade to members)
- [ ] AC6: `addMember` adds template to set
- [ ] AC7: `removeMember` removes template from set
- [ ] AC8: `reorderMembers` updates order positions

#### ST-046-003: Template Sets Service

**As a** developer  
**I want to** create the template sets service  
**So that** business logic is properly encapsulated

**Acceptance Criteria**:
- [ ] AC1: Validate set creation (name required, at least 1 member)
- [ ] AC2: Validate member templates exist and user has access
- [ ] AC3: Calculate set content_type from members (image/video/mixed)
- [ ] AC4: Track usage count on set application
- [ ] AC5: Handle private/public visibility rules
- [ ] AC6: Emit analytics events for set operations

#### ST-046-004: Template Sets tRPC Router

**As a** developer  
**I want to** create tRPC endpoints for template sets  
**So that** the frontend can interact with sets

**Acceptance Criteria**:
- [ ] AC1: `templateSets.list` - List sets with filters and pagination
- [ ] AC2: `templateSets.getById` - Get set with members
- [ ] AC3: `templateSets.create` - Create new set
- [ ] AC4: `templateSets.update` - Update set metadata/members
- [ ] AC5: `templateSets.delete` - Delete set
- [ ] AC6: `templateSets.apply` - Get set config for application
- [ ] AC7: All endpoints require authentication
- [ ] AC8: Users can only modify their own sets

#### ST-046-005: Template Set Application Logic

**As a** user  
**I want to** apply a template set to my influencer  
**So that** I can generate multiple images with one action

**Acceptance Criteria**:
- [ ] AC1: `apply` returns array of template configs
- [ ] AC2: Each config ready to pass to generation
- [ ] AC3: Order preserved from set member positions
- [ ] AC4: Usage count incremented on apply
- [ ] AC5: Analytics event fired on apply

### Analytics Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `template_set_created` | User creates a set | `set_id`, `member_count`, `content_type` |
| `template_set_updated` | User updates a set | `set_id`, `changes` (members_added, members_removed) |
| `template_set_deleted` | User deletes a set | `set_id` |
| `template_set_applied` | User applies a set | `set_id`, `influencer_id`, `member_count` |
| `template_set_viewed` | User views set details | `set_id`, `source` (gallery/studio) |

### Non-MVP Items

- Set duplication/cloning
- Set sharing via link
- Set collaboration
- Set analytics dashboard

---

## P3: Architecture

### Data Model

```sql
-- Template Sets table
CREATE TABLE template_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Metadata
  name TEXT NOT NULL,
  description TEXT,
  preview_image_url TEXT,
  thumbnail_url TEXT,
  
  -- Visibility
  is_public BOOLEAN DEFAULT false,
  is_curated BOOLEAN DEFAULT false,
  
  -- Content type (derived from members or set explicitly)
  content_type TEXT NOT NULL DEFAULT 'image', -- 'image', 'video', 'lip_sync', 'audio', 'mixed'
  
  -- Stats
  likes_count INTEGER DEFAULT 0,
  usage_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_template_sets_user ON template_sets(user_id);
CREATE INDEX idx_template_sets_public ON template_sets(is_public) WHERE is_public = true;
CREATE INDEX idx_template_sets_content_type ON template_sets(content_type);
CREATE INDEX idx_template_sets_created ON template_sets(created_at DESC);

-- Template Set Members (junction table)
CREATE TABLE template_set_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  set_id UUID NOT NULL REFERENCES template_sets(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  order_position INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(set_id, template_id)
);

-- Indexes
CREATE INDEX idx_template_set_members_set ON template_set_members(set_id);
CREATE INDEX idx_template_set_members_template ON template_set_members(template_id);
CREATE INDEX idx_template_set_members_order ON template_set_members(set_id, order_position);
```

### TypeScript Types

```typescript
// libs/shared/src/types/template-sets.ts

export interface TemplateSet {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  previewImageUrl: string | null;
  thumbnailUrl: string | null;
  isPublic: boolean;
  isCurated: boolean;
  contentType: 'image' | 'video' | 'lip_sync' | 'audio' | 'mixed';
  likesCount: number;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateSetMember {
  id: string;
  setId: string;
  templateId: string;
  orderPosition: number;
  createdAt: Date;
}

export interface TemplateSetWithMembers extends TemplateSet {
  members: Array<TemplateSetMember & { template: Template }>;
}

export interface CreateTemplateSetInput {
  name: string;
  description?: string;
  templateIds: string[]; // Order determines position
  isPublic?: boolean;
}

export interface UpdateTemplateSetInput {
  id: string;
  name?: string;
  description?: string;
  templateIds?: string[]; // Full replacement
  isPublic?: boolean;
}
```

### API Contracts

```typescript
// libs/trpc/src/routers/template-sets.router.ts

// List sets
templateSets.list.query({
  input: {
    userId?: string;
    isPublic?: boolean;
    contentType?: 'image' | 'video' | 'lip_sync' | 'audio' | 'mixed';
    search?: string;
    page?: number;
    limit?: number;
  },
  output: {
    sets: TemplateSet[];
    total: number;
    page: number;
    totalPages: number;
  }
});

// Get set by ID with members
templateSets.getById.query({
  input: { id: string },
  output: TemplateSetWithMembers
});

// Create set
templateSets.create.mutation({
  input: CreateTemplateSetInput,
  output: TemplateSetWithMembers
});

// Update set
templateSets.update.mutation({
  input: UpdateTemplateSetInput,
  output: TemplateSetWithMembers
});

// Delete set
templateSets.delete.mutation({
  input: { id: string },
  output: { success: boolean }
});

// Apply set (get configs for generation)
templateSets.apply.query({
  input: { id: string },
  output: {
    set: TemplateSet;
    configs: TemplateConfig[]; // Ordered array of template configs
  }
});
```

---

## Files to Create/Modify

### New Files

| File | Purpose |
|------|---------|
| `libs/data/src/schema/template-sets.schema.ts` | Drizzle schema for template sets |
| `libs/data/src/repositories/template-sets.repository.ts` | Repository for set operations |
| `libs/business/src/services/template-set.service.ts` | Business logic for sets |
| `libs/trpc/src/routers/template-sets.router.ts` | tRPC router for sets |
| `libs/shared/src/types/template-sets.ts` | TypeScript types |
| `drizzle/migrations/XXXX_create_template_sets.sql` | Migration file |

### Modify Files

| File | Changes |
|------|---------|
| `libs/data/src/schema/index.ts` | Export template sets schema |
| `libs/data/src/repositories/index.ts` | Export template sets repository |
| `libs/trpc/src/routers/index.ts` | Add template sets router |
| `libs/trpc/src/root.ts` | Register template sets router |
| `libs/shared/src/types/index.ts` | Export template set types |

---

## Task Breakdown

| Task ID | Story | Task | Estimate |
|---------|-------|------|----------|
| TSK-046-001 | ST-046-001 | Create template_sets schema | 1h |
| TSK-046-002 | ST-046-001 | Create template_set_members schema | 1h |
| TSK-046-003 | ST-046-001 | Create migration file | 1h |
| TSK-046-004 | ST-046-001 | Add indexes | 0.5h |
| TSK-046-005 | ST-046-002 | Create TemplateSetsRepository class | 2h |
| TSK-046-006 | ST-046-002 | Implement findAll with filters | 1h |
| TSK-046-007 | ST-046-002 | Implement findById with members | 1h |
| TSK-046-008 | ST-046-002 | Implement create/update/delete | 2h |
| TSK-046-009 | ST-046-003 | Create TemplateSetService class | 1h |
| TSK-046-010 | ST-046-003 | Implement validation logic | 1h |
| TSK-046-011 | ST-046-003 | Implement content_type derivation | 0.5h |
| TSK-046-012 | ST-046-003 | Add analytics events | 0.5h |
| TSK-046-013 | ST-046-004 | Create template-sets router | 1h |
| TSK-046-014 | ST-046-004 | Implement list endpoint | 1h |
| TSK-046-015 | ST-046-004 | Implement CRUD endpoints | 2h |
| TSK-046-016 | ST-046-005 | Implement apply endpoint | 1h |
| TSK-046-017 | ST-046-005 | Add usage tracking | 0.5h |
| TSK-046-018 | - | Write unit tests | 3h |
| **Total** | | | **21h** |

---

## Dependencies

- **Blocks**: EP-047 (UX Redesign - needs sets to display)
- **Blocked By**: EP-045 (qualityMode removal)

---

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Complex member ordering | Low | Medium | Use explicit order_position column |
| Orphan sets when templates deleted | Low | Low | CASCADE delete on FK handles this |
| Performance with large sets | Low | Medium | Limit max members per set (e.g., 20) |

---

## Phase Checklist

- [x] P1: Requirements ✅
- [x] P2: Scoping ✅
- [x] P3: Architecture ✅
- [ ] P4: UI Skeleton (covered in EP-047)
- [x] P5: Technical Spec ✅
- [x] P6: Implementation ✅ (schema, repository, service, tRPC router)
- [ ] P7: Testing
- [ ] P8: Integration
- [ ] P9: Deployment
- [ ] P10: Validation

---

## Related Documentation

- Initiative: `docs/initiatives/IN-011-template-gallery-content-library.md`
- Parent Epic: `docs/requirements/epics/mvp/EP-020-template-gallery.md`
- Depends On: `docs/requirements/epics/mvp/EP-045-quality-mode-removal.md`
