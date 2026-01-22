# [EPIC] EP-047: Template Gallery UX Redesign

**Status**: Completed
**Phase**: P2
**Created**: 2026-01-21
**Last Updated**: 2026-01-21


> **Initiative**: [IN-011: Template Gallery & Content Library](../../../initiatives/IN-011-template-gallery-content-library.md)  
> **Phase**: 2-3 (Template Sets Foundation + Discovery & Sorting)  
> **Priority**: P1  
> **Depends On**: EP-045 (qualityMode Removal), EP-046 (Template Sets)

---

## P1: Requirements

### Problem Statement

The current template gallery UI is complex and confusing with multiple filter dropdowns (scene, environment, aspectRatio, qualityMode, nsfw). Users struggle to discover templates efficiently. The proven MDC pattern uses a simpler approach with top-level tabs, sort buttons, and expandable category pills that is more intuitive and visually appealing.

### MVP Objective

Redesign the template gallery with MDC-style UX:
- Top-level tabs for Templates vs Sets vs All
- Horizontal sort buttons (Popular, Trending, New, Recent)
- Content type dropdown (Images, Videos, Lip Sync, Audio, All)
- Expandable category pill grid
- Influencer selection modal for template application

**Measurable**: Template browse events increase by 50% after redesign. Template application rate increases by 25%.

### Non-Goals

- Complete visual redesign (colors, typography, etc.)
- Mobile-specific optimizations (follow-up epic)
- Advanced search with filters
- Template creation UI (separate story)

### Business Metric

**Target**: A - Activation, C - Core Value (better discovery = more template usage = better content)

---

## P2: Scoping

### Feature List

| ID | Feature | Description |
|----|---------|-------------|
| F1 | Type Tabs | Top-level tabs: Templates, Sets, All |
| F2 | Sort Buttons | Horizontal bar: Popular, Trending, New, Recent |
| F3 | Content Type Filter | Dropdown: Images, Videos, Lip Sync, Audio, All |
| F4 | Category Pills | Expandable grid of category chips |
| F5 | Template/Set Cards | Unified card component for both types |
| F6 | Influencer Selection Modal | Modal to select influencer before applying |
| F7 | Template Detail View | Modal/panel showing full template details |

### Stories

#### ST-047-001: Type Tabs Component

**As a** user  
**I want to** toggle between Templates, Sets, and All  
**So that** I can focus on the content type I want

**Acceptance Criteria**:
- [ ] AC1: Three tabs displayed horizontally at top: Templates, Sets, All
- [ ] AC2: Active tab visually distinguished (MDC-style gradient)
- [ ] AC3: Tab selection updates URL query param (`?type=templates|sets|all`)
- [ ] AC4: Default is "All" for new visitors
- [ ] AC5: Tab counts shown (e.g., "Templates (124)")

#### ST-047-002: Sort Buttons Component

**As a** user  
**I want to** sort templates by different criteria  
**So that** I can find what I'm looking for faster

**Acceptance Criteria**:
- [ ] AC1: Four sort buttons: Popular, Trending, New, Recent
- [ ] AC2: Active sort visually distinguished
- [ ] AC3: Sort selection updates URL query param (`?sort=popular|trending|new|recent`)
- [ ] AC4: Default is "Popular"
- [ ] AC5: Icons for each sort option (MDC-style)
- [ ] AC6: Mobile: Dropdown instead of buttons

#### ST-047-003: Content Type Filter

**As a** user  
**I want to** filter by content type  
**So that** I only see relevant templates

**Acceptance Criteria**:
- [ ] AC1: Dropdown with options: All, Images, Videos, Lip Sync, Audio
- [ ] AC2: Selection updates URL query param (`?contentType=image|video|lip_sync|audio`)
- [ ] AC3: Default is "All"
- [ ] AC4: Count shown per option

#### ST-047-004: Category Pills Component

**As a** user  
**I want to** filter by category using visual pills  
**So that** browsing is quick and intuitive

**Acceptance Criteria**:
- [ ] AC1: Horizontal row of category pills with overflow masking
- [ ] AC2: "All" pill selected by default
- [ ] AC3: Active pill has gradient background (MDC-style)
- [ ] AC4: "All Tags" button expands full grid
- [ ] AC5: Expanded view shows all categories in wrapped grid
- [ ] AC6: Collapse button to return to single row
- [ ] AC7: Selection updates URL query param (`?category=slug`)

#### ST-047-005: Template/Set Card Component

**As a** user  
**I want to** see consistent cards for templates and sets  
**So that** I can quickly identify what I'm looking at

**Acceptance Criteria**:
- [ ] AC1: Card shows preview image
- [ ] AC2: Card shows name (truncated if long)
- [ ] AC3: Card shows likes count with heart icon
- [ ] AC4: Card shows content type badge (image/video/etc.)
- [ ] AC5: Sets show member count badge (e.g., "5 templates")
- [ ] AC6: Hover shows "Apply" button
- [ ] AC7: Click opens detail modal
- [ ] AC8: Like button toggles like state

#### ST-047-006: Influencer Selection Modal

**As a** user  
**I want to** select which influencer to apply a template to  
**So that** I can use templates across my influencers

**Acceptance Criteria**:
- [ ] AC1: Modal shows list of user's influencers
- [ ] AC2: Each influencer shows avatar, name, and image count
- [ ] AC3: Clicking influencer applies template and navigates to studio
- [ ] AC4: Modal reuses existing influencer selector from studio toolbar
- [ ] AC5: "Create New" option if user has no influencers
- [ ] AC6: Modal can be triggered from card or detail view

#### ST-047-007: Template Detail Modal

**As a** user  
**I want to** see full template details before applying  
**So that** I can make informed decisions

**Acceptance Criteria**:
- [ ] AC1: Large preview image
- [ ] AC2: Template name and description
- [ ] AC3: Tags displayed as pills
- [ ] AC4: Content type and category shown
- [ ] AC5: Usage count and likes count
- [ ] AC6: "Apply" button (opens influencer selection)
- [ ] AC7: Like button
- [ ] AC8: For sets: Show member templates in grid
- [ ] AC9: Close button and click-outside to close

### Analytics Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `template_gallery_tab_changed` | User switches tab | `tab` (templates/sets/all), `previous_tab` |
| `template_gallery_sort_changed` | User changes sort | `sort`, `previous_sort` |
| `template_gallery_content_type_changed` | User changes content type | `content_type` |
| `template_gallery_category_selected` | User selects category | `category_slug`, `category_name` |
| `template_gallery_expanded` | User expands category grid | `visible_count` |
| `template_card_clicked` | User clicks template card | `template_id`, `is_set`, `source` |
| `template_apply_modal_opened` | Influencer selection opens | `template_id`, `is_set` |
| `template_applied` | Template applied to influencer | `template_id`, `is_set`, `influencer_id` |
| `template_liked` | User likes template | `template_id`, `is_set` |
| `template_unliked` | User unlikes template | `template_id`, `is_set` |

### Non-MVP Items

- Drag-and-drop reordering
- Keyboard navigation
- Infinite scroll (use pagination first)
- Template preview on hover

---

## P4: UI Skeleton

### Screen: Template Gallery Page (`/templates`)

```
┌─────────────────────────────────────────────────────────────────┐
│ RYLA Logo                                    [User] [Settings]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────┬───────────┬───────────┐                         │
│  │ Templates │   Sets    │    All    │  ← Type Tabs            │
│  └───────────┴───────────┴───────────┘                         │
│                                                                 │
│  ┌─────────┬─────────┬─────────┬─────────┐  ┌──────────────┐   │
│  │ Popular │Trending │   New   │ Recent  │  │ Images ▼     │   │
│  └─────────┴─────────┴─────────┴─────────┘  └──────────────┘   │
│        ↑ Sort Buttons                        ↑ Content Type    │
│                                                                 │
│  ┌────┬──────┬────────┬───────┬─────┬─────────────┐            │
│  │All │Beach │Fashion │Studio │Gym  │ All Tags ▼  │            │
│  └────┴──────┴────────┴───────┴─────┴─────────────┘            │
│        ↑ Category Pills (collapsed)                             │
│                                                                 │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐     │
│  │ ┌─────────┐ │ ┌─────────┐ │ ┌─────────┐ │ ┌─────────┐ │     │
│  │ │ Preview │ │ │ Preview │ │ │ Preview │ │ │ Preview │ │     │
│  │ │  Image  │ │ │  Image  │ │ │  Image  │ │ │  Image  │ │     │
│  │ └─────────┘ │ └─────────┘ │ └─────────┘ │ └─────────┘ │     │
│  │ Name ♥ 42  │ │ Name ♥ 38  │ │ Name ♥ 25  │ │ Name ♥ 19  │     │
│  │ [Image]    │ │ [Video]    │ │ [Set: 5]   │ │ [Image]    │     │
│  └─────────────┴─────────────┴─────────────┴─────────────┘     │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐     │
│  │    ...      │    ...      │    ...      │    ...      │     │
│  └─────────────┴─────────────┴─────────────┴─────────────┘     │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           [1] [2] [3] ... [10]  Next →                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Screen: Category Pills Expanded

```
┌─────────────────────────────────────────────────────────────────┐
│  ┌────┬──────┬────────┬───────┬─────┬───────┬────────┬──────┐  │
│  │All │Beach │Fashion │Studio │Gym  │Night  │Outdoor │Indoor│  │
│  └────┴──────┴────────┴───────┴─────┴───────┴────────┴──────┘  │
│  ┌────────┬─────────┬────────┬───────┬──────┬────────┬──────┐  │
│  │Fantasy │Glamour  │Casual  │Sporty │Cozy  │Minimal │Retro │  │
│  └────────┴─────────┴────────┴───────┴──────┴────────┴──────┘  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                        [Hide ▲]                           │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Modal: Template Detail

```
┌─────────────────────────────────────────────────────────────────┐
│                                                           [X]   │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                                                           │ │
│  │                    LARGE PREVIEW IMAGE                    │ │
│  │                                                           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  Template Name                                     ♥ Like (42)  │
│  ────────────────────────────────────────────────────────────  │
│  Description text goes here. This template creates a beautiful │
│  beach sunset scene with casual summer outfit.                  │
│                                                                 │
│  Tags: [Beach] [Sunset] [Casual] [Summer]                      │
│                                                                 │
│  Content Type: Image        Category: Beach                     │
│  Used: 1,234 times                                             │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   [Apply to Influencer]                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Modal: Influencer Selection

```
┌─────────────────────────────────────────────────────────────────┐
│  Select Influencer                                        [X]   │
│  ────────────────────────────────────────────────────────────  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ [Avatar]  Sarah Model                     128 images    │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ [Avatar]  Jessica Beauty                   45 images    │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ [Avatar]  Luna Anime                       23 images    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ [+]  Create New Influencer                              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Files to Create/Modify

### New Files

| File | Purpose |
|------|---------|
| `apps/web/app/templates/components/TypeTabs.tsx` | Templates/Sets/All tabs |
| `apps/web/app/templates/components/SortButtons.tsx` | Sort button bar |
| `apps/web/app/templates/components/ContentTypeFilter.tsx` | Content type dropdown |
| `apps/web/app/templates/components/CategoryPills.tsx` | Expandable category pills |
| `apps/web/app/templates/components/TemplateSetCard.tsx` | Unified card component |
| `apps/web/app/templates/components/TemplateDetailModal.tsx` | Detail view modal |
| `apps/web/app/templates/components/InfluencerSelectionModal.tsx` | Influencer picker |
| `apps/web/app/templates/components/index.ts` | Barrel export |

### Modify Files

| File | Changes |
|------|---------|
| `apps/web/app/templates/page.tsx` | Complete redesign with new components |
| `apps/web/app/templates/hooks/useTemplateFilters.ts` | Add type, sort, contentType state |
| `apps/web/components/studio/templates/template-library-tab.tsx` | Use new components |

### Remove Files

| File | Reason |
|------|--------|
| `apps/web/components/studio/templates/template-filters.tsx` | Replaced by new filter components |
| `apps/web/app/templates/components/FilterPill.tsx` | Replaced by CategoryPills |
| `apps/web/app/templates/components/FilterDropdown.tsx` | Replaced by ContentTypeFilter |

---

## Task Breakdown

| Task ID | Story | Task | Estimate |
|---------|-------|------|----------|
| TSK-047-001 | ST-047-001 | Create TypeTabs component | 2h |
| TSK-047-002 | ST-047-002 | Create SortButtons component | 2h |
| TSK-047-003 | ST-047-002 | Add mobile dropdown variant | 1h |
| TSK-047-004 | ST-047-003 | Create ContentTypeFilter component | 1h |
| TSK-047-005 | ST-047-004 | Create CategoryPills component | 3h |
| TSK-047-006 | ST-047-004 | Add expand/collapse functionality | 1h |
| TSK-047-007 | ST-047-005 | Create TemplateSetCard component | 2h |
| TSK-047-008 | ST-047-005 | Add hover/like interactions | 1h |
| TSK-047-009 | ST-047-006 | Create InfluencerSelectionModal | 2h |
| TSK-047-010 | ST-047-007 | Create TemplateDetailModal | 3h |
| TSK-047-011 | - | Update useTemplateFilters hook | 1h |
| TSK-047-012 | - | Redesign templates page layout | 2h |
| TSK-047-013 | - | Add analytics events | 1h |
| TSK-047-014 | - | Update template-library-tab | 1h |
| TSK-047-015 | - | Remove old filter components | 0.5h |
| TSK-047-016 | - | Write component tests | 3h |
| **Total** | | | **26.5h** |

---

## Dependencies

- **Blocks**: None
- **Blocked By**: EP-045 (qualityMode), EP-046 (Template Sets), EP-048 (Categories)

---

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| MDC pattern doesn't fit RYLA aesthetic | Low | Medium | Adapt colors/styling while keeping UX pattern |
| Performance with many templates | Medium | Medium | Pagination, virtualization if needed |
| Modal complexity | Low | Low | Reuse existing modal patterns from codebase |

---

## Phase Checklist

- [x] P1: Requirements ✅
- [x] P2: Scoping ✅
- [x] P3: Architecture ✅ (component-based, minimal)
- [x] P4: UI Skeleton ✅
- [x] P5: Technical Spec ✅ (see files list above)
- [x] P6: Implementation ✅
- [ ] P7: Testing
- [ ] P8: Integration
- [ ] P9: Deployment
- [ ] P10: Validation

---

## Related Documentation

- Initiative: `docs/initiatives/IN-011-template-gallery-content-library.md`
- Parent Epic: `docs/requirements/epics/mvp/EP-020-template-gallery.md`
- MDC Reference: `/Users/admin/Documents/Projects/MDC/mdc-next-frontend/components/character/FilterComponents.tsx`
