# [EPIC] EP-030: DNA Integration - Base Image Generation

**Related Initiative**: [IN-002: Character DNA Enhancement System](../../initiatives/IN-002-character-dna-enhancement.md)  
**Status**: 📝 Defined  
**Priority**: P1  
**Target Metric**: C-Core Value (Character quality), A-Activation (Better first impression)

---

## Overview

Integrate the Character DNA system into base image generation, enabling the wizard to create more detailed, unique, and consistent base images using the enhanced DNA system.

This epic connects the DNA foundation (EP-028) and prompt builder (EP-029) to the base image generation pipeline.

---

## Business Impact

**Target Metric**: C-Core Value, A-Activation

**Hypothesis**: When base images are generated using comprehensive DNA with auto-generation and variety injection, users get better first-generation results, improving activation and character quality.

**Success Criteria**:
- Base image generation uses DNA system
- Base image variety: 30%+ variety score
- Base image consistency: 90%+ consistency score
- User satisfaction with base images: 4.5+ / 5.0
- First-generation success rate: >95%

---

## Features

### F1: DNA Integration in Base Image Generation

**Goal**: Use EnhancedCharacterDNA for base image generation

- **DNA Building**
  - Build DNA from wizard form data
  - Apply auto-generation (if enabled)
  - Apply populators (if selected)
  - Validate DNA completeness

- **Prompt Building**
  - Use EnhancedPromptBuilder
  - Build prompts from DNA
  - Context: 'base' (focus on physical characteristics)

- **Generation**
  - Generate images using DNA-based prompts
  - Return DNA with images (for consistency tracking)

**Acceptance Criteria**:
- [ ] Base image generation uses DNABuilderService
- [ ] Base image generation uses EnhancedPromptBuilder
- [ ] Prompts built from complete DNA
- [ ] DNA returned with generation results
- [ ] Generation success rate maintained (>95%)

### F2: Auto-Generation Integration

**Goal**: Enable auto-generation in base image generation

- **Auto-Generation Options**
  - Enabled by default
  - User can disable in wizard
  - Variety level selection (low/medium/high)

- **Auto-Generation Flow**
  - User completes basic wizard steps
  - System auto-generates missing characteristics
  - System auto-generates identity DNA
  - DNA used for generation

**Acceptance Criteria**:
- [ ] Auto-generation enabled by default
- [ ] Auto-generation can be disabled
- [ ] Variety level affects generation
- [ ] Auto-generated characteristics are realistic
- [ ] Auto-generated characteristics are consistent

### F3: Populator Integration

**Goal**: Enable populator selection for variety

- **Populator Selection**
  - User can select populators in wizard
  - Populators add variety to base images
  - Multiple populators can be selected

- **Populator Application**
  - Populators applied after user selections
  - Populators add characteristics not in wizard
  - Populators respect compatibility

**Acceptance Criteria**:
- [ ] Populator selection UI in wizard
- [ ] Populators applied to DNA
- [ ] Populators add variety
- [ ] Populators maintain compatibility

### F4: DNA Storage

**Goal**: Store complete DNA with character

- **Storage**
  - Store EnhancedCharacterConfig in CharacterConfig JSONB
  - Store DNA used for generation
  - Enable consistency tracking

- **Retrieval**
  - Load DNA when generating additional images
  - Use stored DNA for consistency

**Acceptance Criteria**:
- [ ] Complete DNA stored with character
- [ ] DNA can be retrieved for consistency
- [ ] Stored DNA used for future generations

---

## Technical Implementation

### Base Image Generation Service Integration

```typescript
@Injectable()
export class BaseImageGenerationService {
  constructor(
    private dnaBuilder: DNABuilderService,
    private promptBuilder: EnhancedPromptBuilder
  ) {}
  
  async generateBaseImages(
    input: BaseImageGenerationInput,
    options: {
      autoGenerate?: boolean;
      varietyLevel?: 'low' | 'medium' | 'high';
      populators?: string[];
    } = {}
  ): Promise<BaseImageGenerationResult> {
    // 1. Convert input to form data
    const formData = this.inputToFormData(input);
    
    // 2. Build complete DNA
    const dna = await this.dnaBuilder.buildDNA(formData, {
      autoGenerate: options.autoGenerate ?? true,
      varietyLevel: options.varietyLevel ?? 'medium',
      populators: options.populators ?? [],
    });
    
    // 3. Build prompt from DNA
    const builtPrompt = this.promptBuilder.buildImagePrompt(dna, 'base');
    
    // 4. Generate images
    const images = await this.generateImages(builtPrompt, input);
    
    // 5. Return images with DNA
    return {
      images,
      dna, // Return DNA for consistency tracking
    };
  }
}
```

---

## Dependencies

- **EP-028**: DNA Foundation & Auto-Generation Engine (must be complete)
- **EP-029**: Enhanced Prompt Builder (must be complete)
- **EP-001**: Character Creation Wizard (must understand wizard flow)

---

## Stories

### ST-030-010: DNA Integration in Base Image Service
- Integrate DNABuilderService into BaseImageGenerationService
- Integrate EnhancedPromptBuilder
- Update generation flow to use DNA
- Test DNA-based generation

### ST-030-020: Auto-Generation Integration
- Add auto-generation options to base image input
- Apply auto-generation in generation flow
- Test auto-generation quality
- Validate variety and consistency

### ST-030-030: Populator Integration
- Add populator selection to wizard
- Apply populators in generation flow
- Test populator variety
- Validate compatibility

### ST-030-040: DNA Storage
- Store complete DNA with character
- Update character creation to store DNA
- Test DNA storage and retrieval
- Validate DNA persistence

### ST-030-050: Base Image Quality Testing
- Test base image variety (target: 30%+)
- Test base image consistency (target: 90%+)
- Test user satisfaction (target: 4.5+ / 5.0)
- Test generation success rate (target: >95%)

---

## Testing

### Unit Tests
- DNA building in base image generation
- Prompt building for base images
- Auto-generation application
- Populator application
- DNA storage

### Integration Tests
- End-to-end base image generation with DNA
- Auto-generation quality
- Populator variety
- DNA consistency across generations

### Quality Metrics
- Base image variety: 30%+ variety score
- Base image consistency: 90%+ consistency score
- User satisfaction: 4.5+ / 5.0
- Generation success: >95%

---

## Documentation

- [Human Description System](../../technical/systems/human-description-system.md)
- [DNA Implementation Plan](../../technical/systems/dna-implementation-plan.md)
- [IN-002: Character DNA Enhancement System](../../initiatives/IN-002-character-dna-enhancement.md)

---

**Last Updated**: 2026-01-XX
