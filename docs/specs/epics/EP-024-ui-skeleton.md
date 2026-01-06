# EP-024: Contextual Page Tutorials - UI Skeleton & Interactions

**Phase**: P4 - UI Skeleton & Interactions  
**Epic**: EP-024  
**Status**: Complete

---

## 1. Screen List & Navigation Structure

### Studio Page (`/studio`)

**Route**: `apps/web/app/studio/page.tsx`

**Screen Components**:
1. `StudioHeader` - Character selector tabs at top
2. `StudioGenerationBar` - Generation controls (scene, environment, outfit, settings)
3. `StudioToolbar` - Filters and view options
4. `StudioGallery` - Image grid/gallery display
5. `StudioDetailPanel` - Side panel for selected image details
6. `TutorialOverlay` - Tutorial overlay (conditional, appears on first visit)

**Navigation Flow**:
```
User visits /studio
  → Tutorial auto-starts (if first visit)
  → Tutorial steps guide through:
     1. Character selector (StudioHeader)
     2. Generation controls (StudioGenerationBar)
     3. Settings (StudioGenerationBar)
     4. Generate button (StudioGenerationBar)
     5. Gallery (StudioGallery)
  → Tutorial completes
  → User can use Studio normally
```

---

## 2. Component List Per Screen

### Studio Page Components

| Component | Location | Purpose | Tutorial Target |
|-----------|----------|---------|----------------|
| `StudioHeader` | `apps/web/components/studio/studio-header.tsx` | Character selector tabs | Step 1 |
| `StudioGenerationBar` | `apps/web/components/studio/generation/studio-generation-bar.tsx` | Generation controls | Steps 2, 3, 4 |
| `StudioToolbar` | `apps/web/components/studio/studio-toolbar.tsx` | Filters | Not in tutorial |
| `StudioGallery` | `apps/web/components/studio/studio-gallery.tsx` | Image grid | Step 5 |
| `StudioDetailPanel` | `apps/web/components/studio/studio-detail-panel.tsx` | Image details | Not in tutorial |
| `TutorialOverlay` | `libs/ui/src/components/tutorial/tutorial-overlay.tsx` | Tutorial UI | N/A (tutorial itself) |
| `TutorialPointer` | `libs/ui/src/components/tutorial/tutorial-pointer.tsx` | Pointer arrow | N/A (tutorial itself) |

### Tutorial Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `TutorialOverlay` | `libs/ui/src/components/tutorial/tutorial-overlay.tsx` | Main overlay container |
| `TutorialPointer` | `libs/ui/src/components/tutorial/tutorial-pointer.tsx` | Animated pointer/arrow |
| `TutorialStep` | `libs/ui/src/components/tutorial/tutorial-step.tsx` | Individual step display |
| `useTutorial` | `libs/ui/src/hooks/use-tutorial.ts` | State management hook |

---

## 3. Interaction Notes

### Tutorial Overlay Interactions

#### Interaction: Tutorial Appears (Auto-Start)

**Trigger**: User visits `/studio` for first time

**UI Flow**:
1. Page loads normally
2. `useTutorial` hook checks localStorage
3. If tutorial not completed, sets `isActive = true`
4. `TutorialOverlay` renders with step 1
5. Dark backdrop appears with blur
6. Tutorial card appears with step 1 content
7. Pointer animates to point at target element

**State Changes**:
- `tutorial.isActive`: `false` → `true`
- `tutorial.currentStep`: `0` (first step)
- Overlay visible: `false` → `true`

**Analytics Event**: `tutorial_started`

**Success State**: Tutorial overlay visible, step 1 displayed, pointer pointing to character selector

**Failure State**: If target element not found, skip to next step or show error message

---

#### Interaction: Click "Got it" Button

**Trigger**: User clicks "Got it" button on current step

**UI Flow**:
1. Button click handler fires
2. `tutorial.next()` called
3. Current step analytics event fired: `tutorial_step_viewed`
4. If not last step:
   - `currentStep` increments
   - Smooth transition to next step
   - Pointer repositions to new target
   - Step indicator updates ("2 of 5" → "3 of 5")
5. If last step:
   - `tutorial.complete()` called
   - Tutorial completion event fired
   - Overlay fades out
   - Tutorial state saved to localStorage

**State Changes**:
- `tutorial.currentStep`: `n` → `n + 1` (or complete if last step)
- Overlay transitions to next step

**Analytics Event**: `tutorial_step_viewed` (for current step), `tutorial_completed` (if last step)

**Success State**: Next step displayed or tutorial completed

**Failure State**: If next target not found, skip step or show error

---

#### Interaction: Click "Skip tutorial" Link

**Trigger**: User clicks "Skip tutorial" link

**UI Flow**:
1. Link click handler fires
2. `tutorial.skip()` called
3. Skip analytics event fired with current step number
4. Tutorial state saved to localStorage (marked as skipped)
5. Overlay fades out immediately
6. User can continue using Studio normally

**State Changes**:
- `tutorial.isActive`: `true` → `false`
- Overlay visible: `true` → `false`
- localStorage: `tutorial_studio_completed = true` (or skipped flag)

**Analytics Event**: `tutorial_skipped`

**Success State**: Tutorial dismissed, Studio usable

**Failure State**: If localStorage fails, tutorial still dismisses (in-memory only)

---

#### Interaction: Keyboard Navigation

**Trigger**: User presses keyboard keys

**UI Flow**:
- **Enter/Space**: Same as "Got it" button (proceed to next step)
- **Escape**: Same as "Skip tutorial" (dismiss tutorial)
- **Tab**: Focus moves to "Got it" button
- **Arrow keys**: Not used (focus management only)

**State Changes**: Same as button/link interactions

**Analytics Event**: Same as corresponding button/link interactions

**Success State**: Tutorial responds to keyboard input

**Failure State**: Keyboard input ignored (graceful degradation)

---

#### Interaction: Tutorial Pointer Positioning

**Trigger**: Tutorial step changes or window resize

**UI Flow**:
1. Target element located via CSS selector
2. Element's bounding box calculated
3. Pointer position calculated based on:
   - Target element position
   - Pointer direction (up/down/left/right)
   - Pointer offset (16px from target)
4. Pointer animates to new position
5. On window resize, position recalculated

**State Changes**: Pointer position updates

**Analytics Event**: None (internal UI update)

**Success State**: Pointer accurately points to target element

**Failure State**: If target not found, pointer hidden or positioned at center

---

### Studio Page Interactions (During Tutorial)

#### Interaction: User Interacts with Target Element

**Trigger**: User clicks/interacts with element being highlighted

**UI Flow**:
1. Tutorial overlay is visible but doesn't block interactions
2. User can click target element (e.g., character tab)
3. Normal Studio functionality works
4. Tutorial remains visible (doesn't auto-advance)
5. User can still click "Got it" to proceed

**State Changes**: Studio state changes (e.g., character selected), tutorial state unchanged

**Analytics Event**: Normal Studio analytics events + tutorial events

**Success State**: User can interact with Studio while tutorial is active

**Failure State**: Tutorial blocks interactions (should not happen - overlay is non-blocking)

---

## 4. Interaction → Event Mapping

### Tutorial Events

| User Action | Component | Handler | Analytics Event | Properties |
|-------------|-----------|---------|----------------|------------|
| Tutorial auto-starts | `useTutorial` | `useEffect` (on mount) | `tutorial_started` | `tutorial_id`, `page`, `total_steps` |
| Click "Got it" (not last step) | `TutorialOverlay` | `onNext` → `tutorial.next()` | `tutorial_step_viewed` | `tutorial_id`, `step_number`, `step_id`, `page` |
| Click "Got it" (last step) | `TutorialOverlay` | `onComplete` → `tutorial.complete()` | `tutorial_completed` | `tutorial_id`, `page`, `steps_viewed`, `time_to_complete` |
| Click "Skip tutorial" | `TutorialOverlay` | `onSkip` → `tutorial.skip()` | `tutorial_skipped` | `tutorial_id`, `page`, `skipped_at_step`, `steps_viewed` |
| Press Enter/Space | `TutorialOverlay` | Keyboard event → `onNext` | `tutorial_step_viewed` or `tutorial_completed` | Same as button click |
| Press Escape | `TutorialOverlay` | Keyboard event → `onSkip` | `tutorial_skipped` | Same as skip link |
| Restart tutorial | Settings/Menu | `tutorial.reset()` → `tutorial.start()` | `tutorial_restarted` | `tutorial_id`, `page`, `previous_completion` |

### Studio Events (During Tutorial)

| User Action | Component | Handler | Analytics Event | Notes |
|-------------|-----------|---------|----------------|-------|
| Select character | `StudioHeader` | `onSelectInfluencer` | Existing Studio events | Tutorial doesn't block |
| Change scene | `StudioGenerationBar` | `updateSetting('sceneId')` | Existing Studio events | Tutorial doesn't block |
| Click Generate | `StudioGenerationBar` | `onGenerate` | Existing Studio events | Tutorial doesn't block |
| View gallery | `StudioGallery` | Image selection | Existing Studio events | Tutorial doesn't block |

---

## 5. UI States & Transitions

### Tutorial Overlay States

| State | Description | Visual |
|-------|-------------|--------|
| **Hidden** | Tutorial not active | No overlay visible |
| **Step 1** | First step displayed | Overlay visible, step 1 content, pointer to character selector |
| **Step 2** | Second step displayed | Overlay visible, step 2 content, pointer to generation controls |
| **Step 3** | Third step displayed | Overlay visible, step 3 content, pointer to settings |
| **Step 4** | Fourth step displayed | Overlay visible, step 4 content, pointer to generate button |
| **Step 5** | Fifth step displayed | Overlay visible, step 5 content, pointer to gallery |
| **Completing** | Fading out after completion | Overlay fading out, backdrop fading |
| **Skipped** | Dismissed immediately | Overlay removed instantly |

### Transition Animations

| Transition | Duration | Easing | Description |
|------------|----------|--------|-------------|
| Overlay appear | 300ms | `ease-out` | Fade in + scale up |
| Overlay disappear | 200ms | `ease-in` | Fade out + scale down |
| Step change | 250ms | `ease-in-out` | Fade out current, fade in next |
| Pointer move | 400ms | `ease-out` | Smooth position update |
| Backdrop blur | 200ms | `ease-out` | Blur effect applied |

---

## 6. Target Element Identification

### Data Attributes Strategy

**Pattern**: `data-tutorial-target="{identifier}"`

**Studio Page Targets**:

| Step | Target Identifier | Element | Selector |
|------|------------------|---------|----------|
| 1 | `character-selector` | Character tabs container | `[data-tutorial-target="character-selector"]` |
| 2 | `generation-controls` | Generation bar (scene/environment/outfit) | `[data-tutorial-target="generation-controls"]` |
| 3 | `generation-settings` | Settings section (aspect ratio, quality, count) | `[data-tutorial-target="generation-settings"]` |
| 4 | `generate-button` | Generate button | `[data-tutorial-target="generate-button"]` |
| 5 | `gallery` | Gallery grid container | `[data-tutorial-target="gallery"]` |

### Implementation in Studio Components

**StudioHeader.tsx**:
```tsx
<div 
  data-tutorial-target="character-selector"
  className="flex items-center gap-2"
>
  {/* Character tabs */}
</div>
```

**StudioGenerationBar.tsx**:
```tsx
{/* Generation controls */}
<div data-tutorial-target="generation-controls">
  {/* Scene, environment, outfit pickers */}
</div>

{/* Settings */}
<div data-tutorial-target="generation-settings">
  {/* Aspect ratio, quality, count */}
</div>

{/* Generate button */}
<Button 
  data-tutorial-target="generate-button"
  onClick={handleGenerate}
>
  Generate
</Button>
```

**StudioGallery.tsx**:
```tsx
<div 
  data-tutorial-target="gallery"
  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
>
  {/* Image grid */}
</div>
```

---

## 7. Responsive Behavior

### Mobile (< 768px)

**Tutorial Overlay**:
- Full-screen overlay (no margins)
- Larger text for readability
- Pointer may be hidden if target is off-screen
- "Got it" button full-width
- Step indicator at top

**Pointer Positioning**:
- May need to adjust position if target is near screen edge
- Pointer direction may change (e.g., point up instead of down)

**Target Elements**:
- Character selector: Horizontal scroll, tutorial points to visible area
- Generation bar: May be in bottom sheet, tutorial adapts
- Gallery: Grid may be 2 columns, tutorial points to grid area

### Tablet (768px - 1024px)

**Tutorial Overlay**:
- Centered card with margins
- Standard text size
- Pointer visible

**Target Elements**:
- All elements visible, tutorial works normally

### Desktop (> 1024px)

**Tutorial Overlay**:
- Centered card with larger max-width
- Standard text size
- Pointer visible and accurate

**Target Elements**:
- All elements visible, tutorial works optimally

---

## 8. Error States

### Target Element Not Found

**Scenario**: CSS selector doesn't match any element

**UI Behavior**:
1. Log warning to console
2. Skip to next step automatically
3. Or show error message: "Element not found, skipping step"
4. Continue tutorial flow

**User Experience**: Tutorial continues, user may not notice

---

### localStorage Unavailable

**Scenario**: Browser doesn't support localStorage or quota exceeded

**UI Behavior**:
1. Fallback to sessionStorage
2. Or use in-memory state (tutorial resets on refresh)
3. Tutorial still works, but state doesn't persist

**User Experience**: Tutorial works, but may show again on refresh

---

### Multiple Tutorials Active

**Scenario**: User navigates to another page with tutorial while one is active

**UI Behavior**:
1. Close current tutorial
2. Start new tutorial (if applicable)
3. Only one tutorial active at a time

**User Experience**: Smooth transition between tutorials

---

## 9. Accessibility Considerations

### Keyboard Navigation

- **Tab**: Focus moves to "Got it" button
- **Enter/Space**: Activates "Got it" button (proceed)
- **Escape**: Activates "Skip tutorial" (dismiss)
- **Arrow keys**: Not used (focus management only)

### Screen Reader Support

**ARIA Attributes**:
```tsx
<div
  role="dialog"
  aria-labelledby="tutorial-title"
  aria-describedby="tutorial-message"
  aria-modal="true"
  aria-live="polite"
>
  <div id="tutorial-title">Tutorial Step {currentStep + 1} of {totalSteps}</div>
  <div id="tutorial-message">{step.message}</div>
  <button aria-label="Got it, proceed to next step">Got it</button>
  <a aria-label="Skip tutorial">Skip tutorial</a>
</div>
```

**Announcements**:
- Step changes announced via `aria-live="polite"`
- Tutorial start/end announced

### Focus Management

- **On tutorial start**: Focus moves to "Got it" button
- **On step change**: Focus remains on "Got it" button
- **On tutorial end**: Focus returns to first focusable element on page
- **Focus trap**: Focus cannot escape tutorial overlay

---

## 10. Integration Checklist

### Studio Page Integration

- [ ] Add data attributes to target elements
- [ ] Import tutorial components from `@ryla/ui`
- [ ] Define tutorial steps array
- [ ] Initialize `useTutorial` hook
- [ ] Conditionally render `TutorialOverlay`
- [ ] Test tutorial appears on first visit
- [ ] Test tutorial doesn't appear after completion
- [ ] Test skip functionality
- [ ] Test restart functionality
- [ ] Verify analytics events fire correctly

### Component Library Integration

- [ ] Create `tutorial/` directory in `libs/ui/src/components/`
- [ ] Implement `TutorialOverlay` component
- [ ] Implement `TutorialPointer` component
- [ ] Implement `TutorialStep` component
- [ ] Create `useTutorial` hook
- [ ] Define TypeScript types
- [ ] Export from `libs/ui/src/components/index.ts`
- [ ] Export hook from `libs/ui/src/hooks/index.ts`
- [ ] Add to `libs/ui/src/index.ts` exports

---

## Phase 4 Completion Checklist

- [x] Screen list and navigation structure defined
- [x] Component list per screen documented
- [x] Interaction notes (UI → API, success/failure states) documented
- [x] Interaction → event mapping defined
- [x] UI states & transitions documented
- [x] Target element identification strategy defined
- [x] Responsive behavior documented
- [x] Error states documented
- [x] Accessibility considerations documented
- [x] Integration checklist created

**Phase 4 Status**: ✅ Complete

**Ready for Phase 5**: Technical Spec & File Plan

