# Wizard Deferred Credit System

## Problem Statement

Currently, credits are deducted at multiple points during the character creation wizard:
1. **Base Image Generation** (80 credits) - Deducted when generating base images
2. **Profile Picture Set** (120 credits) - Deducted at character creation
3. **NSFW Extra** (50 credits) - Deducted at character creation (if enabled)

This creates poor UX when:
- User generates base images but doesn't have enough credits to finish
- User doesn't see total cost upfront
- Credits are "spent" on abandoned wizards

## Solution: Deferred Credit Deduction

### Design Principles

1. **Credits deducted ONLY at final submission** - "Create Character" button
2. **Total cost visible upfront** - Show full cost breakdown before any generation
3. **State preservation on insufficient credits** - User returns to same step after buying credits
4. **No "wasted" credits** - Abandoned wizards don't consume credits

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Wizard Credit Flow                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Step 1-N: Configure Character                                   │
│     └── Show running credit cost preview                         │
│                                                                  │
│  Base Image Step:                                                │
│     └── Generate images WITHOUT credit deduction                 │
│     └── Store images with "pending" status                       │
│     └── Record pending charge in session/store                   │
│                                                                  │
│  Finalize Step:                                                  │
│     └── Show total cost: base_images + profile_set + nsfw       │
│     └── Check balance >= total cost                              │
│     └── If insufficient: Show modal → link to /buy-credits       │
│     └── On "Create": Deduct ALL credits atomically               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Credit Cost Calculation

```typescript
// Total wizard cost calculation
function calculateWizardTotalCost(form: CharacterFormData): CreditCostBreakdown {
  const baseImageCost = FEATURE_CREDITS.base_images.credits; // 80
  
  const profileSetCost = form.selectedProfilePictureSetId 
    ? FEATURE_CREDITS.profile_set_fast.credits  // 120
    : 0;
    
  const nsfwExtraCost = (form.selectedProfilePictureSetId && form.nsfwEnabled)
    ? 50  // NSFW_EXTRA_CREDITS
    : 0;
    
  return {
    baseImageCost,
    profileSetCost,
    nsfwExtraCost,
    totalCost: baseImageCost + profileSetCost + nsfwExtraCost,
  };
}
```

### Implementation Options

#### Option A: Backend Deferred Billing (Recommended)

**Pros:**
- Single source of truth for credit logic
- Supports refunds if generation fails
- Works with any client

**Changes:**
1. Add `deferCredits: boolean` flag to `/characters/generate-base-images`
2. When `deferCredits: true`, skip credit deduction, return `pendingCredits` in response
3. Store pending charge in Redis with TTL (e.g., 1 hour)
4. On character creation, validate and deduct all pending + new charges atomically

```typescript
// POST /characters/generate-base-images
interface GenerateBaseImagesDto {
  // ... existing fields
  deferCredits?: boolean; // New: don't deduct credits immediately
}

// Response when deferCredits=true
{
  jobId: string;
  pendingCredits: number;
  totalRequired: number;
  // ... existing fields
}
```

#### Option B: Frontend-Only Tracking (Simpler)

**Pros:**
- No backend changes for generation
- Quick to implement

**Cons:**
- Less accurate (frontend can be manipulated)
- Requires all credit logic in character.create

**Changes:**
1. Remove credit deduction from base image generation endpoint
2. Track all pending costs in wizard store
3. Calculate and deduct total on character.create

```typescript
// In character-wizard.store.ts
interface CharacterWizardState {
  // ... existing
  pendingCredits: {
    baseImages: number;
    profileSet: number;
    nsfwExtra: number;
  };
}
```

### Chosen Approach: Option B (Frontend Tracking)

For MVP, Option B is simpler and sufficient. The backend already has proper credit validation.

### Implementation Plan

#### Phase 1: Remove Immediate Deduction from Base Images

1. **Modify `/characters/generate-base-images`**
   - Add optional `skipCreditDeduction: boolean` flag
   - When true, skip credit check/deduction but log warning
   - Default to current behavior for backward compatibility

2. **Update `use-base-image-generation.ts`**
   - Pass `skipCreditDeduction: true` when called from wizard
   - Store `pendingBaseImageCredits` in wizard store

#### Phase 2: Calculate Total Cost at Finalize

1. **Update `use-finalize-credits.ts`**
   - Include base image cost in total
   - Export detailed breakdown

```typescript
export function useFinalizeCredits(balance: number) {
  const form = useCharacterWizardStore((s) => s.form);
  const hasGeneratedBaseImages = useCharacterWizardStore((s) => s.baseImages.length > 0);

  // Base images cost (if generated)
  const baseImagesCost = hasGeneratedBaseImages ? FEATURE_CREDITS.base_images.credits : 0;
  
  // Profile set cost
  const profileSetSelected = form.selectedProfilePictureSetId !== null;
  const profileSetCost = profileSetSelected ? PROFILE_SET_CREDITS : 0;
  
  // NSFW extra
  const nsfwExtraCost = profileSetSelected && form.nsfwEnabled ? NSFW_EXTRA_CREDITS : 0;
  
  // Total
  const totalCost = baseImagesCost + profileSetCost + nsfwExtraCost;
  const hasEnoughCredits = balance >= totalCost;

  return {
    baseImagesCost,
    profileSetCost,
    nsfwExtraCost,
    totalCost,
    hasEnoughCredits,
    // ... existing exports
  };
}
```

#### Phase 3: Deduct All Credits on Character Create

1. **Update `use-character-creation.ts`**
   - Calculate total cost including base images
   - Deduct all at once via new endpoint or multiple deductions

2. **Update backend `character.create`**
   - Accept optional `includeBaseImageCredits: boolean`
   - Deduct base_images + profile_set + nsfw atomically

#### Phase 4: Enhanced Insufficient Credits Modal

1. **Update `ZeroCreditsModal`**
   - Show detailed cost breakdown
   - Add "Top Up Credits" button → /buy-credits
   - Preserve wizard step in URL/localStorage

```typescript
interface ZeroCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  creditsNeeded: number;
  currentBalance: number;
  breakdown?: {
    baseImages?: number;
    profileSet?: number;
    nsfwExtra?: number;
  };
  returnPath?: string; // e.g., "/wizard/step-finalize"
}
```

2. **Add return URL handling**
   - Store current step before redirect
   - On buy-credits page, show "Return to wizard" after purchase
   - Redirect back to stored step

```typescript
// Before redirecting to buy-credits
localStorage.setItem('wizard_return_step', currentStep.toString());

// On buy-credits success
const returnStep = localStorage.getItem('wizard_return_step');
if (returnStep) {
  router.push(`/wizard/step-${returnStep}`);
  localStorage.removeItem('wizard_return_step');
}
```

### State Preservation

The wizard already persists state via `zustand/persist`:

```typescript
persist(
  immer((set, get) => ({ ... })),
  {
    name: 'character-wizard-storage',
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({
      step: state.step,
      form: state.form,
      baseImages: state.baseImages,
      selectedBaseImageId: state.selectedBaseImageId,
      // ... other persisted fields
    }),
  }
)
```

When user returns from /buy-credits:
1. Wizard state is restored from localStorage
2. User sees the same step they left
3. Base images are preserved
4. Click "Create" to complete

### Edge Cases

1. **Base images expired/lost**
   - Images stored in R2 with long TTL (7+ days)
   - Wizard state includes image URLs
   - If images missing, show regenerate option

2. **User abandons wizard**
   - No credits deducted (intended)
   - Wizard state persists for 30 days (localStorage)
   - User can resume or start fresh

3. **Price change during wizard**
   - Calculate cost at final submission (not at generation)
   - Always use current pricing from `FEATURE_CREDITS`

4. **Multiple browser tabs**
   - Zustand persist handles this via storage events
   - Last write wins for wizard state

### Testing Plan

1. **Unit Tests**
   - `useFinalizeCredits` returns correct totals
   - Credit modal shows correct breakdown
   - Return path preserved correctly

2. **Integration Tests**
   - Full wizard flow with insufficient credits
   - Redirect to buy-credits and back
   - Credits deducted only once at end

3. **E2E Tests**
   - User completes wizard without enough credits
   - User buys credits and returns
   - Character created with correct credit deduction

### Files to Modify

```
apps/web/components/wizard/hooks/use-finalize-credits.ts    # Add base image cost
apps/web/components/wizard/hooks/use-character-creation.ts  # Deduct all credits
apps/web/components/credits/zero-credits-modal.tsx          # Enhanced modal
apps/api/src/modules/character/character.controller.ts      # Add skipCreditDeduction
libs/shared/src/credits/pricing.ts                          # Add helper functions
```

### Success Metrics

- Zero credits deducted on abandoned wizards
- 100% of completed wizards deduct correct total
- No duplicate deductions
- User can always resume from /buy-credits

## Migration Path

1. Deploy backend changes with feature flag
2. Update frontend to use deferred billing
3. Monitor for issues
4. Remove feature flag, make deferred default
