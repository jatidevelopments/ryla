# [EPIC] EP-042: Wizard Single Selection & Layout Optimization

**Status**: 📝 Defined  
**Priority**: P1  
**Target Metric**: A-Activation (Improved UX), C-Core Value (Better character creation experience)

---

## Overview

Implement single-selection behavior per step in the preset wizard and optimize layout for image-based options to show 2-3 items per row with larger, more prominent cards.

This epic improves the wizard UX by:
- Simplifying selection (one option per step)
- Making image-based options more visible and easier to select
- Improving visual hierarchy with larger cards

---

## Related Work

**Related Epics**:
- [EP-001](./EP-001-influencer-wizard.md) - AI Influencer Creation Wizard (main wizard epic)
- [EP-032](./EP-032-progressive-disclosure-wizard.md) - Progressive Disclosure Wizard
- [EP-033](./EP-033-base-character-image-generation.md) - Base Character Image Generation
- [EP-034](./EP-034-ethnicity-image-generation.md) - Ethnicity Image Generation
- [EP-035](./EP-035-body-type-image-generation.md) - Body Type Image Generation
- [EP-036](./EP-036-ethnicity-specific-feature-images.md) - Ethnicity-Specific Feature Images

---

## Business Impact

**Target Metric**: A-Activation, C-Core Value

**Hypothesis**: When users can only select one option per step and see larger, more prominent image cards, they will make faster decisions, reduce confusion, and have a better character creation experience.

**Success Criteria**:
- Single selection enforced per step
- Image-based options display 2-3 items per row (max)
- Cards are larger and more prominent
- Wizard completion rate: Maintain or improve current rate (>70%)
- Time to complete wizard: <10 minutes

---

## Features

### F1: Single Selection Per Step

**Goal**: Enforce that only one option can be selected per step across all sections

**Behavior**:
- When a user selects an option in a step, all other options in that step are cleared
- Applies to all wizard steps with multiple sections:
  - Step 2 (General): Ethnicity, Age Range, Skin Color
  - Step 3 (Face): Eye Color, Face Shape
  - Step 4 (Hair): Hair Style, Hair Color
  - Step 5 (Body): Body Type, Ass Size, Breast Size, Breast Type
  - Step 6 (Skin Features): Freckles, Scars, Beauty Marks
  - Step 7 (Body Modifications): Piercings, Tattoos

**Acceptance Criteria**:
- [ ] Selecting an option in a step clears other options in that step
- [ ] Only one option can be selected per step at any time
- [ ] Selection state is visually clear
- [ ] Works across all wizard steps

### F2: Optimized Layout for Image-Based Options

**Goal**: Display image-based options in 2-3 columns max with larger cards

**Layout Rules**:
- Maximum 2-3 items per row depending on total count
- Cards are larger and more prominent
- Responsive: 2 columns on mobile, 2-3 columns on desktop
- Applies to all steps with background images:
  - Step 1 (Style): Gender selection (has background images)
  - Step 2 (General): Ethnicity, Age Range, Skin Color
  - Step 3 (Face): Eye Color, Face Shape
  - Step 4 (Hair): Hair Style, Hair Color
  - Step 5 (Body): Body Type, Ass Size, Breast Size, Breast Type
  - Step 6 (Skin Features): Freckles, Scars, Beauty Marks
  - Step 7 (Body Modifications): Piercings, Tattoos

**Acceptance Criteria**:
- [ ] Image-based options display max 2-3 items per row
- [ ] Cards are larger and more prominent
- [ ] Layout is responsive (2 cols mobile, 2-3 cols desktop)
- [ ] Visual hierarchy is improved
- [ ] All image-based steps updated

---

## Technical Implementation

### Files to Modify

**Wizard Step Components**:
- `apps/web/components/wizard/steps/StepStyle.tsx` - Gender & Style selection
- `apps/web/components/wizard/steps/StepGeneral.tsx` - Ethnicity, Age, Skin Color
- `apps/web/components/wizard/steps/StepFace.tsx` - Eye Color, Face Shape
- `apps/web/components/wizard/steps/StepHair.tsx` - Hair Style, Hair Color
- `apps/web/components/wizard/steps/StepBody.tsx` - Body Type, Ass Size, Breast Size, Breast Type
- `apps/web/components/wizard/steps/StepSkinFeatures.tsx` - Freckles, Scars, Beauty Marks
- `apps/web/components/wizard/steps/StepBodyModifications.tsx` - Piercings, Tattoos

**Shared Components** (if needed):
- `apps/web/components/wizard/WizardImageCard.tsx` - Image card component
- `apps/web/components/wizard/WizardOptionCard.tsx` - Option card component

### Implementation Details

**Single Selection Logic**:
- Create helper function to clear other fields in a step when one is selected
- Update `onSelect` handlers to clear related fields
- Maintain selection state in Zustand store

**Layout Updates**:
- Update grid classes from `grid-cols-4 lg:grid-cols-5` to `grid-cols-2 md:grid-cols-2 lg:grid-cols-3` (max 3)
- Adjust gap spacing for larger cards
- Ensure cards scale appropriately

---

## Definition of Done

- [ ] Single selection enforced per step
- [ ] Layout updated to 2-3 columns max for image-based options
- [ ] Cards are larger and more prominent
- [ ] All wizard steps updated
- [ ] Responsive design maintained
- [ ] Visual hierarchy improved
- [ ] No regressions in wizard functionality
- [ ] Code reviewed and merged

---

## Notes

- This epic focuses on UX improvements to the existing wizard
- Does not change wizard flow or add new features
- Maintains backward compatibility with existing character creation logic
