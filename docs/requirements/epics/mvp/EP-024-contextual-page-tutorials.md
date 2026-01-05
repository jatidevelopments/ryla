# [EPIC] EP-024: Contextual Page Tutorials

## Overview

Contextual, page-specific tutorials that guide users through features when they first visit a page. Reusable tutorial components in `@ryla/ui` that can be used across any page, with Studio as the first implementation.

> ⚠️ **Scope**: This epic covers **page-specific contextual tutorials**, not general onboarding (see EP-012). These tutorials appear when users first enter a page and can be dismissed/restarted.

---

## Business Impact

**Target Metric**: A - Activation, C - Core Value

**Hypothesis**: When users receive contextual guidance on first page visit, they discover features faster, use the product more effectively, and have higher activation rates.

**Success Criteria**:
- Tutorial completion rate: **>70%** (users who start complete it)
- Feature discovery: **+40%** (users who use features after tutorial vs. without)
- Time to first action: **-30%** (faster after tutorial)
- Tutorial skip rate: **<20%** (most users engage)
- Studio feature usage: **+50%** (more users use advanced features after tutorial)

---

## Terminology

| Term | Definition |
|------|------------|
| **Tutorial** | A multi-step contextual guide that appears on first page visit |
| **Tutorial Step** | A single overlay with instruction, pointer, and action button |
| **Tutorial Target** | The UI element being highlighted/explained |
| **Tutorial State** | Per-page tracking of whether tutorial was completed/dismissed |

---

## Features

### F1: Reusable Tutorial Components (`@ryla/ui`)

General-purpose components that can be used on any page.

#### F1.1: `TutorialOverlay` Component

Main overlay component that displays tutorial steps.

**Props:**
```typescript
interface TutorialOverlayProps {
  steps: TutorialStep[];
  currentStep: number;
  onNext: () => void;
  onSkip: () => void;
  onComplete: () => void;
  isVisible: boolean;
}
```

**Features:**
- Dark overlay with backdrop blur
- Step indicator (e.g., "2 of 5")
- Instructional text
- Pointer/arrow pointing to target element
- "Got it" button (primary action)
- "Skip tutorial" link (secondary action)
- Smooth transitions between steps

#### F1.2: `TutorialStep` Type

```typescript
interface TutorialStep {
  id: string;
  target: string; // CSS selector or ref
  title?: string;
  message: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  pointerDirection?: 'up' | 'down' | 'left' | 'right';
  showSkip?: boolean;
}
```

#### F1.3: `useTutorial` Hook

Custom hook for managing tutorial state.

```typescript
function useTutorial(
  tutorialId: string,
  steps: TutorialStep[],
  options?: {
    autoStart?: boolean;
    storageKey?: string;
    onComplete?: () => void;
  }
): {
  currentStep: number;
  isActive: boolean;
  start: () => void;
  next: () => void;
  skip: () => void;
  complete: () => void;
  reset: () => void;
}
```

**Features:**
- Persists completion state in localStorage (per tutorial ID)
- Auto-starts on mount if not completed
- Tracks current step
- Handles step navigation
- Calls callbacks on complete/skip

#### F1.4: `TutorialPointer` Component

Animated pointer/arrow that points to target elements.

**Features:**
- Smooth animation
- Responsive positioning
- Multiple styles (arrow, spotlight, highlight)
- Auto-adjusts based on target position

---

### F2: Studio Tutorial Implementation

Contextual tutorial for the Content Studio page (`/studio`).

#### F2.1: Tutorial Steps (5 steps)

**Step 1: Character Selection**
- **Target**: Character/influencer selector tabs
- **Message**: "Select an AI Influencer to generate images for"
- **Pointer**: Points to character tabs
- **Position**: Bottom

**Step 2: Generation Controls**
- **Target**: Generation bar (scene, environment, outfit controls)
- **Message**: "Choose a scene, environment, and outfit for your images"
- **Pointer**: Points to generation controls
- **Position**: Top

**Step 3: Generation Settings**
- **Target**: Aspect ratio, quality, count controls
- **Message**: "Adjust image settings: aspect ratio, quality, and how many images to generate"
- **Pointer**: Points to settings
- **Position**: Top

**Step 4: Generate Button**
- **Target**: "Generate" button
- **Message**: "Click Generate to create your images. Each image costs credits."
- **Pointer**: Points to button
- **Position**: Top

**Step 5: Gallery & Actions**
- **Target**: Image gallery area
- **Message**: "View your generated images here. Like, download, or delete them."
- **Pointer**: Points to gallery
- **Position**: Top

#### F2.2: Tutorial Triggers

- **Auto-start**: On first visit to `/studio` (if not completed)
- **Manual restart**: Available in settings or via "Show tutorial" button
- **Skip**: Available on any step
- **Completion**: After step 5, tutorial doesn't show again

#### F2.3: Tutorial State Management

- Store completion in localStorage: `tutorial_studio_completed`
- Per-user tracking (if authenticated)
- Reset option in settings

---

## Acceptance Criteria

### AC-1: Tutorial Components Library

- [ ] `TutorialOverlay` component exists in `@ryla/ui`
- [ ] `TutorialStep` type is exported
- [ ] `useTutorial` hook is exported
- [ ] `TutorialPointer` component is exported
- [ ] Components are responsive (mobile + desktop)
- [ ] Components match design system (dark theme, purple/pink accents)
- [ ] Components are accessible (keyboard navigation, screen readers)

### AC-2: Tutorial Overlay UI

- [ ] Dark overlay with backdrop blur
- [ ] Step indicator shows "X of Y" format
- [ ] Instructional text is clear and concise
- [ ] Pointer/arrow points accurately to target element
- [ ] "Got it" button is prominent and clickable
- [ ] "Skip tutorial" link is visible but secondary
- [ ] Smooth transitions between steps
- [ ] Overlay doesn't block critical UI (can interact with target if needed)

### AC-3: Tutorial State Management

- [ ] Tutorial completion stored in localStorage
- [ ] Tutorial doesn't auto-start if already completed
- [ ] Tutorial can be manually restarted
- [ ] Tutorial can be skipped at any step
- [ ] Tutorial state persists across page refreshes
- [ ] Tutorial state is per-tutorial-ID (different pages have separate state)

### AC-4: Studio Tutorial Steps

- [ ] Step 1: Character selection highlighted
- [ ] Step 2: Generation controls highlighted
- [ ] Step 3: Settings highlighted
- [ ] Step 4: Generate button highlighted
- [ ] Step 5: Gallery highlighted
- [ ] All steps have accurate pointers
- [ ] All steps have clear messages
- [ ] Tutorial completes after step 5

### AC-5: Studio Tutorial Behavior

- [ ] Tutorial auto-starts on first `/studio` visit
- [ ] Tutorial doesn't show if already completed
- [ ] Tutorial can be skipped
- [ ] Tutorial can be restarted from settings
- [ ] Tutorial doesn't interfere with normal page usage
- [ ] Tutorial works on mobile and desktop

### AC-6: Analytics Integration

- [ ] `tutorial_started` event fired when tutorial begins
- [ ] `tutorial_step_viewed` event fired for each step (with step number)
- [ ] `tutorial_completed` event fired when tutorial finishes
- [ ] `tutorial_skipped` event fired when skipped (with step number)
- [ ] Events include tutorial ID and page context

---

## Analytics Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `tutorial_started` | Tutorial begins | `tutorial_id`, `page` |
| `tutorial_step_viewed` | User views a step | `tutorial_id`, `step_number`, `step_id`, `page` |
| `tutorial_completed` | Tutorial finishes | `tutorial_id`, `steps_viewed`, `time_to_complete`, `page` |
| `tutorial_skipped` | User skips tutorial | `tutorial_id`, `skipped_at_step`, `page` |
| `tutorial_restarted` | User manually restarts | `tutorial_id`, `page` |

---

## User Stories

### ST-120: See Tutorial on First Studio Visit

**As a** user visiting the Studio for the first time  
**I want to** see a contextual tutorial  
**So that** I understand how to use the Studio features

**AC**: AC-4, AC-5

### ST-121: Navigate Through Tutorial Steps

**As a** user in a tutorial  
**I want to** move through steps with clear navigation  
**So that** I can learn at my own pace

**AC**: AC-2, AC-3

### ST-122: Skip Tutorial If Not Needed

**As a** user who already knows how to use the Studio  
**I want to** skip the tutorial  
**So that** I can use the product immediately

**AC**: AC-3, AC-5

### ST-123: Restart Tutorial Later

**As a** user who skipped the tutorial  
**I want to** restart it later  
**So that** I can learn when I'm ready

**AC**: AC-3, AC-5

### ST-124: Use Tutorial Components on Other Pages

**As a** developer  
**I want to** use reusable tutorial components  
**So that** I can add tutorials to other pages easily

**AC**: AC-1

---

## UI Wireframes

### Tutorial Overlay (Step 2 of 5)

```
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│  [Dark overlay with blur]                                    │
│                                                               │
│                    ┌──────────────────────────────┐         │
│                    │  2 of 5                       │         │
│                    │                               │         │
│                    │  Choose a scene, environment, │         │
│                    │  and outfit for your images  │         │
│                    │                               │         │
│                    │        [Got it]               │         │
│                    │                               │         │
│                    │  Skip tutorial                │         │
│                    └───────────┬───────────────────┘         │
│                                │                             │
│                                ▼ (Pointer arrow)             │
│                    ┌──────────────────────────────┐         │
│                    │  [Scene] [Environment] [Outfit]│  ← Target
│                    └──────────────────────────────┘         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Tutorial Pointer Styles

```
Arrow Pointer:
    ┌─────┐
    │     │
    │  →  │  (points to target)
    └─────┘

Spotlight:
    ╔═══════════════╗
    ║  Highlighted  ║  (glow around target)
    ╚═══════════════╝
```

---

## Technical Notes

### Component Structure

```
libs/ui/src/components/tutorial/
├── tutorial-overlay.tsx      # Main overlay component
├── tutorial-pointer.tsx      # Pointer/arrow component
├── tutorial-step.tsx         # Individual step component
├── use-tutorial.ts           # Hook for tutorial state
├── types.ts                  # TypeScript types
└── index.ts                  # Exports
```

### Storage Keys

```typescript
// Format: tutorial_{tutorial_id}_completed
const STORAGE_KEY = `tutorial_${tutorialId}_completed`;

// Examples:
// - tutorial_studio_completed
// - tutorial_dashboard_completed
// - tutorial_gallery_completed
```

### Target Element Selection

```typescript
// Support multiple targeting methods:
// 1. CSS selector: "#character-selector"
// 2. Data attribute: "[data-tutorial-target='step-1']"
// 3. Ref: React ref object

const getTargetElement = (target: string | RefObject<HTMLElement>) => {
  if (typeof target === 'string') {
    return document.querySelector(target);
  }
  return target.current;
};
```

### Pointer Positioning

```typescript
// Calculate pointer position based on target element
const calculatePointerPosition = (
  target: HTMLElement,
  direction: 'up' | 'down' | 'left' | 'right'
) => {
  const rect = target.getBoundingClientRect();
  // Calculate position relative to viewport
  // Adjust for pointer size and spacing
  return { x, y, angle };
};
```

### Integration Example

```typescript
// In Studio page
import { TutorialOverlay, useTutorial } from '@ryla/ui';

const studioTutorialSteps = [
  {
    id: 'character-selection',
    target: '[data-tutorial-target="character-selector"]',
    message: 'Select an AI Influencer to generate images for',
    position: 'bottom',
  },
  // ... more steps
];

function StudioPage() {
  const tutorial = useTutorial('studio', studioTutorialSteps, {
    autoStart: true,
  });

  return (
    <>
      <StudioContent />
      {tutorial.isActive && (
        <TutorialOverlay
          steps={studioTutorialSteps}
          currentStep={tutorial.currentStep}
          onNext={tutorial.next}
          onSkip={tutorial.skip}
          onComplete={tutorial.complete}
          isVisible={tutorial.isActive}
        />
      )}
    </>
  );
}
```

### Analytics Integration

```typescript
import { analytics } from '@ryla/analytics';

// In useTutorial hook
const trackTutorialEvent = (event: string, properties: Record<string, any>) => {
  analytics.capture(event, {
    ...properties,
    tutorial_id: tutorialId,
    page: window.location.pathname,
  });
};
```

---

## Dependencies

- UI component library (`@ryla/ui`) - for base components
- Analytics library (`@ryla/analytics`) - for event tracking
- Studio page (EP-005) - target page for first implementation
- LocalStorage API - for state persistence

---

## Non-Goals (Phase 2+)

- Video tutorials
- Interactive tutorials (click-to-complete steps)
- Multi-page tutorials (spanning multiple routes)
- Personalized tutorials based on user behavior
- A/B testing different tutorial flows
- Tutorial analytics dashboard
- Admin UI for managing tutorials

---

## Phase Checklist

- [x] P1: Requirements (this epic)
- [x] P2: Stories created (see [EP-024-phase-2-scoping.md](./EP-024-phase-2-scoping.md))
- [x] P3: Architecture + API design (see [EP-024-architecture.md](../../architecture/EP-024-architecture.md))
- [x] P4: UI mockups + interactions (see [EP-024-ui-skeleton.md](../../specs/EP-024-ui-skeleton.md))
- [x] P5: File plan + task breakdown (see [EP-024-tech-spec.md](../../specs/EP-024-tech-spec.md))
- [ ] P6: Implementation
- [ ] P7: Tests
- [ ] P8: Integration
- [ ] P9: Deploy config
- [ ] P10: Validation + learnings

---

## Related Epics

- **EP-012**: General onboarding (welcome modal, product tour)
- **EP-005**: Content Studio (target page for first tutorial)
- **EP-004**: Dashboard (potential future tutorial target)

---

## Design Reference

Based on the provided screenshots:
- Dark overlay with backdrop blur
- Step indicator ("2 of 5", "3 of 5")
- Large instructional text
- Bright blue pointer/arrow pointing to target
- "Got it" button (primary action)
- "Skip tutorial" link (secondary action)
- Smooth transitions

