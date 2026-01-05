# Character Wizard - Complete Audit & Flow Specification

> **Last Updated**: 2026-01-05
> **Status**: Updated to reflect 4-step prompt-based flow with Identity step

## Overview

The Character Wizard is a multi-step flow for creating AI influencers with two creation methods:

1. **Presets Flow**: 10-step form-based configuration (visual option selection)
2. **Prompt-Based Flow**: 4-step text-driven creation (minimal input + identity + AI-enhanced)

Both flows share the final steps (Base Image Selection → Finalize).

---

## Flow Diagrams

### Presets Flow (10 steps)

```
Step 0: Creation Method Selection
    ↓
Step 1: Style (gender + realistic/anime)
    ↓
Step 2: Basic Appearance (ethnicity, age, skin color)
    ↓
Step 3: Facial Features (eye color, face shape)
    ↓
Step 4: Hair (style, color)
    ↓
Step 5: Body (type, ass size, breast size/type)
    ↓
Step 6: Skin Features (freckles, scars, beauty marks)
    ↓
Step 7: Body Modifications (piercings, tattoos)
    ↓
Step 8: Identity (name, outfit, archetype, personality, bio)
    ↓
Step 9: Base Image (generate 3, select 1)
    ↓
Step 10: Finalize (review, NSFW toggle, create character)
```

### Prompt-Based Flow (4 steps)

```
Step 0: Creation Method Selection
    ↓
Step 1: Prompt Input (text description + enhancement toggle)
    ↓
Step 2: Identity (name, outfit, archetype, personality, bio)
    ↓
Step 3: Base Image (generation starts, display 3, select 1)
    ↓
Step 4: Finalize (review, NSFW toggle, create character)
```

---

## Route Map

### Step → Route → Component Mapping

| Step ID | Route | Presets Component | Prompt-Based Component |
|---------|-------|-------------------|------------------------|
| 0 | `/wizard/step-0` | StepCreationMethod | StepCreationMethod |
| 1 | `/wizard/step-1` | StepStyle | StepPromptInput |
| 2 | `/wizard/step-2` | StepGeneral | StepIdentity |
| 3 | `/wizard/step-3` | StepFace | StepBaseImageSelection |
| 4 | `/wizard/step-4` | StepHair | StepFinalize |
| 5 | `/wizard/step-5` | StepBody | N/A |
| 6 | `/wizard/step-6` | StepSkinFeatures | N/A |
| 7 | `/wizard/step-7` | StepBodyModifications | N/A |
| 8 | `/wizard/step-8` | StepIdentity | N/A |
| 9 | `/wizard/step-9` | StepBaseImageSelection | N/A |
| 10 | `/wizard/step-10` | StepFinalize | N/A |

### Known Issues

1. **Route assumes numeric step IDs** - Deep-linking fragile; should use flow router helpers.

---

## State Management

### Store Location
- **Store**: `libs/business/src/store/character-wizard.store.ts`
- **Persistence**: Zustand + localStorage (`ryla-character-wizard`)

### Persisted State

```typescript
{
  step: number,
  status: 'idle' | 'pending' | 'generating' | 'completed' | 'error',
  form: CharacterFormData,
  characterId: string | null,
  baseImages: GeneratedImage[],
  selectedBaseImageId: string | null,
  baseImageFineTunePrompt: string,
  profilePictureSet: {
    jobId: string | null,
    images: ProfilePictureImage[],
    generating: boolean,
  }
}
```

### Missing Fields (to be added)

```typescript
// For prompt-based generation handoff (to prevent duplicate generation)
baseImageJobId: string | null,
baseImageAllJobIds: string[] | null,
baseImageGenerationStartedAt: number | null,
```

---

## Step Requirements

### Presets Flow

| Step | Required Inputs | Produced Outputs |
|------|-----------------|------------------|
| 0 | - | `creationMethod: 'presets'` |
| 1 | - | `gender`, `style` |
| 2 | `gender`, `style` | `ethnicity`, `ageRange`, `skinColor` |
| 3 | step 2 complete | `eyeColor`, `faceShape` |
| 4 | step 3 complete | `hairStyle`, `hairColor` |
| 5 | step 4 complete | `bodyType`, `assSize`, `breastSize`, `breastType` |
| 6 | step 5 complete | `freckles`, `scars`, `beautyMarks` |
| 7 | step 6 complete | `piercings`, `tattoos` |
| 8 | step 7 complete | `name`, `outfit`, `archetype`, `personalityTraits`, `bio` |
| 9 | step 8 complete | `baseImages[]`, `selectedBaseImageId` |
| 10 | `selectedBaseImageId` | Character created in DB |

### Prompt-Based Flow

| Step | Required Inputs | Produced Outputs |
|------|-----------------|------------------|
| 0 | - | `creationMethod: 'prompt-based'` |
| 1 | - | `promptInput`, `promptEnhance` |
| 2 | `promptInput` | `name`, `outfit`, `archetype`, `personalityTraits`, `bio` |
| 3 | `name`, `promptInput` | `baseImages[]`, `selectedBaseImageId` (generation starts on enter) |
| 4 | `selectedBaseImageId` | Character created in DB |

---

## Back Navigation Reset Rules

### Current Behavior (resetStepsFrom)

#### Prompt-Based Flow

| Going back to | Fields cleared |
|---------------|----------------|
| Step 1 | `promptInput`, `name`, `outfit`, `archetype`, `personalityTraits`, `bio`, `baseImages`, `selectedBaseImageId`, `baseImageFineTunePrompt`, `baseImageJobIds` |
| Step 2 | `name`, `outfit`, `archetype`, `personalityTraits`, `bio`, `baseImages`, `selectedBaseImageId`, `baseImageFineTunePrompt`, `baseImageJobIds` |
| Step 3 | `baseImages`, `selectedBaseImageId`, `baseImageFineTunePrompt`, `baseImageJobIds` |

#### Presets Flow

| Going back to | Fields cleared |
|---------------|----------------|
| Step 1 | `gender`, `style` |
| Step 2 | `ethnicity`, `ageRange`, `age`, `skinColor` |
| Step 3 | `eyeColor`, `faceShape` |
| Step 4 | `hairStyle`, `hairColor` |
| Step 5 | `bodyType`, `assSize`, `breastSize`, `breastType` |
| Step 6 | `freckles`, `scars`, `beautyMarks` |
| Step 7 | `piercings`, `tattoos` |
| Step 8 | `name`, `outfit`, `archetype`, `personalityTraits`, `bio` |
| Step 9 | `baseImages`, `selectedBaseImageId`, `baseImageFineTunePrompt` |

### Required Addition

- **Clear `baseImageJobIds` when going back** to ensure new generation starts on re-enter.

---

## Generation Contract (Prompt-Based)

### Current Behavior (IMPLEMENTED)

1. User clicks Continue on Prompt step → navigates to Identity (step 2)
2. User fills identity (name, etc.) → clicks Continue → navigates to Base Image (step 3)
3. Base Image step mounts:
   - If `promptInput` exists → calls `handleGenerateAll()` → generation starts
   - If jobIds exist (from prior generation) → poll those jobs
4. Generation produces `baseImages[]`, user selects one
5. User clicks Continue → navigates to Finalize (step 4)

### Idempotency

- API supports `idempotencyKey` to prevent duplicate generation on double-click/refresh
- Job IDs stored in wizard state for polling resume after refresh

### Refresh Resilience

- On page reload, `baseImageJobIds` restored from localStorage (if generation was started)
- Base Image step resumes polling those jobs
- If no jobIds but `promptInput` exists, starts fresh generation
- Images display progressively as jobs complete

---

## Identified Bugs

### Critical

| ID | Description | Status | Fix Location |
|----|-------------|--------|--------------|
| BUG-1 | `/wizard/step-3` returns null for prompt-based flow | ✅ Fixed | `apps/web/app/wizard/step-3/page.tsx` |
| BUG-2 | Duplicate base image generation on prompt-based flow | ✅ Fixed | Idempotency + generation on step 3 enter |
| BUG-3 | JobIds not persisted, can't resume after refresh | ✅ Fixed | `character-wizard.store.ts` |

### Medium

| ID | Description | Status | Fix Location |
|----|-------------|--------|--------------|
| BUG-4 | Deep-link to invalid step renders empty page | 🟡 Open | All step pages, wizard-layout.tsx |
| BUG-5 | No validation that previous steps are complete | 🟡 Open | wizard-layout.tsx |

### Low

| ID | Description | Status | Fix Location |
|----|-------------|--------|--------------|
| BUG-6 | Skeletons remain if generation interrupted | 🟢 Low | step-base-image-selection.tsx |

---

## Planned Fixes

### 1. Shared Flow Router (libs/business)

Create `libs/business/src/wizard/flow-router.ts`:

```typescript
export interface WizardStepConfig {
  id: number;
  route: string;
  title: string;
  component: string; // Component name for reference
  canEnter: (form: CharacterFormData, state: CharacterWizardState) => boolean;
  canProceed: (form: CharacterFormData, state: CharacterWizardState) => boolean;
  resetFields: (keyof CharacterFormData | 'baseImages' | 'selectedBaseImageId' | 'baseImageJobIds')[];
}

export const WIZARD_FLOWS: Record<'presets' | 'prompt-based', WizardStepConfig[]> = {
  'presets': [...],
  'prompt-based': [...]
};

// Helpers
export function getStepConfig(method: string, stepId: number): WizardStepConfig | undefined;
export function getNextRoute(method: string, currentStepId: number): string | null;
export function getPrevRoute(method: string, currentStepId: number): string | null;
export function getFirstIncompleteStep(method: string, form: CharacterFormData, state: CharacterWizardState): WizardStepConfig;
```

### 2. Store Updates

Add to `CharacterWizardState`:

```typescript
// Base image generation tracking (for prompt-based)
baseImageJobId: string | null;
baseImageAllJobIds: string[] | null;
baseImageGenerationStartedAt: number | null;

// Actions
setBaseImageJobIds: (jobId: string, allJobIds: string[]) => void;
clearBaseImageJobIds: () => void;
```

Update `resetStepsFrom()` to clear job IDs.

### 3. Page Updates

- `step-3/page.tsx`: Render `StepFinalize` when `creationMethod === 'prompt-based'`
- `step-prompt-input.tsx`: Store jobIds after `generateBaseImages()`
- `step-base-image-selection.tsx`: Check for existing jobIds, poll if present

### 4. API Idempotency (Optional but Recommended)

Add `idempotencyKey` support to `/characters/generate-base-images`:

```typescript
interface GenerateBaseImagesDto {
  // ... existing fields
  idempotencyKey?: string; // hash(userId + promptInput + promptEnhance)
}
```

If a job with matching key exists and is in_progress, return existing job IDs.

---

## Testing Checklist

### Prompt-Based Flow

- [ ] Step 0 → Step 1: Creation method persists
- [ ] Step 1 → Step 2: Prompt saved, Identity step renders correctly
- [ ] Step 2: Name and personality fields work
- [ ] Step 2 → Step 3: Generation starts on enter, skeleton loaders appear
- [ ] Step 3: Images appear progressively, selection works
- [ ] Step 3 → Step 4: Finalize renders correctly
- [ ] Step 4: Create character works
- [ ] Refresh on Step 3: Resumes polling from stored jobIds
- [ ] Back from Step 3: Clears images + jobIds
- [ ] Back from Step 2: Clears identity fields + images + jobIds
- [ ] Forward again: Identity empty, generation starts fresh

### Presets Flow

- [ ] Full flow step 0 → step 10 works
- [ ] Back navigation at each step preserves earlier data
- [ ] Back from step 9: Clears base images
- [ ] Refresh at any step: State restored correctly
- [ ] Deep-link to step without prior data: Redirects appropriately

### Edge Cases

- [ ] Double-click Continue: Only one generation starts
- [ ] Generation error: Shows error, allows retry
- [ ] Generation timeout: Shows message, allows retry
- [ ] Network disconnect during polling: Resumes when reconnected

---

## Files Affected

| File | Changes |
|------|---------|
| `libs/business/src/wizard/flow-router.ts` | **New file** - Flow schema + helpers |
| `libs/business/src/store/character-wizard.store.ts` | Add jobId fields, update reset logic |
| `apps/web/app/wizard/step-3/page.tsx` | Handle prompt-based → Finalize |
| `apps/web/components/wizard/step-prompt-input.tsx` | Store jobIds on continue |
| `apps/web/components/wizard/step-base-image-selection.tsx` | Poll existing jobIds, no auto-start |
| `apps/web/components/wizard/wizard-layout.tsx` | Use flow router for navigation |

---

## Acceptance Criteria

- [ ] No wizard route renders an empty/null step for valid flows
- [ ] Prompt-based base images are generated exactly once per Continue (idempotent)
- [ ] Back navigation clears downstream wizard state including persisted base image artifacts
- [ ] Wizard is resilient to refresh/deep-linking
- [ ] This audit doc reflects actual behavior
