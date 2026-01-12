# [EPIC] EP-031: DNA Integration - Studio & Profile Sets

**Related Initiative**: [IN-002: Character DNA Enhancement System](../../initiatives/IN-002-character-dna-enhancement.md)  
**Status**: 📝 Defined  
**Priority**: P1  
**Target Metric**: C-Core Value (Character consistency and quality)

---

## Overview

Integrate the Character DNA system into studio image generation and profile picture set generation, ensuring consistent character appearance and brand identity across all generation types.

This epic extends DNA integration beyond base images to all generation workflows.

---

## Business Impact

**Target Metric**: C-Core Value

**Hypothesis**: When studio and profile set generation use the same DNA system as base images, character consistency improves dramatically, and brand identity is maintained across all content.

**Success Criteria**:
- Studio generation uses DNA system
- Profile set generation uses DNA system
- Character consistency: 90%+ consistency score across all generation types
- Brand identity consistency: 85%+ consistency score
- Generation success rate: >95% (maintains current)

---

## Features

### F1: Studio Generation DNA Integration

**Goal**: Use EnhancedCharacterDNA for studio image generation

- **DNA Loading**
  - Load character DNA from stored config
  - Use stored DNA (don't regenerate)
  - Maintain consistency with base images

- **Prompt Enhancement**
  - Enhance user prompts with DNA
  - Add signature elements from identity DNA
  - Add brand aesthetic for studio context
  - Merge user prompt with DNA prompt

- **Generation**
  - Generate images using enhanced prompts
  - Maintain character consistency
  - Apply brand identity

**Acceptance Criteria**:
- [ ] Studio generation loads stored DNA
- [ ] User prompts enhanced with DNA
- [ ] Signature elements included
- [ ] Brand aesthetic applied
- [ ] Character consistency maintained

### F2: Profile Set Generation DNA Integration

**Goal**: Use EnhancedCharacterDNA for profile picture set generation

- **DNA Loading**
  - Load character DNA from stored config
  - Use stored DNA for all positions
  - Maintain consistency across positions

- **Position-Specific Prompts**
  - Build prompts for each position
  - Include position-specific requirements
  - Maintain DNA consistency
  - Apply signature elements

- **Generation**
  - Generate all positions with DNA
  - Maintain consistency across positions
  - Apply brand identity

**Acceptance Criteria**:
- [ ] Profile set generation loads stored DNA
- [ ] All positions use same DNA
- [ ] Position-specific prompts built correctly
- [ ] Consistency maintained across positions
- [ ] Brand identity applied

### F3: Identity DNA Integration

**Goal**: Use IdentityDNA for brand-consistent generation

- **Signature Elements**
  - Include signature look in prompts
  - Include signature style in prompts
  - Maintain signature elements across generations

- **Brand Aesthetic**
  - Apply visual style to studio/profile
  - Apply color palette
  - Apply photo style
  - Apply editing style

- **Content Identity**
  - Use content niche for context
  - Apply communication style
  - Maintain brand consistency

**Acceptance Criteria**:
- [ ] Signature elements included in prompts
- [ ] Brand aesthetic applied correctly
- [ ] Content identity maintained
- [ ] Brand consistency: 85%+ consistency score

---

## Technical Implementation

### Studio Generation Service Integration

```typescript
@Injectable()
export class StudioGenerationService {
  constructor(
    private dnaBuilder: DNABuilderService,
    private promptBuilder: EnhancedPromptBuilder
  ) {}
  
  async generateStudioImage(
    characterId: string,
    prompt: string,
    options: StudioGenerationOptions
  ): Promise<StudioImageResult> {
    // 1. Load character DNA
    const character = await this.characterRepo.findById(characterId);
    const dna = await this.dnaBuilder.buildDNA(
      character.config,
      { autoGenerate: false } // Use stored DNA
    );
    
    // 2. Enhance user prompt with DNA
    const enhancedPrompt = this.enhanceUserPrompt(prompt, dna);
    
    // 3. Build DNA prompt
    const builtPrompt = this.promptBuilder.buildImagePrompt(dna, 'studio');
    
    // 4. Merge prompts
    const finalPrompt = `${enhancedPrompt}, ${builtPrompt.prompt}`;
    
    // 5. Generate image
    return await this.generateImage(finalPrompt, options);
  }
  
  private enhanceUserPrompt(
    userPrompt: string,
    dna: EnhancedCharacterDNA
  ): string {
    const enhancements: string[] = [];
    
    // Add signature look
    if (dna.identity?.uniqueFeatures?.signatureLook) {
      enhancements.push(dna.identity.uniqueFeatures.signatureLook);
    }
    
    // Add brand aesthetic
    if (dna.identity?.brandAesthetic?.visualStyle) {
      enhancements.push(`${dna.identity.brandAesthetic.visualStyle} style`);
    }
    
    return enhancements.length > 0
      ? `${userPrompt}, ${enhancements.join(', ')}`
      : userPrompt;
  }
}
```

### Profile Set Generation Service Integration

```typescript
@Injectable()
export class ProfilePictureSetService {
  constructor(
    private dnaBuilder: DNABuilderService,
    private promptBuilder: EnhancedPromptBuilder
  ) {}
  
  async generateProfilePictureSet(
    characterId: string,
    setType: ProfilePictureSetType
  ): Promise<ProfilePictureSetResult> {
    // 1. Load character DNA
    const character = await this.characterRepo.findById(characterId);
    const dna = await this.dnaBuilder.buildDNA(
      character.config,
      { autoGenerate: false }
    );
    
    // 2. Get positions
    const positions = this.getPositionsForSet(setType);
    
    // 3. Generate each position with DNA
    const images = await Promise.all(
      positions.map(position => this.generatePositionImage(dna, position))
    );
    
    return {
      images,
      dna, // Store DNA for consistency
    };
  }
  
  private async generatePositionImage(
    dna: EnhancedCharacterDNA,
    position: ProfilePicturePosition
  ): Promise<ProfilePictureImage> {
    // Build base prompt from DNA
    const basePrompt = this.promptBuilder.buildImagePrompt(dna, 'profile');
    
    // Add position-specific elements
    const positionPrompt = this.getPositionPrompt(position, dna);
    
    const finalPrompt = `${basePrompt.prompt}, ${positionPrompt}`;
    
    return await this.generateImage(finalPrompt, {
      aspectRatio: '1:1',
      workflow: basePrompt.recommended.workflow,
    });
  }
}
```

---

## Dependencies

- **EP-028**: DNA Foundation & Auto-Generation Engine (must be complete)
- **EP-029**: Enhanced Prompt Builder (must be complete)
- **EP-030**: DNA Integration - Base Images (should be complete first)
- **EP-005**: Content Studio (must understand studio generation)
- **EP-001**: Character Creation Wizard (profile sets generated after creation)

---

## Stories

### ST-031-010: Studio Generation DNA Integration
- Integrate DNABuilderService into StudioGenerationService
- Load stored DNA for studio generation
- Enhance user prompts with DNA
- Test studio generation with DNA

### ST-031-020: Studio Prompt Enhancement
- Implement user prompt enhancement
- Add signature elements to prompts
- Add brand aesthetic to prompts
- Test prompt enhancement quality

### ST-031-030: Profile Set Generation DNA Integration
- Integrate DNABuilderService into ProfilePictureSetService
- Load stored DNA for profile sets
- Generate all positions with same DNA
- Test profile set generation with DNA

### ST-031-040: Position-Specific Prompt Building
- Build position-specific prompts
- Maintain DNA consistency across positions
- Test position prompt quality
- Validate consistency across positions

### ST-031-050: Identity DNA Integration
- Integrate signature elements into prompts
- Apply brand aesthetic to generation
- Apply content identity
- Test brand consistency

### ST-031-060: Consistency Testing
- Test character consistency across generation types
- Test brand identity consistency
- Test generation success rate
- Validate quality metrics

---

## Testing

### Unit Tests
- DNA loading for studio/profile
- Prompt enhancement logic
- Position-specific prompt building
- Identity DNA integration

### Integration Tests
- End-to-end studio generation with DNA
- End-to-end profile set generation with DNA
- Consistency across generation types
- Brand identity consistency

### Quality Metrics
- Character consistency: 90%+ consistency score
- Brand identity consistency: 85%+ consistency score
- Generation success: >95%
- User satisfaction: 4.5+ / 5.0

---

## Documentation

- [Human Description System](../../technical/HUMAN-DESCRIPTION-SYSTEM.md)
- [DNA Implementation Plan](../../technical/DNA-IMPLEMENTATION-PLAN.md)
- [IN-002: Character DNA Enhancement System](../../initiatives/IN-002-character-dna-enhancement.md)

---

**Last Updated**: 2026-01-XX
