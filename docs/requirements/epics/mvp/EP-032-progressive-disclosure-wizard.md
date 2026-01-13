# [EPIC] EP-032: Progressive Disclosure Wizard

**Related Initiative**: [IN-002: Character DNA Enhancement System](../../initiatives/IN-002-character-dna-enhancement.md)  
**Status**: 📝 Defined  
**Priority**: P1  
**Target Metric**: A-Activation (Better onboarding), C-Core Value (Character quality)

---

## Overview

Implement progressive disclosure in the character creation wizard, enabling users to choose their detail level (basic/enhanced/advanced) while maintaining simple creation for basic users and full control for advanced users.

This epic makes the DNA system accessible to all users without overwhelming basic users with options.

---

## Business Impact

**Target Metric**: A-Activation, C-Core Value

**Hypothesis**: When users can choose their detail level (basic for quick creation, advanced for full control), wizard completion rates improve, and users can create characters that match their needs without being overwhelmed.

**Success Criteria**:
- Basic tier usage: 50%+ users use basic tier
- Enhanced tier usage: 30%+ users use enhanced tier
- Advanced tier usage: 20%+ users use advanced tier
- Wizard completion rate: Maintain or improve current rate (>70%)
- Time to first character: <10 minutes (basic tier)

---

## Features

### F1: Three-Tier Wizard System

**Goal**: Provide three detail levels for character creation

- **Tier 1: Basic (Default)**
  - 5 steps: Style, Appearance, Body, Identity, Generate
  - Auto-generates all fine-grained details
  - Auto-generates identity DNA
  - Target: <2 minutes to complete

- **Tier 2: Enhanced (Optional)**
  - 8 steps: Adds facial details, modifications, identity basics
  - User specifies key details
  - Auto-generates remaining details
  - Target: <5 minutes to complete

- **Tier 3: Advanced (Optional)**
  - 12+ steps: Full control over all characteristics
  - User specifies everything
  - No auto-generation (unless enabled)
  - Target: <15 minutes to complete

**Acceptance Criteria**:
- [ ] Three tiers implemented
- [ ] Tier selection UI
- [ ] Steps shown/hidden based on tier
- [ ] Tier can be upgraded at any time
- [ ] Basic tier: 5 steps, <2 minutes
- [ ] Enhanced tier: 8 steps, <5 minutes
- [ ] Advanced tier: 12+ steps, <15 minutes

### F2: Progressive Disclosure UI

**Goal**: Show/hide steps based on selected tier

- **Step Visibility Logic**
  - Basic tier: Show only basic steps
  - Enhanced tier: Show basic + enhanced steps
  - Advanced tier: Show all steps

- **Tier Upgrade**
  - User can upgrade tier at any time
  - Upgrading shows additional steps
  - Previous selections preserved

- **Step Navigation**
  - Next/Back buttons
  - Progress indicator
  - Step validation

**Acceptance Criteria**:
- [ ] Steps shown/hidden based on tier
- [ ] Tier upgrade functionality
- [ ] Previous selections preserved on upgrade
- [ ] Navigation works correctly
- [ ] Progress indicator accurate

### F3: Auto-Generation Toggle

**Goal**: Allow users to control auto-generation

- **Auto-Generation Options**
  - Enabled by default (basic/enhanced tiers)
  - Can be disabled (advanced tier)
  - Variety level selection (low/medium/high)

- **UI Implementation**
  - Toggle in wizard (advanced mode)
  - Variety level selector
  - Clear explanation of auto-generation

**Acceptance Criteria**:
- [ ] Auto-generation toggle implemented
- [ ] Enabled by default for basic/enhanced
- [ ] Can be disabled in advanced tier
- [ ] Variety level selector working
- [ ] Clear UI explanation

### F4: Populator Selection UI

**Goal**: Enable populator selection for variety

- **Populator Selection**
  - UI for selecting populators
  - Multiple populators can be selected
  - Populator descriptions and previews

- **Populator Application**
  - Populators applied during DNA building
  - Add variety to base images
  - Maintain compatibility

**Acceptance Criteria**:
- [ ] Populator selection UI implemented
- [ ] Multiple populators can be selected
- [ ] Populator descriptions clear
- [ ] Populators applied correctly
- [ ] Variety added appropriately

### F5: Enhanced Form Data Structure

**Goal**: Support progressive disclosure in form data

- **Form Data Structure**
  - Basic fields (always present)
  - Enhanced fields (optional)
  - Advanced fields (optional)
  - Auto-generation options

- **Form Submission**
  - Determine tier from filled fields
  - Build DNA with appropriate options
  - Generate base images

**Acceptance Criteria**:
- [ ] Enhanced form data structure
- [ ] Tier determination from fields
- [ ] DNA building with tier options
- [ ] Form submission works correctly

---

## Technical Implementation

### Wizard State Management

```typescript
interface WizardState {
  tier: 'basic' | 'enhanced' | 'advanced';
  currentStep: number;
  formData: EnhancedCharacterFormData;
  autoGenerateEnabled: boolean; // Default: true
  varietyLevel: 'low' | 'medium' | 'high'; // Default: 'medium'
  populators: string[];
}

function shouldShowStep(step: WizardStep, state: WizardState): boolean {
  if (state.tier === 'basic') {
    return step.tier === 'basic';
  }
  if (state.tier === 'enhanced') {
    return step.tier === 'basic' || step.tier === 'enhanced';
  }
  return true; // Advanced shows all
}

function determineTier(formData: EnhancedCharacterFormData): 'basic' | 'enhanced' | 'advanced' {
  // Check if advanced fields filled
  if (formData.fineFacialFeatures || formData.detailedModifications || formData.identityDNA) {
    return 'advanced';
  }
  
  // Check if enhanced fields filled
  if (formData.facialDetails || formData.simpleModifications || formData.identityBasics) {
    return 'enhanced';
  }
  
  return 'basic';
}
```

### Wizard Submission Flow

```typescript
async function handleWizardSubmit(
  formData: EnhancedCharacterFormData
): Promise<Character> {
  // 1. Determine tier
  const tier = determineTier(formData);
  
  // 2. Build DNA with auto-generation
  const dna = await dnaBuilderService.buildDNA(formData, {
    autoGenerate: formData.autoGenerate ?? true,
    varietyLevel: formData.varietyLevel ?? 'medium',
    populators: formData.populators ?? [],
  });
  
  // 3. Generate base images
  const baseImages = await baseImageGenService.generateBaseImages({
    appearance: formDataToAppearance(formData),
    identity: formDataToIdentity(formData),
    nsfwEnabled: formData.nsfwEnabled,
  }, {
    autoGenerate: formData.autoGenerate ?? true,
    varietyLevel: formData.varietyLevel ?? 'medium',
    populators: formData.populators ?? [],
  });
  
  // 4. Create character with DNA
  const character = await characterService.create({
    name: formData.name,
    config: dnaToConfig(dna),
    baseImageUrl: baseImages.images[0].url,
  });
  
  return character;
}
```

---

## Dependencies

- **EP-028**: DNA Foundation & Auto-Generation Engine (must be complete)
- **EP-029**: Enhanced Prompt Builder (must be complete)
- **EP-030**: DNA Integration - Base Images (must be complete)
- **EP-001**: Character Creation Wizard (extends existing wizard)

---

## Stories

### ST-032-010: Three-Tier Wizard System
- Design tier structure
- Implement tier selection UI
- Implement step visibility logic
- Test tier functionality

### ST-032-020: Basic Tier Implementation
- Implement 5-step basic flow
- Auto-generation enabled by default
- Test basic tier completion
- Validate time to complete (<2 minutes)

### ST-032-030: Enhanced Tier Implementation
- Add enhanced steps (facial details, modifications, identity basics)
- Auto-generation for remaining details
- Test enhanced tier completion
- Validate time to complete (<5 minutes)

### ST-032-040: Advanced Tier Implementation
- Add advanced steps (fine features, detailed modifications, identity DNA)
- Full control over all characteristics
- Test advanced tier completion
- Validate time to complete (<15 minutes)

### ST-032-050: Progressive Disclosure UI
- Implement step show/hide logic
- Implement tier upgrade functionality
- Test progressive disclosure
- Validate user experience

### ST-032-060: Auto-Generation Toggle
- Implement auto-generation toggle
- Implement variety level selector
- Test auto-generation control
- Validate user understanding

### ST-032-070: Populator Selection UI
- Design populator selection UI
- Implement populator selection
- Test populator application
- Validate variety addition

### ST-032-080: Enhanced Form Data Structure
- Update form data structure
- Implement tier determination
- Test form submission
- Validate DNA building

### ST-032-090: Wizard Testing & Optimization
- Test all three tiers
- Test tier upgrades
- Test auto-generation
- Test populator selection
- Validate completion rates
- Optimize user experience

---

## Testing

### Unit Tests
- Tier determination logic
- Step visibility logic
- Tier upgrade functionality
- Auto-generation toggle
- Populator selection
- Form data structure

### Integration Tests
- End-to-end basic tier flow
- End-to-end enhanced tier flow
- End-to-end advanced tier flow
- Tier upgrade flow
- Auto-generation flow
- Populator application

### User Testing
- Basic tier usability
- Enhanced tier usability
- Advanced tier usability
- Tier selection clarity
- Auto-generation understanding
- Completion rates

### Quality Metrics
- Basic tier usage: 50%+
- Enhanced tier usage: 30%+
- Advanced tier usage: 20%+
- Wizard completion: >70%
- Time to first character: <10 minutes (basic)

---

## Documentation

- [Human Description System](../../technical/HUMAN-DESCRIPTION-SYSTEM.md)
- [DNA Implementation Plan](../../technical/DNA-IMPLEMENTATION-PLAN.md)
- [IN-002: Character DNA Enhancement System](../../initiatives/IN-002-character-dna-enhancement.md)

---

**Last Updated**: 2026-01-XX
