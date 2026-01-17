# [EPIC] EP-043: Wizard Deferred Credit System

**Status**: Draft  
**Created**: 2026-01-15  
**Last Updated**: 2026-01-15  
**Initiative**: [IN-009](../../../initiatives/IN-009-wizard-deferred-credits.md)  
**Owner**: Engineering  
**Priority**: P1

---

## Overview

Move all credit deductions from intermediate wizard steps to the final "Create Character" step, providing upfront cost visibility and a clear recovery path when users have insufficient credits.

### Business Value
- **D-Conversion**: +10% wizard completion rate
- **A-Activation**: Reduced friction for new users
- **C-Core Value**: Users create more characters without confusion

### Scope
- Backend: Add optional `skipCreditDeduction` flag to base image generation
- Frontend: Calculate and display total wizard cost at finalize step
- Frontend: Enhanced insufficient credits modal with buy-credits link
- Frontend: State preservation for return-from-buy-credits flow

---

## Phase 1: Problem Statement & MVP Objective

### Problem Statement
Credits are deducted at multiple points during the character creation wizard, causing:
1. Users to "lose" credits on abandoned wizards
2. Confusion when they can't afford the next step
3. No clear recovery path to buy more credits and continue
4. Surprise at costs not visible upfront

### Current State
```
Step: Base Image Generation → 80 credits DEDUCTED
Step: Profile Picture Selection → (user selects set)
Step: Finalize → 120-170 credits DEDUCTED
                 ↑ If user has <120 credits here, they're stuck
```

### Desired State
```
Step: Base Image Generation → NO credits deducted (tracked as pending)
Step: Profile Picture Selection → Cost preview shown
Step: Finalize → Total cost shown (80 + 120 + 50 = 250 max)
              → If insufficient: Modal → Buy Credits → Return → Create
              → ALL credits deducted atomically on success
```

### MVP Objective
**Enable users to complete the entire wizard with a single credit deduction at the final step, with clear cost visibility and recovery path when credits are insufficient.**

### Non-Goals
- Complex credit reservation system
- Backend credit "holds" or "pending charges"
- Refund system for partial completions
- Multi-currency support

---

## Phase 2: Features, Epics & Acceptance Criteria

### Features

#### F1: Skip Credit Deduction on Base Image Generation
Allow the wizard to generate base images without immediate credit deduction.

#### F2: Total Cost Calculation & Display
Calculate and display the total wizard cost at the finalize step.

#### F3: Enhanced Insufficient Credits Modal
Show detailed cost breakdown and clear path to buy credits.

#### F4: Return Path from Buy Credits
Preserve wizard state and return user to same step after credit purchase.

---

### Stories

#### ST-043-001: Backend - Add skipCreditDeduction Flag
**As a** frontend developer  
**I want** an optional flag to skip credit deduction on base image generation  
**So that** credits can be deducted at a later step

**Acceptance Criteria:**
- [ ] AC1: `/characters/generate-base-images` accepts optional `skipCreditDeduction: boolean` in request body
- [ ] AC2: When `skipCreditDeduction=true`, generation proceeds without credit check/deduction
- [ ] AC3: When `skipCreditDeduction=false` or omitted, current behavior preserved (backward compatible)
- [ ] AC4: Response includes `creditsToBeCharged: number` when credits were skipped
- [ ] AC5: Logging indicates "credit deduction skipped" for monitoring

**Story Points**: 2

---

#### ST-043-002: Frontend - Update Base Image Generation to Skip Credits
**As a** wizard user  
**I want** base images to generate without using credits  
**So that** I can see options before committing

**Acceptance Criteria:**
- [ ] AC1: `use-base-image-generation.ts` passes `skipCreditDeduction: true` to API
- [ ] AC2: Wizard store tracks `pendingBaseImageCredits: number`
- [ ] AC3: No credit balance change after base image generation
- [ ] AC4: Error handling preserved (non-credit errors still shown)

**Story Points**: 2

---

#### ST-043-003: Frontend - Calculate Total Wizard Cost
**As a** wizard user  
**I want** to see the total cost at the finalize step  
**So that** I know exactly what I'm paying before creating

**Acceptance Criteria:**
- [ ] AC1: `use-finalize-credits.ts` calculates:
  - Base image cost (80) if images were generated
  - Profile set cost (120) if set selected
  - NSFW extra (50) if NSFW enabled with profile set
- [ ] AC2: Total cost displayed in CreditSummary component
- [ ] AC3: Cost breakdown shows each component
- [ ] AC4: `hasEnoughCredits` checks against total, not partial

**Story Points**: 3

---

#### ST-043-004: Frontend - Enhanced Insufficient Credits Modal
**As a** wizard user with insufficient credits  
**I want** a clear modal explaining what I need and how to get it  
**So that** I can easily complete my character

**Acceptance Criteria:**
- [ ] AC1: Modal shows cost breakdown:
  - Base Images: 80 credits
  - Profile Set: 120 credits (if selected)
  - NSFW Extra: 50 credits (if enabled)
  - Total: X credits
- [ ] AC2: Modal shows current balance vs required
- [ ] AC3: "Top Up Credits" button links to `/buy-credits`
- [ ] AC4: Modal has "Maybe Later" dismiss option
- [ ] AC5: Modal design matches existing brand/styling

**Story Points**: 3

---

#### ST-043-005: Frontend - State Preservation for Credit Purchase Return
**As a** wizard user returning from buying credits  
**I want** to continue from where I left off  
**So that** I don't have to redo my work

**Acceptance Criteria:**
- [ ] AC1: Wizard state persists in localStorage (already works)
- [ ] AC2: When modal opens, current step is preserved
- [ ] AC3: User navigating to `/buy-credits` and returning sees same wizard state
- [ ] AC4: Base images and selections preserved
- [ ] AC5: Clicking "Create" after return works correctly

**Story Points**: 1

---

#### ST-043-006: Frontend - Atomic Credit Deduction on Character Create
**As a** system  
**I want** all credits deducted in one operation  
**So that** partial charges don't occur

**Acceptance Criteria:**
- [ ] AC1: `use-character-creation.ts` calculates total cost including base images
- [ ] AC2: Character creation endpoint deducts total credits atomically
- [ ] AC3: If deduction fails, character is not created
- [ ] AC4: Activity log shows single credit transaction for wizard
- [ ] AC5: Credit balance reflects total deduction after successful creation

**Story Points**: 3

---

#### ST-043-007: Testing - E2E Wizard Credit Flow
**As a** developer  
**I want** comprehensive tests for the new credit flow  
**So that** we don't regress

**Acceptance Criteria:**
- [ ] AC1: Unit tests for `useFinalizeCredits` with all cost combinations
- [ ] AC2: Unit tests for `useCharacterCreation` credit deduction
- [ ] AC3: Integration test: Wizard completion with sufficient credits
- [ ] AC4: Integration test: Wizard with insufficient credits → modal → return
- [ ] AC5: E2E test: Full flow from wizard start to character created

**Story Points**: 3

---

## Phase 3: Architecture & Data Model

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  WizardStore (Zustand + persist)                                │
│  ├── form: CharacterFormData                                    │
│  ├── baseImages: GeneratedImage[]                               │
│  ├── selectedBaseImageId: string | null                         │
│  └── pendingCredits: { baseImages: 80 }  ← NEW                  │
│                                                                  │
│  useFinalizeCredits(balance)                                     │
│  └── Returns: { baseImagesCost, profileSetCost, nsfwExtraCost,  │
│                 totalCost, hasEnoughCredits }                    │
│                                                                  │
│  useCharacterCreation()                                          │
│  └── create() → deductAllCredits() → createCharacter()          │
│                                                                  │
│  ZeroCreditsModal                                                │
│  └── Shows breakdown, links to /buy-credits                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Backend                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  POST /characters/generate-base-images                           │
│  ├── skipCreditDeduction?: boolean                               │
│  └── Returns: { jobId, creditsToBeCharged: 80 }                 │
│                                                                  │
│  POST /characters (create character)                             │
│  ├── includeBaseImageCredits: boolean                            │
│  └── Deducts: baseImages + profileSet + nsfwExtra atomically    │
│                                                                  │
│  CreditManagementService                                         │
│  └── deductCreditsMultiple(userId, charges[])                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Data Model Changes

**No database schema changes required.**

Changes are in:
1. API request/response DTOs
2. Frontend state (Zustand store)
3. Credit calculation logic

### API Contract Changes

#### POST /characters/generate-base-images

**Request (updated):**
```typescript
interface GenerateBaseImagesDto {
  appearance: AppearanceConfig;
  identity: IdentityConfig;
  nsfwEnabled?: boolean;
  // ... existing fields
  skipCreditDeduction?: boolean; // NEW: Skip credit deduction when true
}
```

**Response (updated):**
```typescript
interface GenerateBaseImagesResponse {
  jobId: string;
  allJobIds: string[];
  userId: string;
  status: 'queued';
  message: string;
  // Existing fields (when credits deducted):
  creditsDeducted?: number;
  creditBalance?: number;
  // New fields (when credits skipped):
  creditsToBeCharged?: number; // Credits that will be charged later
  creditSkipped?: boolean;
}
```

---

## Phase 4: UI/UX Screens

### Screen: Finalize Step (Updated)

```
┌─────────────────────────────────────────────────────────────────┐
│                     Final Step                                   │
│               Review & Create Your Character                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [Base Image Preview]                                            │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Profile Picture Set                                       │  │
│  │  [Classic Influencer] [Professional] [Natural Beauty]     │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  ⚡ Enable Adult Content (+50 credits)  [ Toggle ]         │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  💳 Credit Summary                                         │  │
│  │  ──────────────────────────────────────────────────────── │  │
│  │  Base Images (3)          80 credits                       │  │
│  │  Profile Set (8)         120 credits                       │  │
│  │  Adult Content (3)        50 credits                       │  │
│  │  ──────────────────────────────────────────────────────── │  │
│  │  Total                   250 credits                       │  │
│  │                                                            │  │
│  │  Your Balance: 300 credits  ✓                              │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              ✨ Create Character (250 credits)             │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Screen: Insufficient Credits Modal (Updated)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│    ⚠️ Not Enough Credits                                        │
│                                                                  │
│    You need 250 credits but only have 100                       │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Cost Breakdown:                                           │  │
│  │  • Base Images:     80 credits                             │  │
│  │  • Profile Set:    120 credits                             │  │
│  │  • Adult Content:   50 credits                             │  │
│  │  ────────────────────────────                             │  │
│  │  Total Required:   250 credits                             │  │
│  │  Your Balance:     100 credits                             │  │
│  │  Need:             150 credits                             │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  💎 Credit Pack                    From $2.99              │  │
│  │     Top up your credits to continue                        │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │         💳 Top Up Credits                                  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│                    Maybe later                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 5: File Plan & Task Breakdown

### Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `apps/api/src/modules/character/dto/generate-base-images.dto.ts` | Modify | Add `skipCreditDeduction` field |
| `apps/api/src/modules/character/character.controller.ts` | Modify | Handle skipCreditDeduction logic |
| `apps/web/lib/api/character.ts` | Modify | Pass skipCreditDeduction to API |
| `apps/web/components/wizard/hooks/use-base-image-generation.ts` | Modify | Add skipCreditDeduction flag |
| `apps/web/components/wizard/hooks/use-finalize-credits.ts` | Modify | Include base image cost in total |
| `apps/web/components/wizard/hooks/use-character-creation.ts` | Modify | Deduct all credits atomically |
| `apps/web/components/credits/zero-credits-modal.tsx` | Modify | Add cost breakdown and improved UX |
| `apps/web/components/wizard/finalize/credit-summary.tsx` | Modify | Show full breakdown |
| `libs/business/src/store/character-wizard.store.ts` | Modify | (optional) Track pending credits |
| `libs/shared/src/credits/pricing.ts` | Modify | Add helper for wizard total cost |

### Task Breakdown

#### TSK-043-001: Backend - DTO Update
- Add `skipCreditDeduction?: boolean` to GenerateBaseImagesDto
- Add `@IsOptional() @IsBoolean()` decorators
- Estimated: 15 min

#### TSK-043-002: Backend - Controller Logic
- Check `skipCreditDeduction` flag
- Skip credit deduction when true
- Add `creditsToBeCharged` to response
- Estimated: 30 min

#### TSK-043-003: Frontend - API Client Update
- Update `generateBaseImages` function
- Add `skipCreditDeduction` parameter
- Estimated: 15 min

#### TSK-043-004: Frontend - Hook Update
- Modify `use-base-image-generation.ts`
- Pass `skipCreditDeduction: true`
- Estimated: 15 min

#### TSK-043-005: Frontend - Finalize Credits Calculation
- Update `use-finalize-credits.ts`
- Add base image cost to total
- Export detailed breakdown
- Estimated: 30 min

#### TSK-043-006: Frontend - Credit Summary Component
- Update `credit-summary.tsx`
- Show breakdown: base images, profile set, NSFW
- Estimated: 30 min

#### TSK-043-007: Frontend - Enhanced Modal
- Update `zero-credits-modal.tsx`
- Add breakdown prop
- Improve design with cost details
- Estimated: 45 min

#### TSK-043-008: Frontend - Character Creation Update
- Update `use-character-creation.ts`
- Calculate total including base images
- Verify atomic deduction
- Estimated: 30 min

#### TSK-043-009: Testing
- Unit tests for hooks
- Integration tests for full flow
- Estimated: 1 hour

---

## Phase 6: Implementation

### Implementation Order

1. **Backend Changes** (ST-043-001)
   - TSK-043-001: DTO update
   - TSK-043-002: Controller logic

2. **Frontend API Integration** (ST-043-002)
   - TSK-043-003: API client update
   - TSK-043-004: Hook update

3. **Credit Calculation** (ST-043-003)
   - TSK-043-005: Finalize credits calculation
   - TSK-043-006: Credit summary component

4. **Modal Enhancement** (ST-043-004)
   - TSK-043-007: Enhanced modal

5. **Character Creation** (ST-043-006)
   - TSK-043-008: Character creation update

6. **Testing** (ST-043-007)
   - TSK-043-009: All tests

---

## Phase 7-10: Testing, Integration, Deployment, Validation

### Phase 7: Testing Strategy

| Test Type | Coverage | Tool |
|-----------|----------|------|
| Unit Tests | Hooks, calculations | Vitest |
| Integration Tests | API + frontend | Vitest |
| E2E Tests | Full wizard flow | Playwright |

### Phase 8: Integration Notes
- Feature flag not required (backward compatible)
- Can be deployed incrementally

### Phase 9: Deployment
- Deploy backend first (backward compatible)
- Deploy frontend after backend live
- No database migrations needed

### Phase 10: Validation Checklist
- [ ] Wizard completion without credit issues
- [ ] Credits deducted only at final step
- [ ] Modal shows when insufficient credits
- [ ] User can return from buy-credits
- [ ] No regression in existing functionality

---

## Summary

| Item | Value |
|------|-------|
| **Total Stories** | 7 |
| **Total Story Points** | 17 |
| **Estimated Duration** | 2-3 days |
| **Files Modified** | ~10 |
| **Database Changes** | None |
| **Breaking Changes** | None |

---

## References

- [Initiative IN-009](../../../initiatives/IN-009-wizard-deferred-credits.md)
- [Technical Design](../../../technical/WIZARD-DEFERRED-CREDITS.md)
- [Credit Pricing](../../../../libs/shared/src/credits/pricing.ts)
- [Wizard Store](../../../../libs/business/src/store/character-wizard.store.ts)
