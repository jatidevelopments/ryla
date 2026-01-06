# EP-024: Contextual Page Tutorials - Architecture

**Phase**: P3 - Architecture & API Design  
**Epic**: EP-024  
**Status**: Complete

---

## 1. Functional Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Client-Side Only)              │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Next.js App (apps/web)                   │  │
│  │                                                         │  │
│  │  ┌──────────────────────────────────────────────┐    │  │
│  │  │         Studio Page (/studio)                  │    │  │
│  │  │  ┌────────────────────────────────────────┐   │    │  │
│  │  │  │  StudioContent Component               │   │    │  │
│  │  │  │  ┌──────────────────────────────────┐ │   │    │  │
│  │  │  │  │ TutorialOverlay (conditional)    │ │   │    │  │
│  │  │  │  │  - useTutorial hook               │ │   │    │  │
│  │  │  │  │  - TutorialPointer                │ │   │    │  │
│  │  │  │  │  - Step navigation                │ │   │    │  │
│  │  │  │  └──────────────────────────────────┘ │   │    │  │
│  │  │  └────────────────────────────────────────┘   │    │  │
│  │  └──────────────────────────────────────────────┘    │  │
│  │                                                         │  │
│  └──────────────────────────────────────────────────────┘  │
│                              │                               │
│                              ▼                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         UI Component Library (@ryla/ui)                │  │
│  │                                                         │  │
│  │  ┌──────────────────────────────────────────────┐    │  │
│  │  │  libs/ui/src/components/tutorial/            │    │  │
│  │  │  ├── tutorial-overlay.tsx                    │    │  │
│  │  │  ├── tutorial-pointer.tsx                    │    │  │
│  │  │  ├── tutorial-step.tsx                       │    │  │
│  │  │  ├── use-tutorial.ts (hook)                   │    │  │
│  │  │  ├── types.ts                                 │    │  │
│  │  │  └── index.ts                                 │    │  │
│  │  └──────────────────────────────────────────────┘    │  │
│  │                                                         │  │
│  │  ┌──────────────────────────────────────────────┐    │  │
│  │  │  libs/ui/src/hooks/                          │    │  │
│  │  │  └── use-tutorial.ts (re-export)             │    │  │
│  │  └──────────────────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────────┘  │
│                              │                               │
│                              ▼                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Analytics Library (@ryla/analytics)            │  │
│  │  ┌──────────────────────────────────────────────┐    │  │
│  │  │  capture('tutorial_started', {...})          │    │  │
│  │  │  capture('tutorial_step_viewed', {...})     │    │  │
│  │  │  capture('tutorial_completed', {...})       │    │  │
│  │  │  capture('tutorial_skipped', {...})         │    │  │
│  │  │  capture('tutorial_restarted', {...})       │    │  │
│  │  └──────────────────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────────┘  │
│                              │                               │
│                              ▼                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Browser APIs                              │  │
│  │  ┌──────────────────────────────────────────────┐    │  │
│  │  │  localStorage                                 │    │  │
│  │  │  - tutorial_studio_completed: boolean         │    │  │
│  │  │  - tutorial_dashboard_completed: boolean      │    │  │
│  │  │  (per tutorial ID)                            │    │  │
│  │  └──────────────────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Architecture Principles

- **Client-Side Only**: No backend API required. All state managed in browser.
- **Reusable Components**: Tutorial system is library-agnostic and can be used on any page.
- **Progressive Enhancement**: Tutorials enhance UX but don't block core functionality.
- **State Persistence**: Uses localStorage for cross-session persistence.
- **Analytics First**: All user interactions tracked for optimization.

---

## 2. Data Model

### Tutorial State (localStorage)

**Storage Key Format**: `tutorial_{tutorialId}_completed`

**Example Keys**:
- `tutorial_studio_completed`
- `tutorial_dashboard_completed`
- `tutorial_gallery_completed`

**Storage Structure**:

```typescript
// Simple boolean flag
localStorage.setItem('tutorial_studio_completed', 'true');

// Optional: Store completion timestamp (future enhancement)
interface TutorialState {
  completed: boolean;
  completedAt?: string; // ISO timestamp
  skippedAt?: string;
  skippedAtStep?: number;
}

// Current MVP: Simple boolean
// Future: JSON string with metadata
```

### Tutorial Step Definition

```typescript
interface TutorialStep {
  id: string;                    // Unique step identifier
  target: string;                // CSS selector or data attribute
  message: string;                // Instructional text
  title?: string;                // Optional step title
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  pointerDirection?: 'up' | 'down' | 'left' | 'right';
  showSkip?: boolean;            // Show skip link on this step
}
```

### Tutorial Configuration

```typescript
interface TutorialConfig {
  id: string;                    // Tutorial identifier (e.g., 'studio')
  steps: TutorialStep[];         // Array of tutorial steps
  autoStart?: boolean;            // Auto-start on mount (default: true)
  storageKey?: string;            // Custom storage key (default: tutorial_{id}_completed)
  onComplete?: () => void;        // Callback when tutorial completes
  onSkip?: () => void;           // Callback when tutorial skipped
}
```

---

## 3. API Contracts

**No Backend API Required**

This feature is entirely client-side:
- State stored in browser localStorage
- No server communication needed
- No database persistence (MVP)
- Analytics events sent via existing `@ryla/analytics` library

**Future Enhancement (Phase 2+)**:
- Store tutorial completion in user profile (Supabase)
- Sync across devices
- Admin dashboard for tutorial management

---

## 4. Component Architecture

### File Structure

```
libs/ui/src/
├── components/
│   ├── tutorial/
│   │   ├── tutorial-overlay.tsx      # Main overlay component
│   │   ├── tutorial-pointer.tsx     # Pointer/arrow component
│   │   ├── tutorial-step.tsx        # Individual step component
│   │   ├── types.ts                  # TypeScript type definitions
│   │   └── index.ts                  # Public exports
│   └── index.ts                      # Add tutorial exports
│
└── hooks/
    ├── use-tutorial.ts               # Tutorial state management hook
    └── index.ts                      # Add hook export
```

### Component Hierarchy

```
TutorialOverlay (Container)
├── TutorialStep (Current Step)
│   ├── StepIndicator ("2 of 5")
│   ├── Message (Instructional text)
│   ├── TutorialPointer (Arrow pointing to target)
│   ├── GotItButton (Primary action)
│   └── SkipLink (Secondary action)
└── Backdrop (Dark overlay with blur)
```

### Component Responsibilities

| Component | Responsibility | Props |
|-----------|---------------|-------|
| `TutorialOverlay` | Main container, manages visibility, backdrop | `steps`, `currentStep`, `onNext`, `onSkip`, `onComplete`, `isVisible` |
| `TutorialPointer` | Animated pointer/arrow pointing to target | `target`, `direction`, `position` |
| `TutorialStep` | Individual step content display | `step`, `stepNumber`, `totalSteps`, `onNext`, `onSkip` |
| `useTutorial` | State management, localStorage, navigation | `tutorialId`, `steps`, `options` |

---

## 5. Event Schema (Analytics)

### Event Definitions

All events use the `tutorial.*` namespace and are tracked via `@ryla/analytics`.

#### Event: `tutorial_started`

**Trigger**: Tutorial begins (first step shown)

**Properties**:
```typescript
{
  tutorial_id: string;        // e.g., 'studio'
  page: string;              // e.g., '/studio'
  total_steps: number;       // e.g., 5
  timestamp: string;         // ISO timestamp
}
```

**PostHog Event**: `tutorial_started`

---

#### Event: `tutorial_step_viewed`

**Trigger**: Each step is displayed

**Properties**:
```typescript
{
  tutorial_id: string;        // e.g., 'studio'
  step_number: number;        // e.g., 2 (1-indexed)
  step_id: string;            // e.g., 'character-selection'
  page: string;               // e.g., '/studio'
  timestamp: string;          // ISO timestamp
}
```

**PostHog Event**: `tutorial_step_viewed`

---

#### Event: `tutorial_completed`

**Trigger**: User completes final step

**Properties**:
```typescript
{
  tutorial_id: string;        // e.g., 'studio'
  page: string;               // e.g., '/studio'
  steps_viewed: number;       // e.g., 5
  time_to_complete: number;    // Milliseconds from start to completion
  timestamp: string;          // ISO timestamp
}
```

**PostHog Event**: `tutorial_completed`

---

#### Event: `tutorial_skipped`

**Trigger**: User clicks "Skip tutorial"

**Properties**:
```typescript
{
  tutorial_id: string;        // e.g., 'studio'
  page: string;               // e.g., '/studio'
  skipped_at_step: number;    // e.g., 2 (1-indexed)
  steps_viewed: number;       // e.g., 2
  timestamp: string;          // ISO timestamp
}
```

**PostHog Event**: `tutorial_skipped`

---

#### Event: `tutorial_restarted`

**Trigger**: User manually restarts tutorial

**Properties**:
```typescript
{
  tutorial_id: string;        // e.g., 'studio'
  page: string;               // e.g., '/studio'
  previous_completion: boolean; // Was it previously completed?
  timestamp: string;          // ISO timestamp
}
```

**PostHog Event**: `tutorial_restarted`

---

### Analytics Integration Code

```typescript
// In useTutorial hook
import { capture } from '@ryla/analytics';

const trackTutorialEvent = (
  event: string,
  properties: Record<string, unknown>
) => {
  capture(event, {
    ...properties,
    tutorial_id: tutorialId,
    page: typeof window !== 'undefined' ? window.location.pathname : '',
    timestamp: new Date().toISOString(),
  });
};

// Usage
trackTutorialEvent('tutorial_started', {
  total_steps: steps.length,
});

trackTutorialEvent('tutorial_step_viewed', {
  step_number: currentStep + 1,
  step_id: steps[currentStep].id,
});

trackTutorialEvent('tutorial_completed', {
  steps_viewed: steps.length,
  time_to_complete: Date.now() - startTime,
});
```

---

## 6. Funnels

### Tutorial Completion Funnel

**Purpose**: Track user progression through tutorial steps

**Funnel Steps**:
```
tutorial_started
  → tutorial_step_viewed (step 1)
  → tutorial_step_viewed (step 2)
  → tutorial_step_viewed (step 3)
  → tutorial_step_viewed (step 4)
  → tutorial_step_viewed (step 5)
  → tutorial_completed
```

**Drop-off Analysis**:
- Track where users drop off (which step)
- Identify if users skip early vs. late
- Measure completion rate per tutorial

**PostHog Funnel Definition**:
```
Funnel: "Tutorial Completion"
Steps:
  1. tutorial_started
  2. tutorial_step_viewed (step_number = 1)
  3. tutorial_step_viewed (step_number = 2)
  4. tutorial_step_viewed (step_number = 3)
  5. tutorial_step_viewed (step_number = 4)
  6. tutorial_step_viewed (step_number = 5)
  7. tutorial_completed

Filter: tutorial_id = 'studio'
```

---

## 7. Integration Points

### Studio Page Integration

**File**: `apps/web/app/studio/page.tsx`

**Integration Points**:
1. Add data attributes to target elements:
   ```tsx
   <div data-tutorial-target="character-selector">
     {/* Character selector UI */}
   </div>
   ```

2. Import tutorial components:
   ```tsx
   import { TutorialOverlay, useTutorial } from '@ryla/ui';
   ```

3. Define tutorial steps:
   ```tsx
   const studioTutorialSteps = [
     {
       id: 'character-selection',
       target: '[data-tutorial-target="character-selector"]',
       message: 'Select an AI Influencer to generate images for',
       position: 'bottom',
     },
     // ... more steps
   ];
   ```

4. Use hook and render overlay:
   ```tsx
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
   ```

### UI Elements to Target (Studio Page)

| Step | Target Element | Data Attribute |
|------|---------------|----------------|
| 1 | Character selector tabs | `data-tutorial-target="character-selector"` |
| 2 | Generation bar (scene/environment/outfit) | `data-tutorial-target="generation-controls"` |
| 3 | Settings (aspect ratio, quality, count) | `data-tutorial-target="generation-settings"` |
| 4 | Generate button | `data-tutorial-target="generate-button"` |
| 5 | Gallery area | `data-tutorial-target="gallery"` |

---

## 8. Design System Integration

### Colors (RYLA Theme)

```css
/* Tutorial Overlay */
--tutorial-overlay-bg: rgba(0, 0, 0, 0.8);
--tutorial-overlay-blur: blur(8px);

/* Tutorial Card */
--tutorial-card-bg: rgba(20, 20, 30, 0.95);
--tutorial-card-border: rgba(139, 92, 246, 0.3); /* Purple accent */

/* Pointer */
--tutorial-pointer-color: #3b82f6; /* Bright blue */

/* Buttons */
--tutorial-button-primary: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
--tutorial-button-text: #ffffff;

/* Text */
--tutorial-text-primary: #ffffff;
--tutorial-text-secondary: rgba(255, 255, 255, 0.7);
```

### Typography

- **Step Indicator**: Small, uppercase, muted
- **Message**: Large, bold, white
- **Skip Link**: Small, underlined, muted

### Spacing

- **Overlay Padding**: 24px (mobile), 32px (desktop)
- **Card Padding**: 24px
- **Pointer Offset**: 16px from target element

---

## 9. Performance Considerations

### Optimization Strategies

1. **Lazy Loading**: Tutorial components loaded only when needed
2. **Memoization**: Use `React.memo` for overlay components
3. **Debouncing**: Debounce pointer position calculations
4. **CSS Transitions**: Use CSS for smooth animations (not JS)

### Bundle Size Impact

- **Estimated Size**: ~15-20 KB (gzipped)
- **Components**: 3 React components + 1 hook
- **Dependencies**: None (uses existing UI library)

---

## 10. Accessibility

### WCAG 2.1 AA Compliance

- **Keyboard Navigation**: 
  - Tab to focus "Got it" button
  - Enter/Space to proceed
  - Escape to skip

- **Screen Readers**:
  - ARIA labels on overlay
  - Live region for step announcements
  - Focus trap within tutorial

- **Color Contrast**:
  - Text meets 4.5:1 contrast ratio
  - Buttons meet 3:1 contrast ratio

### ARIA Attributes

```tsx
<div
  role="dialog"
  aria-labelledby="tutorial-title"
  aria-describedby="tutorial-message"
  aria-modal="true"
>
  <div id="tutorial-title">Tutorial Step</div>
  <div id="tutorial-message">{step.message}</div>
</div>
```

---

## 11. Error Handling

### Edge Cases

1. **Target Element Not Found**:
   - Skip step or show error message
   - Log warning to console
   - Continue to next step

2. **localStorage Unavailable**:
   - Fallback to sessionStorage
   - Or in-memory state (tutorial resets on refresh)

3. **Multiple Tutorials Active**:
   - Only one tutorial active at a time
   - New tutorial closes previous one

4. **Page Navigation During Tutorial**:
   - Tutorial state preserved
   - Tutorial resumes on return (if not completed)

---

## 12. Testing Strategy

### Unit Tests

- `useTutorial` hook state management
- Component rendering with different props
- localStorage persistence

### Integration Tests

- Tutorial flow end-to-end
- Analytics events fired correctly
- Pointer positioning accuracy

### E2E Tests (Playwright)

- Tutorial appears on first visit
- Navigation through all steps
- Skip functionality
- Restart functionality
- Analytics events tracked

---

## 13. Future Enhancements (Phase 2+)

### Backend Integration

- Store tutorial completion in user profile
- Sync across devices
- Admin dashboard for tutorial management

### Advanced Features

- Interactive tutorials (click-to-complete steps)
- Video tutorials
- Multi-page tutorials
- Personalized tutorials based on user behavior
- A/B testing different tutorial flows

---

## Phase 3 Completion Checklist

- [x] Functional architecture defined
- [x] Data model (localStorage) defined
- [x] API contracts (none needed - client-side only)
- [x] Component architecture defined
- [x] Event schema (analytics) defined
- [x] Funnels defined
- [x] Integration points identified
- [x] Design system integration
- [x] Performance considerations
- [x] Accessibility requirements
- [x] Error handling strategy
- [x] Testing strategy

**Phase 3 Status**: ✅ Complete

**Ready for Phase 4**: UI Skeleton & Interactions

