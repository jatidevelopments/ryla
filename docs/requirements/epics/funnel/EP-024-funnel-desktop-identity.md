# [EPIC] EP-024: Funnel Desktop Adaptation & Identity System

**Status**: Proposed
**Phase**: P2
**Created**: 2026-01-21
**Last Updated**: 2026-01-21


## Overview

Enhance the funnel app (`apps/funnel`) with:

1. **Multiple Creation Methods** - Add three creation paths: Presets, AI, and Custom Prompts (similar to MDC project)
2. **Desktop multi-step layout** - Allow users to view and interact with multiple steps simultaneously on desktop
3. **Identity & Personality System** - Build up AI influencer identity with background story, personality, and human-like characteristics

> **Phase**: MVP Enhancement  
> **Depends on**: Existing funnel (EP-003 context)

---

## Business Impact

**Target Metrics**:

- **A - Activation**: Easier funnel completion on desktop
- **C - Core Value**: Richer character identity = better content generation

**Hypothesis**:

- When users can see multiple steps at once on desktop, they'll complete the funnel faster and with less friction
- When AI influencers have rich identities (background story, personality), they feel more human-like and generate better, more consistent content

**Success Criteria**:

- Desktop funnel completion rate: **>75%** (vs mobile baseline)
- Time to complete funnel on desktop: **<15 minutes** (vs mobile ~20 minutes)
- Identity completion rate: **>80%** of users complete identity steps
- Content quality improvement: **>25%** better caption relevance with identity

---

## Part 1: Multiple Creation Methods

### F0: Creation Method Selection

**Goal**: Allow users to choose between three creation methods at the start of the funnel

**Creation Methods**:

1. **Create with Presets** (Current funnel flow)

   - Multi-step wizard with preset options
   - Guided selection of appearance, identity, etc.
   - Best for: Users who want guidance and quick setup

2. **Create with AI** (AI-assisted creation)

   - AI generates character based on user input/description
   - Faster setup with AI doing the heavy lifting
   - Best for: Users who want quick results with minimal effort

3. **Create with Custom Prompts** (Advanced creation)
   - Full control with custom prompts for all aspects
   - Advanced users who know exactly what they want
   - Best for: Power users and creators who want full control

**Implementation**:

- Update `ChooseCreationMethodStep` to show three option cards
- Each card has:
  - Icon/visual representation
  - Title and description
  - "Best for" indicator
  - Selection state
- Store selected method in form state: `creation_method: "presets" | "ai" | "custom"`
- Conditional routing based on selected method

**Step Component**: `ChooseCreationMethodStep` (enhanced)

**Form Field**: `creation_method` (required)

**UI Example**:

```
┌─────────────────────────────────────────────────────┐
│  Choose Your Creation Method                        │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐│
│  │ 🎨 Presets   │  │ 🤖 AI        │  │ ✏️ Custom   ││
│  │              │  │              │  │            ││
│  │ Guided       │  │ AI-powered   │  │ Full       ││
│  │ step-by-step │  │ quick setup  │  │ control    ││
│  │              │  │              │  │            ││
│  │ Best for:    │  │ Best for:    │  │ Best for:  ││
│  │ Beginners    │  │ Quick start  │  │ Advanced   ││
│  └──────────────┘  └──────────────┘  └────────────┘│
│                                                      │
│              [Continue]                              │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### F0a: Conditional Flow Routing

**Goal**: Route users to appropriate flow based on creation method

**Flow Structure**:

1. **Presets Flow** (Current funnel):

   - All existing steps (0-44)
   - No changes needed

2. **AI Flow** (New):

   - Step 0: Choose Creation Method (select "AI")
   - Step 1: AI Description Input
     - User describes what they want (text area)
     - Optional: Upload reference image
   - Step 2: AI Generation (loader)
     - AI generates character config
     - Shows preview
   - Step 3: Review & Edit
     - User can edit AI-generated config
     - Adjust appearance, identity, etc.
   - Step 4: Continue to generation (same as presets)

3. **Custom Prompts Flow** (New):
   - Step 0: Choose Creation Method (select "Custom")
   - Step 1: Custom Prompts Form
     - Appearance prompt (textarea)
     - Identity prompt (textarea)
     - Image generation prompt (textarea)
     - Advanced settings
   - Step 2: Review & Generate
     - Preview configuration
     - Generate character

**Implementation**:

- Add conditional logic in `FunnelView` to render different step sets
- Create new step components for AI and Custom flows
- Reuse existing components where possible
- Maintain single form state across all flows

---

## Part 2: Desktop Multi-Step Layout

### F1: Responsive Layout Detection

**Goal**: Detect desktop vs mobile and apply appropriate layout

**Implementation**:

- Use Tailwind breakpoints (`md:`, `lg:`, `xl:`) for responsive design
- Create `useIsDesktop` hook or use CSS media queries
- Desktop threshold: `lg:` (1024px)

**Files to Modify**:

- `apps/funnel/features/funnel/index.tsx` - Add layout detection
- `apps/funnel/components/layouts/StepWrapper.tsx` - Make responsive

### F2: Desktop Multi-Step Layout

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
   - Phase 5: Identity & Personality (NEW - Steps to be added)
   - Phase 6: Content Options (Steps 30-35)

2. **Group by Step Type**:
   - Input steps (can be filled simultaneously)
   - Info steps (read-only, can be shown alongside)
   - Payment steps (sequential, must be last)

**Implementation Approach**:

- Create `DesktopFunnelLayout` component
- Create `StepGroup` component for grouping related steps
- Modify `StepWrapper` to support inline/compact mode
- Use CSS Grid or Flexbox for multi-column layout

### F3: Step Component Adaptation

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
- Conditionally render based on variant

### F4: Navigation & Progress Updates

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

---

## Part 2: Identity & Personality System

### F6: Background Story Step

**Goal**: Create a human-like backstory for the AI influencer

**Form Fields**:

- `influencer_background_origin` - Where are they from? (text input, optional)
- `influencer_background_story` - Key life events/backstory (textarea, 50-500 chars, optional)
- `influencer_background_dreams` - What do they aspire to? (textarea, 50-300 chars, optional)

**Step Component**: `InfluencerBackgroundStoryStep`

**Placement**: After "Voice" step (Step 24), before "Video Content Intro" (Step 25)

**UI Example**:

```
┌─────────────────────────────────────────────────────┐
│  Create Her Story                                    │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Where is she from?                                  │
│  ┌──────────────────────────────────────────────┐   │
│  │ Miami, Florida                                │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  Her background story (optional)                     │
│  ┌──────────────────────────────────────────────┐   │
│  │ Luna grew up in Miami, raised by her single  │   │
│  │ mother who was a fitness instructor. She     │   │
│  │ discovered her passion for wellness at 16...  │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  What are her dreams?                                │
│  ┌──────────────────────────────────────────────┐   │
│  │ To inspire 1 million people to live          │   │
│  │ healthier, more balanced lives                │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│              [Continue]                              │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### F7: Personality & Archetype Step

**Goal**: Define personality traits and archetype (enhance existing or add new step)

**Form Fields**:

- `influencer_archetype` - Character archetype/vibe (single select, required)
- `influencer_personality_traits` - Personality traits (multi-select, 3-5 required)

**Archetype Options**:

- `girl_next_door` - Relatable, friendly, approachable
- `fitness_enthusiast` - Active, healthy, motivational
- `luxury_lifestyle` - Glamorous, aspirational, sophisticated
- `mysterious_edgy` - Intriguing, bold, unconventional
- `playful_fun` - Bubbly, entertaining, spontaneous
- `professional_boss` - Ambitious, confident, successful

**Personality Traits** (multi-select, 3-5):

- **Energy**: Confident, Shy, Bold, Laid-back
- **Social**: Playful, Mysterious, Caring, Independent
- **Lifestyle**: Adventurous, Homebody, Ambitious, Creative
- **Vibe**: Flirty, Classy, Edgy, Sweet

**Step Component**: `InfluencerPersonalityStep` (new or enhance existing)

**Placement**: After "Background Story" step, before "Video Content Intro"

### F7: Character Bio Step

**Goal**: Create a short, compelling bio that summarizes the character

**Form Fields**:

- `influencer_bio` - Short bio (textarea, 50-200 chars, optional but recommended)

**Step Component**: `InfluencerBioStep`

**Placement**: After "Personality" step

**UI Example**:

```
┌─────────────────────────────────────────────────────┐
│  Write Her Bio                                      │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Create a short bio that captures her essence       │
│  (50-200 characters)                                 │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │ Luna is a 25-year-old fitness coach from      │   │
│  │ Miami who loves sunrise workouts and           │   │
│  │ motivating others to live their best lives.    │   │
│  │ ✨ Just a small-town girl with big dreams ✨   │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  💡 Tip: This bio will be used for captions and     │
│  content generation                                  │
│                                                      │
│              [Continue]                              │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### F9: Identity Summary Step (Info)

**Goal**: Show a summary of the identity created before proceeding to content options

**Step Component**: `IdentitySummaryStep` (info type)

**Content**:

- Display all identity information:
  - Background story (if provided)
  - Archetype
  - Personality traits
  - Bio
- Visual preview of how identity will be used
- "This identity will make your AI influencer feel more human and generate better content"

**Placement**: After "Bio" step, before "Video Content Intro"

---

## Updated Funnel Flow

### New Step Order (with Identity):

```
Phase 1: Entry & Engagement (Steps 0-4)
Phase 2: Basic Appearance (Steps 5-16)
Phase 3: Facial Features (Steps 17-24)
Phase 4: Body & Style (Steps 25-29)
Phase 5: Identity & Personality (NEW - Steps 30-33)
  - Step 30: Background Story
  - Step 31: Personality & Archetype
  - Step 32: Character Bio
  - Step 33: Identity Summary (info)
Phase 6: Content Options (Steps 34-37, renumbered)
  - Step 34: Video Content Intro
  - Step 35: Video Content Options
  - Step 36: NSFW Content
  - Step 37: NSFW Content Preview
Phase 7: Final Features & Generation (Steps 38-42, renumbered)
  - Step 38: Lipsync Feature
  - Step 39: Character Generation
  - Step 40: Access Influencer
  - Step 41: Feature Summary
  - Step 42: Subscription
  - Step 43: Payment
  - Step 44: All Spots Reserved
```

**Total Steps**: 45 (was 36, +9 identity steps)

---

## Acceptance Criteria

### Creation Methods (Part 1)

**AC-C1: Creation Method Selection**

- [ ] User can see three creation method options
- [ ] User can select one method
- [ ] Selected method is highlighted
- [ ] Cannot proceed without selection
- [ ] Selection saved to form state

**AC-C2: Presets Flow**

- [ ] Presets flow works as before (no regression)
- [ ] All existing steps accessible
- [ ] Form validation works

**AC-C3: AI Flow**

- [ ] User can enter description for AI generation
- [ ] Optional reference image upload works
- [ ] AI generation step shows loading state
- [ ] Generated config displayed for review
- [ ] User can edit AI-generated config
- [ ] Flow continues to character generation

**AC-C4: Custom Prompts Flow**

- [ ] User can enter custom prompts for all aspects
- [ ] Advanced settings available
- [ ] Review step shows configuration
- [ ] Flow continues to character generation

### Desktop Layout (Part 2)

**AC-D1: Responsive Detection**

- [ ] Desktop layout activates at `lg:` breakpoint (1024px)
- [ ] Mobile layout remains unchanged
- [ ] Layout switches smoothly on resize

**AC-D2: Multi-Step Display**

- [ ] Desktop shows 3 columns of steps
- [ ] Related steps grouped together
- [ ] All visible steps are interactive
- [ ] Form state updates correctly across visible steps

**AC-D3: Step Components**

- [ ] Steps support `variant="compact"` prop
- [ ] Compact mode has appropriate spacing
- [ ] Progress indicators optional in compact mode
- [ ] Buttons positioned correctly in compact mode

**AC-D4: Navigation**

- [ ] Sidebar navigator highlights current section
- [ ] Section progress indicators work
- [ ] Continue button validates all visible steps
- [ ] Error messages shown inline

### Identity System (Part 3)

**AC-I1: Background Story**

- [ ] User can enter origin (optional)
- [ ] User can enter background story (50-500 chars, optional)
- [ ] User can enter dreams/aspirations (50-300 chars, optional)
- [ ] All fields saved to form state

**AC-I2: Personality & Archetype**

- [ ] User can select archetype (required)
- [ ] User can select 3-5 personality traits (required)
- [ ] Traits organized by category
- [ ] Visual cards for archetype selection
- [ ] Cannot proceed without archetype + 3 traits

**AC-I3: Character Bio**

- [ ] User can enter bio (50-200 chars, optional but recommended)
- [ ] Character counter shows remaining chars
- [ ] Bio preview shown
- [ ] Tip/guidance displayed

**AC-I4: Identity Summary**

- [ ] All identity information displayed
- [ ] Visual summary card
- [ ] Explanation of how identity will be used
- [ ] User can proceed to content options

**AC-I5: Form Integration**

- [ ] Identity fields added to `FunnelSchema`
- [ ] Validation works for identity steps
- [ ] Identity data saved with character generation
- [ ] Identity used in caption/content generation

---

## Analytics Events

### Creation Method Events

| Event                      | Trigger                         | Properties |
| -------------------------- | ------------------------------- | ---------- |
| `creation_method_selected` | User selects creation method    | `method`   |
| `ai_flow_started`          | User starts AI creation flow    | -          |
| `custom_flow_started`      | User starts custom prompts flow | -          |
| `presets_flow_started`     | User starts presets flow        | -          |

### Desktop Layout Events

| Event                      | Trigger                   | Properties                      |
| -------------------------- | ------------------------- | ------------------------------- |
| `desktop_layout_activated` | Desktop layout shown      | `screen_width`, `columns_shown` |
| `multi_step_viewed`        | Multiple steps visible    | `step_count`, `section`         |
| `step_group_completed`     | All steps in group filled | `group_id`, `steps_completed`   |

### Identity Events

| Event                         | Trigger                           | Properties                                                 |
| ----------------------------- | --------------------------------- | ---------------------------------------------------------- |
| `background_story_started`    | User enters background story step | -                                                          |
| `background_story_completed`  | User completes background story   | `has_origin`, `has_story`, `has_dreams`                    |
| `archetype_selected`          | User selects archetype            | `archetype`                                                |
| `personality_traits_selected` | User selects traits               | `traits[]`, `trait_count`                                  |
| `bio_entered`                 | User enters bio                   | `bio_length`                                               |
| `identity_summary_viewed`     | Identity summary shown            | `identity_completeness`                                    |
| `identity_completed`          | All identity steps done           | `has_background`, `has_archetype`, `has_traits`, `has_bio` |

---

## Data Model Updates

### FunnelSchema Extension

```typescript
interface FunnelSchema {
  // ... existing fields ...

  // Creation Method (NEW)
  creation_method: 'presets' | 'ai' | 'custom'; // required

  // AI Flow Fields (NEW)
  ai_description?: string; // User's description for AI generation
  ai_reference_image?: string; // Optional reference image URL
  ai_generated_config?: any; // AI-generated character config

  // Custom Prompts Flow Fields (NEW)
  custom_appearance_prompt?: string;
  custom_identity_prompt?: string;
  custom_image_prompt?: string;
  custom_advanced_settings?: any;

  // Identity & Personality (NEW)
  influencer_background_origin?: string;
  influencer_background_story?: string;
  influencer_background_dreams?: string;
  influencer_archetype: string; // required
  influencer_personality_traits: string[]; // 3-5 required
  influencer_bio?: string; // 50-200 chars, optional
}
```

### Character Generation Payload

```typescript
interface CharacterGenerationPayload {
  // ... existing appearance fields ...

  // Identity fields
  identity: {
    background?: {
      origin?: string;
      story?: string;
      dreams?: string;
    };
    archetype: string;
    personalityTraits: string[];
    bio?: string;
  };
}
```

---

## Implementation Plan

### Phase 1: Creation Methods (Week 1)

1. **Update ChooseCreationMethodStep**

   - [ ] Add three creation method cards
   - [ ] Add selection state
   - [ ] Update form field

2. **Create AI Flow Steps**

   - [ ] `AIDescriptionStep.tsx`
   - [ ] `AIGenerationStep.tsx` (loader)
   - [ ] `AIReviewEditStep.tsx`

3. **Create Custom Prompts Flow Steps**

   - [ ] `CustomPromptsStep.tsx`
   - [ ] `CustomReviewStep.tsx`

4. **Update FunnelView for Conditional Routing**
   - [ ] Add flow detection logic
   - [ ] Conditionally render step sets
   - [ ] Test all three flows

### Phase 2: Desktop Layout (Week 2-3)

1. **Create Desktop Layout Components**

   - [ ] `DesktopFunnelLayout.tsx`
   - [ ] `StepGroup.tsx`
   - [ ] `useIsDesktop.ts` hook

2. **Modify StepWrapper**

   - [ ] Add `variant` prop
   - [ ] Adjust spacing for compact mode

3. **Update FunnelView**

   - [ ] Add layout detection
   - [ ] Conditionally render desktop/mobile layout

4. **Update Step Components**
   - [ ] Add `variant` prop support
   - [ ] Test compact mode

### Phase 3: Identity Steps (Week 3-4)

1. **Create Identity Step Components**

   - [ ] `InfluencerBackgroundStoryStep.tsx`
   - [ ] `InfluencerPersonalityStep.tsx`
   - [ ] `InfluencerBioStep.tsx`
   - [ ] `IdentitySummaryStep.tsx`

2. **Update Step Configuration**

   - [ ] Add new steps to `steps.ts`
   - [ ] Update step indices
   - [ ] Add form fields to schema

3. **Update Validation**

   - [ ] Add identity field validation
   - [ ] Update form validation rules

4. **Integration**
   - [ ] Connect identity to character generation
   - [ ] Update caption/content generation to use identity

### Phase 4: Testing & Refinement (Week 4-5)

1. **Testing**

   - [ ] Test desktop layout on all breakpoints
   - [ ] Test identity flow end-to-end
   - [ ] Test form validation
   - [ ] Test character generation with identity

2. **Refinement**
   - [ ] Optimize performance
   - [ ] Refine spacing and styling
   - [ ] Add animations/transitions
   - [ ] Polish UX details

---

## Dependencies

- Existing funnel infrastructure
- Form validation system
- Character generation API (needs identity support)
- Caption/content generation (needs identity support)

---

## Risks

| Risk                               | Likelihood | Mitigation                                              |
| ---------------------------------- | ---------- | ------------------------------------------------------- |
| Multiple flows increase complexity | Medium     | Reuse components, maintain single form state            |
| AI generation quality issues       | Medium     | Provide editing capability, set expectations            |
| Custom prompts too complex         | Low        | Provide examples, tooltips, and guidance                |
| Desktop layout feels cluttered     | Medium     | Start with 2 columns, expand to 3 if needed             |
| Identity steps increase drop-off   | Medium     | Make identity steps optional where possible, show value |
| Form validation complexity         | Low        | Use existing validation system, test thoroughly         |
| Character generation API changes   | Medium     | Coordinate with backend team early                      |

---

## Success Metrics

| Metric                         | Target                        |
| ------------------------------ | ----------------------------- |
| Creation method selection rate | >90% (users select a method)  |
| AI flow completion rate        | >70%                          |
| Custom flow completion rate    | >60%                          |
| Desktop funnel completion rate | >75%                          |
| Time to complete on desktop    | <15 minutes                   |
| Identity completion rate       | >80%                          |
| Content quality improvement    | >25% better caption relevance |

---

## Non-Goals (Phase 2+)

- AI-generated identity (manual entry for MVP)
- Advanced personality scales (introvert/extrovert, etc.)
- Full backstory builder with multiple life events
- Identity editing after creation
- Multiple identity profiles per influencer
- Switching creation methods mid-flow
- Hybrid creation methods (e.g., AI + Custom)

---

## Phase Checklist

- [ ] P1: Requirements (this epic)
- [ ] P2: Stories created
- [ ] P3: Architecture design
- [ ] P4: UI skeleton
- [ ] P5: Tech spec
- [ ] P6: Implementation
- [ ] P7: Testing
- [ ] P8: Integration
- [ ] P9: Deployment
- [ ] P10: Validation
