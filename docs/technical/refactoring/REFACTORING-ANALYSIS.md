# RYLA Refactoring Analysis

> Generated: Jan 6, 2026

## Executive Summary

The codebase has several "God components" exceeding 500+ lines that need decomposition. The core issue is **mixed concerns**: data fetching, business logic, UI state, and rendering all in single files.

**Priority order based on:**
1. User impact (most-used pages)
2. Size (larger = more complex)
3. Shared logic (extraction benefits multiple places)

---

## Files Requiring Refactoring

### 🔴 Critical Priority (> 900 lines)

| File | Lines | Issues |
|------|-------|--------|
| `components/studio/generation/studio-generation-bar.tsx` | 1,126 | Massive form component, too many props |
| `app/studio/page.tsx` | 1,111 | God component, 30+ state variables |
| `components/studio/studio-detail-panel.tsx` | 944 | Mixed image details + actions |
| `app/auth/page.tsx` | 913 | Inline components, repeated patterns |

> **Note:** `app/influencer/[id]/studio/page.tsx` (1,290 lines) is deprecated/unused - skip refactoring.

### 🟠 High Priority (500-900 lines)

| File | Lines | Issues |
|------|-------|--------|
| `app/activity/page.tsx` | 857 | Inline icons, mixed filtering logic |
| `components/studio/generation/outfit-composition-picker.tsx` | 816 | Complex picker, extractable logic |
| `components/wizard/step-base-image-selection.tsx` | 757 | Wizard step with generation logic |
| `components/wizard/step-profile-pictures.tsx` | 613 | Similar pattern to above |
| `app/settings/page.tsx` | 583 | Multiple settings sections |
| `components/influencer-settings.tsx` | 556 | Form + API calls mixed |
| `components/studio/generation/style-picker.tsx` | 555 | Large picker component |

### 🟡 Medium Priority (400-500 lines)

| File | Lines | Issues |
|------|-------|--------|
| `components/wizard/step-generate.tsx` | 454 | Generation logic in wizard |
| `components/desktop-sidebar.tsx` | 451 | Navigation + state mixed |
| `components/wizard/step-finalize.tsx` | 447 | Finalization logic |
| `components/studio/generation/object-picker.tsx` | 429 | Similar to outfit picker |
| `components/bug-report/bug-report-modal.tsx` | 417 | Modal + form + API |
| `components/image-gallery.tsx` | 411 | Gallery + actions mixed |
| `app/templates/page.tsx` | 400 | Template management |

---

## Detailed Analysis

### 1. Studio Pages (Highest Impact)

#### `app/studio/page.tsx` (1,111 lines)

**Current Structure:**
```
StudioPage
└── StudioContent (1,000+ lines)
    ├── 30+ useState calls
    ├── 10+ useEffect hooks
    ├── 15+ handler functions
    ├── Data fetching (trpc, API calls)
    ├── Polling logic
    ├── Filter state management
    └── Massive JSX render
```

**Problems:**
- 30+ state variables in single component
- Polling logic mixed with UI
- Filter state duplicated between local storage and component state
- Image refresh logic is complex and inline
- Tutorial logic embedded in main component

**Proposed Extraction:**

```
app/studio/
├── page.tsx                    # ~50 lines - Layout only
├── StudioClient.tsx            # ~100 lines - Orchestration
├── hooks/
│   ├── useStudioImages.ts      # Image fetching + polling
│   ├── useStudioFilters.ts     # Filter state + persistence
│   ├── useStudioGeneration.ts  # Generation logic
│   └── useStudioSelection.ts   # Image selection + panel
├── components/
│   ├── StudioToolbarSection.tsx
│   ├── StudioGallerySection.tsx
│   └── StudioGenerationSection.tsx
```

**Key Logic to Preserve:**
- Polling for generation status (`refreshImages` every 2s during active generation)
- Stale image cleanup (mark as failed after 60s)
- Filter persistence in localStorage
- Image preselection from URL params (`?imageId=xxx&edit=true`)
- Template loading from URL (`?template=xxx`)

---

### 2. Studio Generation Bar (1,126 lines)

**Current Structure:**
```
StudioGenerationBar
├── 20+ props
├── Settings state (persisted to localStorage)
├── Mode switching logic
├── Outfit mode toggling
├── NSFW settings sync
├── 8+ picker sub-components rendered inline
└── Complex conditional rendering
```

**Problems:**
- Props count exceeds 15 (code smell)
- Settings object managed internally AND passed down
- Outfit mode logic is complex
- Multiple picker components rendered conditionally

**Proposed Extraction:**

```
components/studio/generation/
├── StudioGenerationBar.tsx     # ~200 lines - Orchestration
├── hooks/
│   ├── useGenerationSettings.ts  # Settings + persistence
│   └── useOutfitMode.ts          # Outfit mode logic
├── sections/
│   ├── CharacterSection.tsx
│   ├── SceneSection.tsx
│   ├── StyleSection.tsx
│   ├── OutfitSection.tsx
│   ├── SettingsSection.tsx
│   └── GenerateButton.tsx
```

**Key Logic to Preserve:**
- Settings persistence in localStorage
- Auto-switch to editing mode when image selected
- Load settings from selected image in editing mode
- Credit calculation based on quality/batch
- NSFW toggle coordination

---

### 3. Auth Page (913 lines)

**Current Structure:**
```
AuthPage
├── Inline RylaInput component (30 lines)
├── Inline RylaCheckbox component (40 lines)
├── Animation variants
├── 3 form modes: email → login/register
├── Email validation hook usage
├── Form submission logic
└── Complex animated transitions
```

**Problems:**
- Inline UI components should be in `@ryla/ui`
- Three form states handled in one component
- Animation definitions mixed with logic

**Proposed Extraction:**

```
app/auth/
├── page.tsx                    # ~30 lines
├── AuthClient.tsx              # ~150 lines - Mode switching
├── components/
│   ├── EmailStep.tsx           # Email input + check
│   ├── LoginForm.tsx           # Login form
│   └── RegisterForm.tsx        # Register form
├── hooks/
│   └── useAuthFlow.ts          # Mode transitions + form state

libs/ui/src/
├── RylaInput.tsx               # Move from auth page
└── RylaCheckbox.tsx            # Move from auth page
```

**Key Logic to Preserve:**
- Email check flow (check if exists → show login or register)
- Password strength validation
- Terms acceptance requirement
- Redirect after auth (`returnTo` param)
- Animation transitions between modes

---

### 4. Activity Page (857 lines)

**Current Structure:**
```
ActivityPage
├── 6 inline icon components (60 lines total)
├── Type definitions
├── Filter state
├── Pagination state
├── Activity list rendering
└── Modal for image preview
```

**Problems:**
- Icons should be in `@ryla/ui` or use lucide-react
- Type definitions should be in `@ryla/shared`
- Filter + pagination logic can be extracted

**Proposed Extraction:**

```
app/activity/
├── page.tsx                    # ~30 lines
├── ActivityClient.tsx          # ~150 lines
├── components/
│   ├── ActivityFilters.tsx
│   ├── ActivityList.tsx
│   ├── ActivityItem.tsx
│   └── ActivityImageModal.tsx
├── hooks/
│   └── useActivityFilters.ts

libs/shared/src/types/
└── activity.ts                 # Move types here
```

**Key Logic to Preserve:**
- Filter by type (generations, credits, all)
- Time range filtering
- Pagination
- Image preview modal
- Credit transaction display

---

### 5. Wizard Steps (757, 613, 454, 447 lines)

**Pattern Issue:** Each wizard step is self-contained but has similar patterns:
- Generation state management
- Polling for results
- Error handling
- Navigation between steps

**Proposed Refactoring:**

```
components/wizard/
├── WizardStepLayout.tsx        # Shared layout wrapper
├── hooks/
│   ├── useWizardGeneration.ts  # Shared generation logic
│   └── useWizardNavigation.ts  # Step navigation
├── steps/
│   ├── BaseImageStep/
│   │   ├── index.tsx           # ~100 lines
│   │   └── BaseImageGrid.tsx
│   ├── ProfilePicturesStep/
│   ├── GenerateStep/
│   └── FinalizeStep/
```

**Key Logic to Preserve:**
- Step completion requirements
- Image selection validation
- Generation job polling
- Progress indicators
- Error recovery

---

## Shared Hooks to Extract

Based on patterns across files:

### `useImageGeneration`
Used in: studio, wizard steps, influencer studio

```typescript
interface UseImageGenerationOptions {
  onSuccess?: (images: StudioImage[]) => void;
  onError?: (error: Error) => void;
  pollInterval?: number;
}

interface UseImageGenerationReturn {
  generate: (params: GenerationParams) => Promise<void>;
  status: 'idle' | 'generating' | 'completed' | 'error';
  progress: number;
  activeJobIds: string[];
  cancel: () => void;
}
```

### `useGalleryFilters`
Used in: studio page, influencer studio

```typescript
interface UseGalleryFiltersReturn {
  filters: GalleryFilters;
  setFilter: <K extends keyof GalleryFilters>(key: K, value: GalleryFilters[K]) => void;
  resetFilters: () => void;
  filteredImages: StudioImage[];
}
```

### `usePolling`
Generic polling hook used across multiple components

```typescript
function usePolling<T>(
  fetchFn: () => Promise<T>,
  options: {
    interval: number;
    enabled: boolean;
    onData?: (data: T) => void;
  }
): { data: T | null; isPolling: boolean; stop: () => void }
```

---

## Component Extraction Plan

### Move to `@ryla/ui`

| Component | From | Lines |
|-----------|------|-------|
| `RylaInput` | auth/page.tsx | 30 |
| `RylaCheckbox` | auth/page.tsx | 45 |
| `ErrorMessage` | (create new) | 20 |
| `LoadingSpinner` | (consolidate) | 15 |

### Create in `@ryla/shared`

| Type/Const | From | Purpose |
|------------|------|---------|
| `ActivityItem` | activity/page.tsx | Activity types |
| `GenerationStatus` | scattered | Unified status type |
| `StudioMode` | studio components | Mode constants |

---

## Refactoring Order

### Phase 1: Extract Shared Hooks (Week 1)
1. `useImageGeneration` - Biggest impact, used everywhere
2. `usePolling` - Generic, enables other refactoring
3. `useGalleryFilters` - Used by both studio pages

### Phase 2: Studio Page Decomposition (Week 2)
1. Extract `StudioClient` component
2. Create hook modules
3. Split into section components
4. Refactor `studio-generation-bar.tsx`

### Phase 3: Auth & Wizard (Week 3)
1. Move UI components to `@ryla/ui`
2. Create `useAuthFlow` hook
3. Extract wizard shared logic
4. Decompose wizard steps

### Phase 4: Remaining Pages (Week 4)
1. Activity page
2. Settings page
3. Generation bar refinement

---

## Testing Strategy

Before each refactor:
1. Document current behavior (screenshots, user flows)
2. Identify test coverage gaps
3. Write integration tests for critical paths

After each refactor:
1. Run existing tests
2. Manual smoke test
3. Compare before/after screenshots

### Critical Paths to Test

| Flow | Components Affected |
|------|---------------------|
| Image generation | Studio, Wizard steps |
| Polling updates | Studio, Wizard |
| Filter persistence | Studio |
| Auth flow | Auth page |
| Settings save | Settings, Influencer settings |

---

## UI/UX Preservation Checklist

For each refactored component:

- [ ] Loading states render identically
- [ ] Error states render identically
- [ ] Animations/transitions preserved
- [ ] Keyboard navigation works
- [ ] Focus management correct
- [ ] localStorage values migrate correctly
- [ ] URL param handling unchanged
- [ ] Responsive behavior unchanged

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Breaking polling logic | Extract with tests first |
| State desync | Use single source of truth |
| Performance regression | Profile before/after |
| localStorage migration | Add migration logic |
| Lost animations | Document animation specs |

---

## Next Steps

1. **Review this analysis** - Confirm priorities align with product needs
2. **Pick first target** - Recommend starting with `useImageGeneration` hook
3. **Create tests** - Before touching any code
4. **Refactor incrementally** - One extraction at a time
5. **Validate** - Test after each change

---

## Related Documents

- [Refactoring Guide](./REFACTORING-GUIDE.md)
- [Architecture Rules](../../.cursor/rules/architecture.mdc)
- [Refactoring MDC Rule](../../.cursor/rules/refactoring.mdc)

