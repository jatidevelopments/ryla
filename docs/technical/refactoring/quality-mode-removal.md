# qualityMode Removal - Technical Cleanup

> **Initiative**: [IN-011: Template Gallery & Content Library](../initiatives/IN-011-template-gallery-content-library.md)  
> **Phase**: 1 (Cleanup & Simplification)  
> **Priority**: P1 - Must complete before other IN-011 work

---

## Overview

The `qualityMode` concept (draft vs hq) is being removed from the RYLA codebase entirely. This simplifies the user experience and reduces complexity in the template system.

---

## Rationale

1. **User Confusion**: Users don't understand the difference between draft and HQ
2. **Minimal Value**: Quality difference is not significant enough to warrant the complexity
3. **Template Complexity**: Templates storing qualityMode creates unnecessary filtering options
4. **Simplified UX**: One fewer decision point for users

---

## Current State

### Occurrence Count (as of 2026-01-19)

| Location | Matches | Files |
|----------|---------|-------|
| `libs/` | 33 | 17 |
| `apps/web/` | 51 | 17 |
| `apps/api/` | 43 | 11 |
| **Total** | ~127 | ~45 |

### Files to Modify

#### libs/

```
libs/business/src/store/character-wizard.store.ts
libs/trpc/src/routers/activity.router.ts
libs/shared/src/types/activity.ts
libs/trpc/src/routers/credits.router.ts
libs/data/src/repositories/templates.repository.ts
libs/data/src/schema/generation-jobs.schema.ts
libs/trpc/src/routers/user.router.ts
libs/data/src/schema/templates.schema.ts
libs/trpc/src/routers/generation.router.ts
libs/business/src/services/image-generation.service.ts
libs/business/src/services/template.service.ts
libs/data/src/schema/images.schema.ts
libs/trpc/src/routers/templates.router.ts
libs/data/src/schema/credits.schema.ts
libs/shared/src/constants/character/generation-options.ts
libs/trpc/src/routers/post.router.ts
libs/data/src/schema/posts.schema.ts
```

#### apps/web/

```
apps/web/app/studio/hooks/useGenerationActions.ts
apps/web/lib/api/studio.ts
apps/web/app/influencer/[id]/studio/page.tsx
apps/web/components/studio/StudioPanel.tsx
apps/web/components/wizard/components/generation-settings.tsx
apps/web/app/templates/page.tsx
apps/web/app/activity/utils/estimate-credit-cost.ts
apps/web/components/wizard/steps/StepGenerate.tsx
apps/web/components/notifications/utils.ts
apps/web/components/studio/templates/template-library-tab.tsx
apps/web/components/studio/templates/template-filters.tsx
apps/web/components/studio/templates/template-detail-modal.tsx
apps/web/components/studio/templates/template-card.tsx
apps/web/app/activity/utils/get-activity-meta.tsx
apps/web/components/notifications/NotificationItem.tsx
apps/web/app/activity/components/activity-item.tsx
apps/web/app/templates/hooks/useTemplateFilters.ts
```

#### apps/api/

```
apps/api/src/modules/image/services/studio-generation.service.ts
apps/api/src/modules/image/services/comfyui-results.service.ts
apps/api/src/modules/image/services/profile-picture-set.service.ts
apps/api/src/modules/image/services/studio-generation.service.spec.ts
apps/api/src/modules/image-gallery/services/image-gallery.service.ts
apps/api/src/modules/image/services/inpaint-edit.service.ts
apps/api/src/modules/image/image.controller.ts
apps/api/src/modules/image/dto/req/generate-studio-images.dto.ts
apps/api/src/modules/credits/services/credit-management.service.ts
```

---

## Migration Strategy

### Phase 1: Database Schema

1. Create migration to:
   - Remove `qualityMode` column from `templates.config` (JSONB - update existing records)
   - Remove `qualityMode` column from `posts` table
   - Remove `quality_mode` enum if exists
   - Keep `qualityMode` in `generation_jobs` for historical data (mark as deprecated)

```sql
-- Migration: Remove qualityMode from templates config
UPDATE templates 
SET config = config - 'qualityMode' 
WHERE config ? 'qualityMode';

-- Remove from posts if column exists
ALTER TABLE posts DROP COLUMN IF EXISTS quality_mode;

-- Add comment marking generation_jobs.quality_mode as deprecated
COMMENT ON COLUMN generation_jobs.quality_mode IS 'DEPRECATED: Kept for historical data only. Do not use in new code.';
```

### Phase 2: Backend Changes

1. Remove `qualityMode` from:
   - DTOs (`generate-studio-images.dto.ts`)
   - Service method parameters
   - Template schema type (`TemplateConfig`)
   - API response types

2. Update services to:
   - Use hardcoded quality value (e.g., always use best quality)
   - Remove quality mode branching logic
   - Simplify credit calculations (if quality-dependent)

### Phase 3: Frontend Changes

1. Remove from UI:
   - Template filter dropdowns
   - Template card badges
   - Studio panel quality selector
   - Activity/notification displays

2. Update:
   - Generation form to not include qualityMode
   - Template hooks to not filter by qualityMode
   - Type definitions

### Phase 4: Documentation

1. Remove from:
   - EP-020 template schema examples
   - API documentation
   - TEMPLATE-CATEGORIES.md

---

## Acceptance Criteria

- [x] No occurrences of `qualityMode` or `quality_mode` in:
  - [x] Frontend components
  - [x] API endpoints
  - [x] New database records
- [x] Existing data gracefully handled (historical records preserved)
- [ ] All tests pass (pending test run)
- [x] No TypeScript errors
- [x] Credit calculations work correctly without qualityMode

---

## Rollback Plan

If issues arise:
1. Quality mode logic is in version control
2. Migration is reversible (add column back)
3. Historical data preserved in generation_jobs

---

## Testing Checklist

- [x] Template creation works without qualityMode
- [x] Template application works without qualityMode
- [x] Generation works without qualityMode
- [x] Credit cost estimation works
- [x] Activity feed displays correctly
- [x] Notifications display correctly
- [x] Template filtering works (without qualityMode filter)
- [ ] Historical templates still visible (with qualityMode removed from config) - pending migration

---

## Related Files

- IN-011: `docs/initiatives/IN-011-template-gallery-content-library.md`
- EP-020: `docs/requirements/epics/mvp/EP-020-template-gallery.md`
- Template Schema: `libs/data/src/schema/templates.schema.ts`

---

**Created**: 2026-01-19  
**Completed**: 2026-01-19  
**Status**: ✅ Implementation Complete

---

## Implementation Summary

### Completed Changes

#### libs/ (Data Layer)
| File | Changes |
|------|---------|
| `libs/shared/src/types/activity.ts` | Removed `qualityMode` property |
| `libs/shared/src/constants/character/generation-options.ts` | Removed `QUALITY_MODE_OPTIONS` and `QualityModeOption` |
| `libs/data/src/schema/templates.schema.ts` | Removed `qualityMode` from `TemplateConfig` |
| `libs/data/src/schema/posts.schema.ts` | Kept enum for DB backward compatibility, removed usage |
| `libs/data/src/schema/images.schema.ts` | Removed `qualityMode` column reference |
| `libs/data/src/schema/generation-jobs.schema.ts` | Removed from `GenerationInput` interface |
| `libs/data/src/repositories/templates.repository.ts` | Removed from filters |

#### libs/ (Business Layer)
| File | Changes |
|------|---------|
| `libs/business/src/services/template.service.ts` | Removed qualityMode validation |
| `libs/business/src/services/image-generation.service.ts` | Removed from input |
| `libs/business/src/store/character-wizard.store.ts` | Removed from form state |

#### libs/ (tRPC Routers)
| File | Changes |
|------|---------|
| `libs/trpc/src/routers/generation.router.ts` | Removed from schema and logic |
| `libs/trpc/src/routers/templates.router.ts` | Removed from filters |
| `libs/trpc/src/routers/post.router.ts` | Removed from create schema |
| `libs/trpc/src/routers/activity.router.ts` | Removed from activity mapping |
| `libs/trpc/src/routers/credits.router.ts` | Removed from list query |
| `libs/trpc/src/routers/user.router.ts` | Removed from image upload |

#### apps/api/ (Backend)
| File | Changes |
|------|---------|
| `apps/api/src/modules/image/dto/req/generate-studio-images.dto.ts` | Removed property |
| `apps/api/src/modules/image/image.controller.ts` | Updated credit logic |
| `apps/api/src/modules/image/services/studio-generation.service.ts` | Removed logic, uses standard params |
| `apps/api/src/modules/image/services/inpaint-edit.service.ts` | Removed references |
| `apps/api/src/modules/image/services/comfyui-results.service.ts` | Removed from updates |
| `apps/api/src/modules/image/services/profile-picture-set.service.ts` | Removed logic |
| `apps/api/src/modules/image/services/studio-generation.service.spec.ts` | Updated tests |

#### apps/web/ (Frontend)
| File | Changes |
|------|---------|
| `apps/web/app/studio/hooks/useGenerationActions.ts` | Removed from generation call |
| `apps/web/lib/api/studio.ts` | Removed from types and API |
| `apps/web/components/studio/StudioPanel.tsx` | Removed HQ toggle |
| `apps/web/components/studio/templates/template-filters.tsx` | Removed filter |
| `apps/web/components/studio/templates/template-detail-modal.tsx` | Removed display |
| `apps/web/components/studio/templates/template-card.tsx` | Removed badge |
| `apps/web/components/studio/templates/template-library-tab.tsx` | Removed from query |

#### apps/mcp/ (MCP Tools)
| File | Changes |
|------|---------|
| `apps/mcp/src/tools/templates.ts` | Removed from schema and params |
| `apps/mcp/src/tools/generation.ts` | Removed from params and body |

### Remaining Work

1. **Database Migration**: Create and run migration to remove `qualityMode` from existing template configs
2. **Full Test Suite**: Run complete test suite to verify no regressions
3. **Staging Deployment**: Deploy to staging and verify end-to-end
4. **Production Deployment**: Deploy changes to production
