# EP-024 (P5) — Contextual Page Tutorials: Tech Spec (File Plan + Tasks)

Working in **PHASE P5 (File plan + tasks)** on **EP-024, ST-120-ST-124**.

## Scope (MVP)

- Reusable tutorial components in `@ryla/ui`
- Tutorial overlay with step navigation
- Tutorial pointer/arrow component
- `useTutorial` hook for state management
- Studio page tutorial (5 steps)
- localStorage persistence
- Analytics tracking
- Responsive design (mobile + desktop)
- Accessibility (keyboard nav, screen readers)

**Out of scope (MVP)**:
- Backend API for tutorial state
- Video tutorials
- Interactive tutorials (click-to-complete)
- Multi-page tutorials
- Admin dashboard for tutorial management
- Tutorial templates/configurations in database

---

## API Contract

**No Backend API Required** - This feature is entirely client-side.

**Future Enhancement (Phase 2+)**:
- Store tutorial completion in user profile (Supabase)
- Sync across devices
- Admin dashboard for tutorial management

---

## File Plan

### UI Library (libs/ui)

#### Tutorial Components

- **Add** `libs/ui/src/components/tutorial/tutorial-overlay.tsx`
  - Main overlay container component
  - Props: `steps`, `currentStep`, `onNext`, `onSkip`, `onComplete`, `isVisible`
  - Dark backdrop with blur
  - Step indicator ("X of Y")
  - Message display
  - "Got it" button
  - "Skip tutorial" link
  - Smooth transitions
  - Keyboard navigation (Enter, Escape)
  - ARIA attributes for accessibility

- **Add** `libs/ui/src/components/tutorial/tutorial-pointer.tsx`
  - Animated pointer/arrow component
  - Props: `target`, `direction`, `position`
  - Calculates position based on target element
  - Smooth animations
  - Responsive positioning
  - Multiple pointer styles (arrow, spotlight)

- **Add** `libs/ui/src/components/tutorial/tutorial-step.tsx`
  - Individual step display component
  - Props: `step`, `stepNumber`, `totalSteps`, `onNext`, `onSkip`
  - Step content rendering
  - Button and link handlers

- **Add** `libs/ui/src/components/tutorial/types.ts`
  - `TutorialStep` interface
  - `TutorialConfig` interface
  - `TutorialOverlayProps` interface
  - `TutorialPointerProps` interface
  - Type exports

- **Add** `libs/ui/src/components/tutorial/index.ts`
  - Barrel export for tutorial components
  - Export: `TutorialOverlay`, `TutorialPointer`, `TutorialStep`
  - Export types: `TutorialStep`, `TutorialConfig`, etc.

- **Update** `libs/ui/src/components/index.ts`
  - Add: `export * from './tutorial';`

#### Tutorial Hook

- **Add** `libs/ui/src/hooks/use-tutorial.ts`
  - Custom hook for tutorial state management
  - Parameters: `tutorialId`, `steps`, `options`
  - Returns: `{ currentStep, isActive, start, next, skip, complete, reset }`
  - localStorage persistence
  - Auto-start logic
  - Analytics event tracking
  - State management

- **Update** `libs/ui/src/hooks/index.ts`
  - Add: `export { useTutorial } from './use-tutorial';`

- **Update** `libs/ui/src/index.ts`
  - Add: `export * from './hooks';` (if not already present)

### Web App (apps/web)

#### Studio Page Integration

- **Update** `apps/web/app/studio/page.tsx`
  - Import tutorial components: `TutorialOverlay`, `useTutorial` from `@ryla/ui`
  - Define `studioTutorialSteps` array (5 steps)
  - Initialize `useTutorial` hook with `autoStart: true`
  - Conditionally render `TutorialOverlay` when `tutorial.isActive`
  - Pass step handlers: `onNext`, `onSkip`, `onComplete`

#### Studio Component Updates

- **Update** `apps/web/components/studio/studio-header.tsx`
  - Add `data-tutorial-target="character-selector"` to character tabs container
  - Ensure element is accessible for tutorial targeting

- **Update** `apps/web/components/studio/generation/studio-generation-bar.tsx`
  - Add `data-tutorial-target="generation-controls"` to generation controls section
  - Add `data-tutorial-target="generation-settings"` to settings section
  - Add `data-tutorial-target="generate-button"` to Generate button
  - Ensure elements are accessible for tutorial targeting

- **Update** `apps/web/components/studio/studio-gallery.tsx`
  - Add `data-tutorial-target="gallery"` to gallery grid container
  - Ensure element is accessible for tutorial targeting

### Analytics (libs/analytics)

- **Update** `libs/analytics/src/events.ts`
  - Add tutorial event constants:
    - `TUTORIAL_STARTED = 'tutorial.started'`
    - `TUTORIAL_STEP_VIEWED = 'tutorial.step_viewed'`
    - `TUTORIAL_COMPLETED = 'tutorial.completed'`
    - `TUTORIAL_SKIPPED = 'tutorial.skipped'`
    - `TUTORIAL_RESTARTED = 'tutorial.restarted'`

- **Note**: Analytics events are tracked via `capture()` function in `useTutorial` hook

---

## Task Breakdown (P6-ready)

### [STORY] ST-124: Use Tutorial Components on Other Pages

- **AC**: EP-024 AC-1

**Tasks**:

- **[TASK] TSK-124-001**: Create tutorial component directory structure
  - Create `libs/ui/src/components/tutorial/` directory
  - Create `tutorial-overlay.tsx`, `tutorial-pointer.tsx`, `tutorial-step.tsx`, `types.ts`, `index.ts`
  - Set up basic file structure

- **[TASK] TSK-124-002**: Implement TypeScript types
  - Create `libs/ui/src/components/tutorial/types.ts`
  - Define `TutorialStep` interface
  - Define `TutorialConfig` interface
  - Define component prop types
  - Export types

- **[TASK] TSK-124-003**: Implement `TutorialPointer` component
  - Create `libs/ui/src/components/tutorial/tutorial-pointer.tsx`
  - Calculate pointer position from target element
  - Implement pointer animation
  - Support multiple directions (up, down, left, right)
  - Handle responsive positioning
  - Add smooth transitions

- **[TASK] TSK-124-004**: Implement `TutorialStep` component
  - Create `libs/ui/src/components/tutorial/tutorial-step.tsx`
  - Render step indicator ("X of Y")
  - Render step message
  - Render "Got it" button
  - Render "Skip tutorial" link
  - Handle button/link clicks

- **[TASK] TSK-124-005**: Implement `TutorialOverlay` component
  - Create `libs/ui/src/components/tutorial/tutorial-overlay.tsx`
  - Dark backdrop with blur effect
  - Render current step via `TutorialStep`
  - Render pointer via `TutorialPointer`
  - Handle visibility state
  - Implement smooth transitions
  - Add keyboard navigation (Enter, Escape)
  - Add ARIA attributes for accessibility

- **[TASK] TSK-124-006**: Implement `useTutorial` hook
  - Create `libs/ui/src/hooks/use-tutorial.ts`
  - Manage tutorial state (currentStep, isActive)
  - localStorage persistence logic
  - Auto-start logic
  - Navigation methods (next, skip, complete, reset)
  - Analytics event tracking
  - Handle edge cases (target not found, localStorage unavailable)

- **[TASK] TSK-124-007**: Export tutorial components
  - Update `libs/ui/src/components/tutorial/index.ts` with exports
  - Update `libs/ui/src/components/index.ts` to export tutorial
  - Update `libs/ui/src/hooks/index.ts` to export `useTutorial`
  - Update `libs/ui/src/index.ts` if needed

- **[TASK] TSK-124-008**: Add responsive design
  - Test tutorial on mobile (< 768px)
  - Test tutorial on tablet (768px - 1024px)
  - Test tutorial on desktop (> 1024px)
  - Adjust pointer positioning for mobile
  - Adjust overlay sizing for mobile
  - Ensure text is readable on all screen sizes

- **[TASK] TSK-124-009**: Add accessibility features
  - Keyboard navigation (Tab, Enter, Escape)
  - ARIA labels and roles
  - Screen reader announcements
  - Focus management
  - Focus trap within overlay
  - Color contrast compliance

- **[TASK] TSK-124-010**: Test tutorial components in isolation
  - Create test story/example page
  - Test all component props
  - Test state management
  - Test localStorage persistence
  - Test analytics events
  - Test error handling

---

### [STORY] ST-120: See Tutorial on First Studio Visit

- **AC**: EP-024 AC-4, AC-5

**Tasks**:

- **[TASK] TSK-120-001**: Define Studio tutorial steps
  - Create `studioTutorialSteps` array in `apps/web/app/studio/page.tsx`
  - Define 5 steps:
    1. Character selection (`character-selection`)
    2. Generation controls (`generation-controls`)
    3. Settings (`generation-settings`)
    4. Generate button (`generate-button`)
    5. Gallery (`gallery`)
  - Set target selectors, messages, positions

- **[TASK] TSK-120-002**: Implement tutorial auto-start on Studio page
  - Import `useTutorial` hook in `apps/web/app/studio/page.tsx`
  - Initialize hook with `autoStart: true`
  - Pass `studioTutorialSteps` to hook
  - Verify tutorial starts on first visit

- **[TASK] TSK-120-003**: Add data attributes to Studio UI elements
  - Update `apps/web/components/studio/studio-header.tsx`
    - Add `data-tutorial-target="character-selector"` to tabs container
  - Update `apps/web/components/studio/generation/studio-generation-bar.tsx`
    - Add `data-tutorial-target="generation-controls"` to controls section
    - Add `data-tutorial-target="generation-settings"` to settings section
    - Add `data-tutorial-target="generate-button"` to Generate button
  - Update `apps/web/components/studio/studio-gallery.tsx`
    - Add `data-tutorial-target="gallery"` to gallery container

- **[TASK] TSK-120-004**: Integrate tutorial overlay into Studio page
  - Import `TutorialOverlay` component in `apps/web/app/studio/page.tsx`
  - Conditionally render overlay when `tutorial.isActive`
  - Pass step handlers: `onNext={tutorial.next}`, `onSkip={tutorial.skip}`, `onComplete={tutorial.complete}`
  - Pass steps and current step to overlay

- **[TASK] TSK-120-005**: Test tutorial appears on first visit only
  - Test tutorial auto-starts on first `/studio` visit
  - Test tutorial doesn't show after completion
  - Test tutorial state persists in localStorage
  - Test tutorial doesn't interfere with Studio functionality

---

### [STORY] ST-121: Navigate Through Tutorial Steps

- **AC**: EP-024 AC-2, AC-3

**Tasks**:

- **[TASK] TSK-121-001**: Implement step navigation
  - Implement `next()` method in `useTutorial` hook
  - Handle step increment logic
  - Handle completion when on last step
  - Fire `tutorial_step_viewed` analytics event
  - Fire `tutorial_completed` analytics event on last step

- **[TASK] TSK-121-002**: Add step indicator display
  - Display "X of Y" format in `TutorialStep` component
  - Update indicator on step change
  - Style indicator (small, uppercase, muted)

- **[TASK] TSK-121-003**: Implement smooth transitions
  - Add CSS transitions to overlay
  - Fade out current step
  - Fade in next step
  - Animate pointer movement
  - Use appropriate timing (250ms for step change)

- **[TASK] TSK-121-004**: Add pointer animation and positioning
  - Calculate pointer position from target element
  - Handle pointer direction (up, down, left, right)
  - Animate pointer movement between steps
  - Handle edge cases (target off-screen, target not found)
  - Recalculate on window resize

- **[TASK] TSK-121-005**: Ensure tutorial doesn't block UI interactions
  - Make overlay non-blocking (pointer-events: none on backdrop)
  - Allow clicks through to target elements
  - Ensure Studio functionality works during tutorial
  - Test user can interact with Studio while tutorial is active

- **[TASK] TSK-121-006**: Test keyboard navigation
  - Test Enter key proceeds to next step
  - Test Space key proceeds to next step
  - Test Escape key skips tutorial
  - Test Tab key focuses "Got it" button
  - Test focus trap within overlay

---

### [STORY] ST-122: Skip Tutorial If Not Needed

- **AC**: EP-024 AC-3, AC-5

**Tasks**:

- **[TASK] TSK-122-001**: Add "Skip tutorial" link to overlay
  - Add skip link to `TutorialStep` component
  - Style link (small, underlined, muted)
  - Position link below "Got it" button
  - Make link visible on all steps

- **[TASK] TSK-122-002**: Implement skip functionality
  - Implement `skip()` method in `useTutorial` hook
  - Dismiss overlay immediately
  - Set `isActive = false`
  - Fire `tutorial_skipped` analytics event with current step number

- **[TASK] TSK-122-003**: Store skip state in localStorage
  - Save skip state to localStorage
  - Use key: `tutorial_{tutorialId}_completed`
  - Set value to `true` when skipped
  - Prevent tutorial from showing again

- **[TASK] TSK-122-004**: Track skip analytics event
  - Fire `tutorial_skipped` event in `skip()` method
  - Include properties: `tutorial_id`, `page`, `skipped_at_step`, `steps_viewed`
  - Use `capture()` from `@ryla/analytics`

- **[TASK] TSK-122-005**: Ensure skip works from any step
  - Test skip from step 1
  - Test skip from step 3
  - Test skip from step 5
  - Verify skip state is saved correctly
  - Verify tutorial doesn't show again after skip

---

### [STORY] ST-123: Restart Tutorial Later

- **AC**: EP-024 AC-3, AC-5

**Tasks**:

- **[TASK] TSK-123-001**: Add "Show tutorial" option (future enhancement)
  - **Note**: This is Phase 2+ feature
  - For MVP, tutorial can be restarted by clearing localStorage
  - Future: Add to Studio settings/menu
  - Future: Add `reset()` method call from settings

- **[TASK] TSK-123-002**: Implement tutorial reset functionality
  - Implement `reset()` method in `useTutorial` hook
  - Clear localStorage state
  - Reset `currentStep` to 0
  - Set `isActive = false` (user must call `start()` to restart)

- **[TASK] TSK-123-003**: Clear localStorage when restarting
  - Remove `tutorial_{tutorialId}_completed` from localStorage
  - Allow tutorial to show again
  - Reset tutorial state to initial

- **[TASK] TSK-123-004**: Track restart analytics event
  - Fire `tutorial_restarted` event in `reset()` + `start()` flow
  - Include properties: `tutorial_id`, `page`, `previous_completion`
  - Use `capture()` from `@ryla/analytics`

- **[TASK] TSK-123-005**: Test restart functionality
  - Test restart after completion
  - Test restart after skip
  - Verify localStorage is cleared
  - Verify tutorial can start again
  - Verify analytics event fires

**Note**: TSK-123-001 is Phase 2+ (settings integration). For MVP, users can clear localStorage manually or we can add a simple "Restart tutorial" button in development mode.

---

## Tracking Plan (Analytics Events)

### Event: `tutorial_started`

**Location**: `libs/ui/src/hooks/use-tutorial.ts`  
**Trigger**: Tutorial begins (first step shown)  
**Code**:
```typescript
capture('tutorial.started', {
  tutorial_id: tutorialId,
  page: typeof window !== 'undefined' ? window.location.pathname : '',
  total_steps: steps.length,
  timestamp: new Date().toISOString(),
});
```

---

### Event: `tutorial_step_viewed`

**Location**: `libs/ui/src/hooks/use-tutorial.ts`  
**Trigger**: Each step is displayed (after "Got it" clicked)  
**Code**:
```typescript
capture('tutorial.step_viewed', {
  tutorial_id: tutorialId,
  step_number: currentStep + 1,
  step_id: steps[currentStep].id,
  page: typeof window !== 'undefined' ? window.location.pathname : '',
  timestamp: new Date().toISOString(),
});
```

---

### Event: `tutorial_completed`

**Location**: `libs/ui/src/hooks/use-tutorial.ts`  
**Trigger**: User completes final step  
**Code**:
```typescript
capture('tutorial.completed', {
  tutorial_id: tutorialId,
  page: typeof window !== 'undefined' ? window.location.pathname : '',
  steps_viewed: steps.length,
  time_to_complete: Date.now() - startTime,
  timestamp: new Date().toISOString(),
});
```

---

### Event: `tutorial_skipped`

**Location**: `libs/ui/src/hooks/use-tutorial.ts`  
**Trigger**: User clicks "Skip tutorial"  
**Code**:
```typescript
capture('tutorial.skipped', {
  tutorial_id: tutorialId,
  page: typeof window !== 'undefined' ? window.location.pathname : '',
  skipped_at_step: currentStep + 1,
  steps_viewed: currentStep + 1,
  timestamp: new Date().toISOString(),
});
```

---

### Event: `tutorial_restarted`

**Location**: `libs/ui/src/hooks/use-tutorial.ts`  
**Trigger**: User manually restarts tutorial  
**Code**:
```typescript
capture('tutorial.restarted', {
  tutorial_id: tutorialId,
  page: typeof window !== 'undefined' ? window.location.pathname : '',
  previous_completion: wasCompleted,
  timestamp: new Date().toISOString(),
});
```

---

## Dependencies

### External Dependencies

- **None** - Tutorial system uses only React and browser APIs

### Internal Dependencies

- `@ryla/ui` - Component library (must exist)
- `@ryla/analytics` - Analytics library (must exist)
- `@ryla/shared` - Shared utilities (for `cn` utility if needed)

### Package Dependencies

- No new npm packages required
- Uses existing React, TypeScript, Tailwind CSS

---

## Environment Variables

**None required** - Tutorial system is client-side only.

---

## Implementation Order

1. **Foundation (ST-124)**: Build reusable components
   - TSK-124-001 to TSK-124-010
   - All tutorial components must be complete before Studio integration

2. **Studio Integration (ST-120)**: Integrate into Studio page
   - TSK-120-001 to TSK-120-005
   - Requires tutorial components (ST-124)

3. **Navigation (ST-121)**: Step navigation functionality
   - TSK-121-001 to TSK-121-006
   - Requires tutorial components (ST-124)

4. **Skip (ST-122)**: Skip functionality
   - TSK-122-001 to TSK-122-005
   - Requires tutorial components (ST-124)

5. **Restart (ST-123)**: Restart functionality (MVP: basic, Phase 2+: settings)
   - TSK-123-001 to TSK-123-005
   - Requires tutorial components (ST-124)

---

## Testing Strategy

### Unit Tests

- `useTutorial` hook state management
- Component rendering with different props
- localStorage persistence
- Analytics event firing

### Integration Tests

- Tutorial flow end-to-end
- Studio page integration
- Pointer positioning accuracy
- Step navigation

### E2E Tests (Playwright)

- Tutorial appears on first Studio visit
- Navigation through all 5 steps
- Skip functionality
- Tutorial doesn't show after completion
- Analytics events tracked correctly
- Keyboard navigation works
- Mobile responsive behavior

---

## Phase 5 Completion Checklist

- [x] File plan complete (all files listed)
- [x] Task breakdown complete (31 tasks)
- [x] Tracking plan complete (5 analytics events)
- [x] Dependencies identified
- [x] Implementation order defined
- [x] Testing strategy defined

**Phase 5 Status**: ✅ Complete

**Ready for Phase 6**: Implementation

