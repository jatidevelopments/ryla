# Refactoring Priority Plan

> **Created:** January 2026  
> **Status:** In Progress

## Files Requiring Refactoring (> 200 lines)

### 🔴 High Priority (Active Files)

#### 1. `app/studio/hooks/useStudioHandlers.ts` - **375 lines**
**Status:** 🔄 Needs refactoring  
**Issues:**
- Multiple handler responsibilities in one hook
- Could be split by concern (image actions, generation actions, upload actions)

**Proposed Structure:**
```
app/studio/hooks/
├── useStudioHandlers.ts (main orchestrator, ~100 lines)
├── useImageActions.ts (like, delete, download, retry)
├── useGenerationActions.ts (handleGenerate)
└── useUploadActions.ts (handleUploadImage)
```

**Target:** 375 → ~150 lines (60% reduction)

---

#### 2. `app/influencer/[id]/page.tsx` - **369 lines**
**Status:** 🔄 Needs refactoring  
**Issues:**
- Complex state management
- Multiple useEffect hooks
- Image loading logic mixed with UI
- Large component with tabs

**Proposed Structure:**
```
app/influencer/[id]/
├── page.tsx (~100 lines - orchestration)
├── components/
│   ├── InfluencerTabs.tsx
│   ├── GalleryTab.tsx
│   ├── PostsTab.tsx
│   └── LikedTab.tsx
├── hooks/
│   ├── useInfluencerImages.ts (image loading logic)
│   └── useInfluencerData.ts (data fetching)
└── utils/
    └── image-conversion.ts (ApiImageRow → Post conversion)
```

**Target:** 369 → ~150 lines (59% reduction)

---

#### 3. `app/buy-credits/page.tsx` - **289 lines**
**Status:** 🟡 Medium priority  
**Issues:**
- Confirmation modal inline
- Purchase logic mixed with UI

**Proposed Structure:**
```
app/buy-credits/
├── page.tsx (~150 lines)
├── components/
│   ├── CreditPackagesGrid.tsx
│   ├── PurchaseConfirmationModal.tsx
│   └── SubscriptionUpsell.tsx
└── hooks/
    └── useCreditPurchase.ts (purchase logic)
```

**Target:** 289 → ~150 lines (48% reduction)

---

#### 4. `app/settings/components/delete-account-dialog.tsx` - **297 lines**
**Status:** 🟡 Medium priority  
**Issues:**
- Multi-step dialog with all steps in one file
- Could extract step components

**Proposed Structure:**
```
app/settings/components/delete-account-dialog/
├── DeleteAccountDialog.tsx (~100 lines - orchestrator)
├── components/
│   ├── RetentionOfferStep.tsx
│   ├── ReasonSelectionStep.tsx
│   ├── FeedbackStep.tsx
│   └── ConfirmationStep.tsx
├── hooks/
│   └── useDeleteAccountFlow.ts (step management)
└── constants.ts (REASON_OPTIONS)
```

**Target:** 297 → ~150 lines (50% reduction)

---

### 🟡 Medium Priority

#### 5. `app/auth/hooks/use-auth-flow.ts` - **247 lines**
**Status:** 🟡 Review if growing  
**Issues:**
- Could potentially split if it grows

**Action:** Monitor - refactor if exceeds 300 lines

---

### ⚠️ Deprecated/Unused

#### 6. `app/influencer/[id]/studio/page.tsx` - **1,290 lines**
**Status:** ⚠️ Deprecated/unused  
**Action:** Skip refactoring (marked as deprecated in REFACTORING-STATUS.md)

---

## Refactoring Order

1. ✅ **useStudioHandlers.ts** - High impact, used frequently
2. ✅ **influencer/[id]/page.tsx** - User-facing page, improves UX
3. ✅ **buy-credits/page.tsx** - Payment flow, important
4. ✅ **delete-account-dialog.tsx** - Settings component

---

## Progress Tracking

| File | Before | After | Status | Notes |
|------|--------|-------|--------|-------|
| useStudioHandlers.ts | 375 | 128 | ✅ **COMPLETE** | Split into useImageActions, useGenerationActions, useUploadActions (66% reduction) |
| influencer/[id]/page.tsx | 369 | 82 | ✅ **COMPLETE** | Extracted hooks & components (78% reduction) |
| buy-credits/page.tsx | 289 | 160 | ✅ **COMPLETE** | Extracted PurchaseConfirmationModal, CreditPackagesGrid, SubscriptionUpsell components and useCreditPurchase hook (45% reduction) |
| delete-account-dialog.tsx | 297 | 141 | ✅ **COMPLETE** | Extracted RetentionOfferStep, ReasonSelectionStep, FeedbackStep, ConfirmationStep components and useDeleteAccountFlow hook (53% reduction) |

---

## Next Steps

1. Start with `useStudioHandlers.ts` - highest priority
2. Follow REFACTORING-REVIEW-PROCESS.md checklist
3. Update this document as work progresses
4. Update REFACTORING-STATUS.md when complete

