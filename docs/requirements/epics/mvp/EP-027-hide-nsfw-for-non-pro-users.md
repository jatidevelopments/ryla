# [EPIC] EP-027: Hide NSFW Toggles for Non-Pro Users (Phase 1)

**Related Initiative**: [IN-003](../initiatives/IN-003-sfw-nsfw-separation.md)  
**Status**: Completed  
**Priority**: P1  
**Target Metric**: D-Conversion (tier upgrades), A-Activation (influencer onboarding)

---

## Overview

**Phase 1** of IN-003: Hide all NSFW/adult content toggles for users without Pro subscription. This makes the product immediately more marketable and influencer-friendly by removing NSFW options from non-Pro users' view.

This is a **quick win** that can be implemented immediately while we plan the full separation (separate tabs, upgrade prompts, etc.) in later phases.

---

## Business Impact

**Target Metric**: D-Conversion, A-Activation

**Hypothesis**: When NSFW options are hidden from non-Pro users, the product becomes:
- More marketable (safe for influencer promotion)
- More "salon-ready" (presentable in professional settings)
- Clear upgrade incentive (NSFW as Pro feature)

**Success Criteria**:
- NSFW toggles completely hidden for Free/Starter users
- No "adult content" visible in wizard, settings, or studio for non-Pro
- Pro tier upgrade inquiries increase (leading indicator)
- Influencer onboarding on Starter tier increases

---

## Current State

NSFW toggles are visible in **3 locations**:

1. **Character Creation Wizard** (`apps/web/components/wizard/`)
   - `StepAdvanced.tsx` - NSFW toggle section
   - `StepFinalize.tsx` - NSFW toggle in finalize step
   - `nsfw-toggle-section.tsx` - Finalize NSFW section
   - `profile-picture-nsfw-toggle.tsx` - Profile picture NSFW toggle

2. **Influencer Settings** (`apps/web/components/influencer-settings/`)
   - `nsfw-toggle-section.tsx` - Settings NSFW toggle

3. **Content Studio** (`apps/web/components/studio/`)
   - `NSFWToggle.tsx` - Studio generation NSFW toggle
   - `StudioPanel.tsx` - Studio panel NSFW toggle

**Current Behavior**:
- All tiers can see and toggle NSFW
- NSFW is gated by character-level `nsfwEnabled` flag
- No subscription tier check for NSFW visibility

---

## Desired State

**For Non-Pro Users (Free/Starter)**:
- NSFW toggles completely hidden (not rendered)
- No "adult content" text visible
- Clean, professional interface
- No upgrade prompts yet (Phase 2)

**For Pro Users (Pro/Unlimited)**:
- NSFW toggles visible and functional (unchanged)
- All existing behavior preserved

---

## Features

### F1: Hide NSFW in Character Creation Wizard

**Locations to Update**:
- `StepAdvanced.tsx` - Hide NSFW toggle section
- `StepFinalize.tsx` - Hide NSFW toggle section
- `nsfw-toggle-section.tsx` - Add tier check, return null if non-Pro
- `profile-picture-nsfw-toggle.tsx` - Add tier check, return null if non-Pro
- `generation-settings.tsx` - Hide NSFW switch

**Implementation**:
- Use `useSubscription()` hook to check `isPro`
- Conditionally render NSFW components only if `isPro === true`
- Remove NSFW-related form fields for non-Pro users

### F2: Hide NSFW in Influencer Settings

**Locations to Update**:
- `nsfw-toggle-section.tsx` - Add tier check, return null if non-Pro
- `InfluencerSettings.tsx` - Conditionally render NSFW section

**Implementation**:
- Use `useSubscription()` hook to check `isPro`
- Hide entire NSFW toggle section for non-Pro users
- Settings page shows clean interface without NSFW option

### F3: Hide NSFW in Content Studio

**Locations to Update**:
- `NSFWToggle.tsx` - Add tier check, return null if non-Pro
- `StudioPanel.tsx` - Hide NSFW toggle in panel
- `ControlButtonsRow.tsx` - Conditionally render NSFWToggle

**Implementation**:
- Use `useSubscription()` hook to check `isPro`
- Hide NSFW toggle button in studio generation bar
- Studio shows only SFW generation options for non-Pro users

---

## Technical Implementation

### Subscription Hook

Already exists: `apps/web/lib/hooks/use-subscription.ts`

```typescript
const { isPro } = useSubscription();
// isPro === true for 'pro' or 'unlimited' tiers
// isPro === false for 'free' or 'starter' tiers
```

### Pattern to Apply

**Before**:
```tsx
<NSFWToggleSection
  enabled={form.nsfwEnabled}
  onToggle={handleToggle}
/>
```

**After**:
```tsx
{isPro && (
  <NSFWToggleSection
    enabled={form.nsfwEnabled}
    onToggle={handleToggle}
  />
)}
```

### Files to Modify

1. **Wizard Components**:
   - `apps/web/components/wizard/steps/StepAdvanced.tsx`
   - `apps/web/components/wizard/steps/StepFinalize.tsx`
   - `apps/web/components/wizard/finalize/nsfw-toggle-section.tsx`
   - `apps/web/components/wizard/components/profile-picture-nsfw-toggle.tsx`
   - `apps/web/components/wizard/components/generation-settings.tsx`

2. **Settings Components**:
   - `apps/web/components/influencer-settings/components/nsfw-toggle-section.tsx`
   - `apps/web/components/influencer-settings/InfluencerSettings.tsx`

3. **Studio Components**:
   - `apps/web/components/studio/generation/components/control-buttons/NSFWToggle.tsx`
   - `apps/web/components/studio/generation/components/ControlButtonsRow.tsx`
   - `apps/web/components/studio/StudioPanel.tsx`

---

## Acceptance Criteria

### AC1: Wizard NSFW Hidden for Non-Pro
- [ ] NSFW toggle in `StepAdvanced.tsx` hidden for Free/Starter users
- [ ] NSFW toggle in `StepFinalize.tsx` hidden for Free/Starter users
- [ ] Profile picture NSFW toggle hidden for Free/Starter users
- [ ] Generation settings NSFW switch hidden for Free/Starter users
- [ ] NSFW toggles visible and functional for Pro/Unlimited users

### AC2: Settings NSFW Hidden for Non-Pro
- [ ] NSFW toggle section hidden in Influencer Settings for Free/Starter users
- [ ] Settings page shows clean interface without NSFW option for non-Pro
- [ ] NSFW toggle visible and functional for Pro/Unlimited users

### AC3: Studio NSFW Hidden for Non-Pro
- [ ] NSFW toggle button hidden in Studio generation bar for Free/Starter users
- [ ] Studio panel NSFW toggle hidden for Free/Starter users
- [ ] Studio shows only SFW generation options for non-Pro users
- [ ] NSFW toggle visible and functional for Pro/Unlimited users

### AC4: No Breaking Changes
- [ ] Existing Pro users retain full NSFW functionality
- [ ] Character-level `nsfwEnabled` flag still works for Pro users
- [ ] No console errors or TypeScript errors
- [ ] All existing tests pass

### AC5: Code Quality
- [ ] Uses `useSubscription()` hook consistently
- [ ] Conditional rendering pattern applied uniformly
- [ ] No duplicate tier checks
- [ ] Code follows existing patterns

---

## Stories

### ST-001: Hide NSFW Toggle in Character Creation Wizard
- Hide NSFW toggles in StepAdvanced, StepFinalize, profile picture toggle
- Add `useSubscription()` checks
- Test with Free, Starter, Pro, Unlimited tiers

### ST-002: Hide NSFW Toggle in Influencer Settings
- Hide NSFW toggle section for non-Pro users
- Clean settings interface
- Test tier-based visibility

### ST-003: Hide NSFW Toggle in Content Studio
- Hide NSFW toggle in studio generation bar
- Hide NSFW toggle in studio panel
- Test studio functionality for all tiers

---

## Testing

### Manual Testing Checklist

**Wizard (Free/Starter)**:
- [ ] Create new character - no NSFW toggles visible
- [ ] Step Advanced - no NSFW section
- [ ] Step Finalize - no NSFW section
- [ ] Profile pictures - no NSFW toggle
- [ ] Generation settings - no NSFW switch

**Wizard (Pro/Unlimited)**:
- [ ] Create new character - NSFW toggles visible
- [ ] All NSFW functionality works as before

**Settings (Free/Starter)**:
- [ ] Open influencer settings - no NSFW toggle section
- [ ] Settings page looks clean

**Settings (Pro/Unlimited)**:
- [ ] Open influencer settings - NSFW toggle visible
- [ ] NSFW toggle works as before

**Studio (Free/Starter)**:
- [ ] Open studio - no NSFW toggle button
- [ ] Studio panel - no NSFW toggle
- [ ] Can generate SFW images normally

**Studio (Pro/Unlimited)**:
- [ ] Open studio - NSFW toggle visible
- [ ] NSFW toggle works as before
- [ ] Can generate NSFW images normally

### Edge Cases
- [ ] User upgrades from Starter to Pro mid-session (NSFW appears)
- [ ] User downgrades from Pro to Starter (NSFW disappears)
- [ ] Loading state while subscription loads (no flicker)
- [ ] Error state in subscription hook (graceful fallback)

---

## Dependencies

- ✅ `useSubscription()` hook exists
- ✅ Subscription tier system working
- ✅ No new dependencies needed

---

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Existing Pro users lose NSFW access | Low | High | Test thoroughly with Pro accounts |
| UI flicker on subscription load | Medium | Low | Use `placeholderData` in hook |
| Breaking existing NSFW functionality | Low | High | Comprehensive testing, feature flags |

---

## Future Phases

**Phase 2** (Future):
- Add upgrade prompts when non-Pro users try to access NSFW
- Create separate SFW/NSFW tabs in Studio
- Add NSFW as Pro feature on pricing page

**Phase 3** (Future):
- Remove NSFW from "Upload a Real Person" feature
- Wording changes ("adult content" → "NSFW")
- Full UI separation

---

## Related Work

- **Initiative**: [IN-003](../initiatives/IN-003-sfw-nsfw-separation.md)
- **Subscription System**: EP-010
- **Content Studio**: EP-005
- **Character Wizard**: EP-001
- **Influencer Settings**: EP-018

---

**Created**: 2026-01-XX  
**Last Updated**: 2026-01-XX
