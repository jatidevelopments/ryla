# Funnel Desktop Adaptation Plan

> **Related Epic**: [EP-024: Funnel Desktop Adaptation & Identity System](../requirements/epics/funnel/EP-024-funnel-desktop-identity.md)

## Overview

Adapt the mobile-first funnel app (`apps/funnel`) to support desktop layouts where users can view and interact with multiple steps simultaneously, while maintaining the existing mobile design.

**Note**: This plan also includes adding Identity & Personality steps to build up AI influencer identity with background story, personality, and human-like characteristics.

## Current State Analysis

### Architecture

- **36 steps** organized into phases (Entry, Basic Appearance, Facial Features, Body & Style, Content Options, Generation & Payment)
- **Mobile-first design**: Single step per view, centered layout with `max-w-[450px]`
- **Navigation**: Sidebar navigator (`FunnelStepNavigator`) with collapsible state
- **Form Management**: React Hook Form with `FunnelSchema` validation
- **Step Types**: `input`, `info`, `payment`, `loader`, `social-proof`
- **Step Components**: Individual React components in `apps/funnel/features/funnel/components/Steps/`

### Current Layout Structure

```
StepWrapper (full width, padding)
  └─ Centered container (max-w-[450px])
      ├─ Progress bar
      ├─ Step title & description
      ├─ Step-specific content (options, inputs, etc.)
      └─ Continue button (fixed bottom on mobile)
```

### Key Components

- `FunnelView`: Main container with form provider and stepper
- `Stepper`: Context provider for step navigation
- `StepWrapper`: Layout wrapper for individual steps
- `FunnelStepNavigator`: Sidebar navigation (collapsible)
- Individual step components (e.g., `InfluencerEthnicityStep`, `InfluencerAgeStep`)

## Desktop Adaptation Strategy

### Phase 1: Responsive Layout Detection

**Goal**: Detect desktop vs mobile and apply appropriate layout

**Implementation**:

- Use Tailwind breakpoints (`md:`, `lg:`, `xl:`) for responsive design
- Create a `useIsDesktop` hook or use CSS media queries
- Desktop threshold: `md:` (768px) or `lg:` (1024px)

**Files to Modify**:

- `apps/funnel/features/funnel/index.tsx` - Add layout detection
- `apps/funnel/components/layouts/StepWrapper.tsx` - Make responsive

### Phase 2: Desktop Multi-Step Layout

**Goal**: Show multiple related steps in a grid/column layout on desktop

**Layout Structure**:

```
Desktop Layout (lg: and above):
┌─────────────────────────────────────────────────────────┐
│  Sidebar Navigator (fixed left, 280px)                  │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Main Content Area (flex-1)                       │  │
│  │  ┌──────────────┬──────────────┬──────────────┐  │  │
│  │  │  Column 1     │  Column 2    │  Column 3    │  │  │
│  │  │  (Steps 1-3)  │  (Steps 4-6) │  (Steps 7-9) │  │  │
│  │  │               │              │              │  │  │
│  │  │  Step A       │  Step D      │  Step G     │  │  │
│  │  │  Step B       │  Step E      │  Step H     │  │  │
│  │  │  Step C       │  Step F      │  Step I     │  │  │
│  │  └──────────────┴──────────────┴──────────────┘  │  │
│  │                                                   │  │
│  │  Continue Button (sticky bottom, full width)     │  │
│  └────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**Step Grouping Strategy**:

1. **Group by Phase/Logical Sections**:

   - Phase 1: Entry & Engagement (Steps 0-4)
   - Phase 2: Basic Appearance (Steps 5-16)
   - Phase 3: Facial Features (Steps 17-24)
   - Phase 4: Body & Style (Steps 25-29)
   - Phase 5: Content Options (Steps 30-35)

2. **Group by Step Type**:

   - Input steps (can be filled simultaneously)
   - Info steps (read-only, can be shown alongside)
   - Payment steps (sequential, must be last)

3. **Smart Grouping**:
   - Group steps that don't have dependencies
   - Keep sequential steps that depend on previous selections together
   - Allow parallel selection of independent options

**Implementation Approach**:

- Create `DesktopFunnelLayout` component
- Create `StepGroup` component for grouping related steps
- Modify `StepWrapper` to support inline/compact mode
- Use CSS Grid or Flexbox for multi-column layout

### Phase 3: Step Component Adaptation

**Goal**: Make step components work in both single-step (mobile) and multi-step (desktop) modes

**Changes Needed**:

1. **Compact Mode**: Steps should have a compact variant for desktop

   - Smaller padding
   - Reduced spacing
   - Inline progress indicators (optional)
   - Smaller buttons or inline actions

2. **Visibility Logic**:

   - Steps should be visible when in their "group" is active
   - Steps can be scrolled into view or shown in columns
   - Maintain current step highlighting

3. **Form State**:
   - All visible steps should be able to update form state
   - Validation should work across all visible steps
   - Show validation errors inline

**Step Component Modifications**:

- Add `variant?: "default" | "compact"` prop to step components
- Conditionally render based on variant:
  ```tsx
  <StepWrapper variant={isDesktop ? 'compact' : 'default'}>
    {/* Step content */}
  </StepWrapper>
  ```

### Phase 4: Navigation & Progress

**Goal**: Update navigation to work with multi-step desktop layout

**Changes**:

1. **Sidebar Navigator**:

   - Keep existing sidebar (already works well)
   - Highlight current "section" or "group" of steps
   - Allow jumping to different sections

2. **Progress Indicator**:

   - Show overall progress (existing)
   - Show progress within current section
   - Visual indicators for completed steps in visible groups

3. **Continue Button**:
   - Desktop: Show at bottom of visible section or sticky bottom
   - Validate all visible steps before allowing continue
   - Show which steps need attention

### Phase 5: Form Validation & State Management

**Goal**: Ensure form validation works correctly with multiple visible steps

**Challenges**:

- Multiple steps visible simultaneously
- Validation errors need to be shown inline
- Form state updates from multiple steps
- Conditional step visibility (e.g., NSFW preview only if NSFW enabled)

**Solutions**:

- Use React Hook Form's validation mode: `onChange` or `onBlur`
- Show validation errors inline below each field/option
- Disable "Continue" if any visible step has errors
- Use form's `formState.errors` to check all steps

### Phase 6: Responsive Breakpoints

**Breakpoint Strategy**:

- **Mobile** (`< 768px`): Current single-step layout
- **Tablet** (`768px - 1023px`): 2-column layout, larger steps
- **Desktop** (`≥ 1024px`): 3-column layout, compact steps
- **Large Desktop** (`≥ 1280px`): 3-4 columns, more steps visible

**Implementation**:

```tsx
// Example responsive classes
<div className="
  flex flex-col                    // Mobile: single column
  md:grid md:grid-cols-2          // Tablet: 2 columns
  lg:grid lg:grid-cols-3          // Desktop: 3 columns
  xl:grid xl:grid-cols-4          // Large: 4 columns
  gap-4 lg:gap-6
">
```

## Implementation Plan

### Step 1: Create Desktop Layout Components

**Files to Create**:

- `apps/funnel/components/layouts/DesktopFunnelLayout.tsx`
- `apps/funnel/components/layouts/StepGroup.tsx`
- `apps/funnel/hooks/useIsDesktop.ts` (or use CSS)

**Tasks**:

- [ ] Create `DesktopFunnelLayout` component
- [ ] Create `StepGroup` component for grouping steps
- [ ] Add responsive breakpoint detection

### Step 2: Modify StepWrapper for Compact Mode

**File**: `apps/funnel/components/layouts/StepWrapper.tsx`

**Changes**:

- [ ] Add `variant` prop: `"default" | "compact"`
- [ ] Adjust padding/spacing based on variant
- [ ] Make progress bar optional in compact mode
- [ ] Adjust button positioning for compact mode

### Step 3: Update FunnelView for Desktop Layout

**File**: `apps/funnel/features/funnel/index.tsx`

**Changes**:

- [ ] Detect desktop vs mobile
- [ ] Conditionally render `DesktopFunnelLayout` or current layout
- [ ] Pass appropriate props to step components

### Step 4: Group Steps by Phase

**File**: `apps/funnel/features/funnel/config/steps.ts` (or new file)

**Changes**:

- [ ] Define step groups/phases
- [ ] Create helper functions to get steps by phase
- [ ] Create helper to determine which steps can be shown together

**Step Groups**:

```typescript
const STEP_GROUPS = [
  {
    id: 'entry',
    name: 'Entry & Engagement',
    stepIndices: [0, 1, 2, 3, 4],
    canShowTogether: true,
  },
  {
    id: 'basic-appearance',
    name: 'Basic Appearance',
    stepIndices: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    canShowTogether: true, // Some steps may have dependencies
  },
  // ... more groups
];
```

### Step 5: Update Step Components for Compact Mode

**Files**: All step components in `apps/funnel/features/funnel/components/Steps/`

**Changes**:

- [ ] Accept `variant` prop (optional, default "default")
- [ ] Conditionally adjust styling based on variant
- [ ] Make progress bar optional
- [ ] Adjust button positioning

**Example**:

```tsx
export function InfluencerEthnicityStep({ variant = 'default' }) {
  const isCompact = variant === 'compact';

  return (
    <StepWrapper variant={variant}>
      {!isCompact && <Stepper.Progress />}
      {/* Rest of step content */}
    </StepWrapper>
  );
}
```

### Step 6: Update Navigation & Progress

**Files**:

- `apps/funnel/components/FunnelStepNavigator.tsx`
- `apps/funnel/components/stepper/StepperProgress.tsx`

**Changes**:

- [ ] Highlight current section/group in navigator
- [ ] Show section progress indicators
- [ ] Update progress calculation for multi-step view

### Step 7: Form Validation Updates

**Files**:

- `apps/funnel/features/funnel/hooks/useFunnelForm.tsx`
- `apps/funnel/features/funnel/validation.ts`

**Changes**:

- [ ] Ensure validation works for all visible steps
- [ ] Show inline validation errors
- [ ] Update "Continue" button to check all visible steps

### Step 8: Testing & Refinement

**Tasks**:

- [ ] Test on mobile (should remain unchanged)
- [ ] Test on tablet (2-column layout)
- [ ] Test on desktop (3-column layout)
- [ ] Test form validation across multiple steps
- [ ] Test navigation between sections
- [ ] Test conditional step visibility (e.g., NSFW preview)
- [ ] Performance testing with multiple visible steps

## Design Considerations

### Visual Hierarchy

- **Current Step**: Highlighted with border/background
- **Completed Steps**: Subtle checkmark or muted styling
- **Available Steps**: Normal styling, interactive
- **Locked Steps**: Grayed out, disabled (if dependencies not met)

### Spacing & Layout

- **Mobile**: Full-width steps, generous padding
- **Desktop**: Compact steps, tighter spacing, multiple columns
- **Gaps**: Consistent gap between steps (e.g., `gap-4` or `gap-6`)

### Button Placement

- **Mobile**: Fixed bottom, full width
- **Desktop**:
  - Option 1: Sticky bottom, full width across all columns
  - Option 2: Inline with each step (for independent completion)
  - Option 3: Section-level continue button

### Progress Indicators

- **Mobile**: Full progress bar at top
- **Desktop**:
  - Overall progress (optional, can use sidebar)
  - Section progress (within current group)
  - Step completion indicators (checkmarks)

## Technical Considerations

### Performance

- **Lazy Loading**: Consider lazy loading step components that aren't visible
- **Memoization**: Memoize step groups and calculations
- **Re-renders**: Minimize re-renders when form state changes

### Accessibility

- **Focus Management**: Ensure focus moves correctly between steps
- **Screen Readers**: Announce step completion and errors
- **Keyboard Navigation**: Support tab navigation across visible steps

### State Management

- **Form State**: React Hook Form handles this well
- **Step Visibility**: Track which steps are visible/active
- **Section State**: Track current section/group

## Migration Strategy

### Phase 1: Non-Breaking Changes

1. Add desktop layout components alongside existing
2. Make step components accept `variant` prop (optional)
3. Add responsive classes without changing mobile behavior

### Phase 2: Conditional Rendering

1. Detect desktop vs mobile
2. Conditionally render desktop or mobile layout
3. Test both layouts independently

### Phase 3: Integration

1. Connect desktop layout to form state
2. Ensure validation works correctly
3. Test end-to-end flow

### Phase 4: Refinement

1. Optimize performance
2. Refine spacing and styling
3. Add animations/transitions
4. Polish UX details

## Success Criteria

✅ **Mobile**: No regression, existing design maintained  
✅ **Desktop**: Multiple steps visible and interactive simultaneously  
✅ **Form**: Validation works across all visible steps  
✅ **Navigation**: Smooth navigation between sections  
✅ **Performance**: No significant performance degradation  
✅ **Accessibility**: Maintains or improves accessibility  
✅ **UX**: Easier to complete funnel on desktop with multi-step view

## Next Steps

1. **Review & Approve Plan**: Get stakeholder approval
2. **Create Branch**: `feat/funnel-desktop-adaptation`
3. **Start with Step 1**: Create desktop layout components
4. **Iterate**: Build incrementally, test frequently
5. **Document**: Update documentation as changes are made

## Open Questions

1. **Step Dependencies**: How to handle steps that depend on previous selections?

   - **Answer**: Show dependent steps only after dependencies are met, or disable them with tooltip

2. **Continue Button**: Single button for all steps or per-step buttons?

   - **Answer**: Start with single section-level button, can add per-step later

3. **Info Steps**: How to display info steps in multi-step view?

   - **Answer**: Show as cards/banners alongside input steps, or in a dedicated column

4. **Payment Steps**: Should payment steps remain sequential?

   - **Answer**: Yes, payment steps should remain sequential and full-width

5. **Mobile Navigation**: Keep existing mobile navigation or enhance?
   - **Answer**: Keep existing, desktop enhancement only
