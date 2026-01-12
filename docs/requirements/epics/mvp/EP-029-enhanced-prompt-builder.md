# [EPIC] EP-029: Enhanced Prompt Builder

**Related Initiative**: [IN-002: Character DNA Enhancement System](../../initiatives/IN-002-character-dna-enhancement.md)  
**Status**: 📝 Defined  
**Priority**: P1  
**Target Metric**: C-Core Value (Character quality and consistency)

---

## Overview

Build an enhanced prompt builder that intelligently constructs prompts from EnhancedCharacterDNA, using priority-based building and smart truncation to create optimal prompts for image generation while staying within token limits.

This epic enables all generation types (base images, studio, profile sets) to use the same DNA system for consistent, high-quality results.

---

## Business Impact

**Target Metric**: C-Core Value

**Hypothesis**: When prompts are built from comprehensive DNA with priority-based ordering and smart truncation, image generation quality improves while maintaining consistency across all generation types.

**Success Criteria**:
- Prompt quality: 4.5+ / 5.0 (manual review)
- Prompt token usage: <75 tokens (within limits)
- Character consistency: 90%+ consistency score
- Generation success rate: >95% (maintains current)

---

## Features

### F1: Priority-Based Prompt Building

**Goal**: Build prompts with most important characteristics first

**Priority Order**:
1. Core Identity (age, ethnicity, gender) - Always included
2. Distinctive Features (hair, eyes) - Always included
3. Signature Elements (identity DNA signature look/style) - High priority
4. Facial Features (detailed facial characteristics) - Medium priority
5. Body Type - Medium priority
6. Visible Modifications (tattoos, piercings) - Low priority (if visible)
7. Brand Aesthetic (visual style, color palette) - Low priority (studio/profile only)
8. Fine Details (nails, hands) - Very low priority (only if space allows)

**Acceptance Criteria**:
- [ ] Priority order implemented correctly
- [ ] Most important characteristics always included
- [ ] Less important characteristics included when space allows

### F2: Context-Aware Prompt Building

**Goal**: Build prompts differently for base images, studio, and profile sets

- **Base Images**: Focus on physical characteristics, basic identity
- **Studio**: Include brand aesthetic, visual style, signature elements
- **Profile Sets**: Maintain consistency across positions, include signature elements

**Acceptance Criteria**:
- [ ] Base image prompts focus on physical characteristics
- [ ] Studio prompts include brand aesthetic and visual style
- [ ] Profile set prompts maintain consistency
- [ ] Context-specific elements included appropriately

### F3: Smart Truncation

**Goal**: Intelligently truncate prompts when token limit is exceeded

- **Strategy**: Remove least important parts first
- **Minimum**: Always keep core identity + distinctive features
- **Token Limit**: 75 tokens max
- **Fallback**: If still too long, truncate from end

**Acceptance Criteria**:
- [ ] Smart truncation removes least important parts first
- [ ] Core identity always preserved
- [ ] Distinctive features always preserved
- [ ] Truncated prompts still generate quality images

### F4: Content Prompt Building

**Goal**: Build prompts for content generation from IdentityDNA

- **Uses**: Archetype, content niche, communication tone, brand aesthetic
- **Purpose**: Generate content (captions, descriptions) that matches character's brand

**Acceptance Criteria**:
- [ ] Content prompts built from identity DNA
- [ ] Prompts capture character's brand identity
- [ ] Prompts suitable for content generation

---

## Technical Implementation

### Prompt Builder Service

```typescript
@Injectable()
export class EnhancedPromptBuilder {
  private readonly MAX_TOKENS = 75;
  
  /**
   * Build prompt for image generation
   */
  buildImagePrompt(
    dna: EnhancedCharacterDNA,
    context: 'base' | 'studio' | 'profile'
  ): BuiltPrompt {
    const parts: string[] = [];
    
    // 1. Core identity (always)
    parts.push(this.buildCoreIdentity(dna));
    
    // 2. Distinctive features (always)
    parts.push(dna.hair);
    parts.push(this.buildEyeDescription(dna));
    
    // 3. Signature elements (high priority)
    if (dna.identity?.uniqueFeatures?.signatureLook) {
      parts.push(dna.identity.uniqueFeatures.signatureLook);
    }
    
    // 4. Facial features (medium priority)
    if (dna.lips?.shape) {
      parts.push(this.buildLipDescription(dna.lips));
    }
    
    // 5. Body type (medium priority)
    if (dna.bodyType) {
      parts.push(dna.bodyType);
    }
    
    // 6. Visible modifications (low priority)
    if (dna.tattoos && dna.tattoos.length > 0) {
      const visible = dna.tattoos.filter(t => 
        t.visibility === 'always-visible' || t.visibility === 'sometimes-visible'
      );
      if (visible.length > 0) {
        parts.push(this.buildTattooDescription(visible[0]));
      }
    }
    
    // 7. Brand aesthetic (context-specific)
    if (context !== 'base' && dna.identity?.brandAesthetic) {
      parts.push(this.buildBrandAesthetic(dna.identity.brandAesthetic));
    }
    
    // 8. Fine details (very low priority, only if space)
    const remainingTokens = this.MAX_TOKENS - this.countTokens(parts.join(', '));
    if (remainingTokens > 10 && dna.hands?.nails) {
      parts.push(this.buildNailDescription(dna.hands.nails));
    }
    
    // Build and truncate if needed
    const prompt = parts.join(', ');
    const finalPrompt = this.smartTruncate(prompt, this.MAX_TOKENS);
    
    return {
      prompt: finalPrompt,
      negativePrompt: this.buildNegativePrompt(dna, context),
      recommended: {
        workflow: this.getRecommendedWorkflow(dna, context),
        aspectRatio: this.getRecommendedAspectRatio(context),
      },
    };
  }
  
  /**
   * Build content prompt from identity DNA
   */
  buildContentPrompt(identity: IdentityDNA): string {
    const parts: string[] = [];
    
    if (identity.archetype) {
      parts.push(`${identity.archetype} archetype`);
    }
    
    if (identity.contentTheme?.primaryNiche) {
      parts.push(`${identity.contentTheme.primaryNiche} content`);
    }
    
    if (identity.communicationStyle?.tone) {
      parts.push(`${identity.communicationStyle.tone} tone`);
    }
    
    if (identity.brandAesthetic?.visualStyle) {
      parts.push(`${identity.brandAesthetic.visualStyle} aesthetic`);
    }
    
    return parts.join(', ');
  }
  
  private smartTruncate(prompt: string, maxTokens: number): string {
    if (this.countTokens(prompt) <= maxTokens) {
      return prompt;
    }
    
    const parts = prompt.split(', ');
    let truncated = prompt;
    
    while (this.countTokens(truncated) > maxTokens && parts.length > 3) {
      parts.pop(); // Remove least important part
      truncated = parts.join(', ');
    }
    
    return truncated;
  }
}
```

---

## Dependencies

- **EP-028**: DNA Foundation & Auto-Generation Engine (must have DNA structures)

---

## Stories

### ST-029-010: Priority-Based Prompt Building
- Implement priority order logic
- Build core identity section
- Build distinctive features section
- Build signature elements section
- Build facial features section
- Test priority ordering

### ST-029-020: Context-Aware Prompt Building
- Implement base image prompt building
- Implement studio prompt building
- Implement profile set prompt building
- Test context-specific elements

### ST-029-030: Smart Truncation
- Implement token counting
- Implement smart truncation logic
- Test truncation quality
- Ensure core elements always preserved

### ST-029-040: Content Prompt Building
- Implement identityDNA to content prompt conversion
- Test content prompt quality
- Validate prompts for content generation

### ST-029-050: Negative Prompt Building
- Build negative prompts from DNA
- Context-aware negative prompts
- Test negative prompt effectiveness

### ST-029-060: Prompt Quality Testing
- Test prompt quality (manual review)
- Test token usage (stay within limits)
- Test generation success rate
- Test character consistency

---

## Testing

### Unit Tests
- Priority ordering logic
- Context-aware building
- Smart truncation
- Token counting
- Content prompt building

### Integration Tests
- End-to-end prompt building from DNA
- Prompt quality validation
- Generation success rate
- Character consistency

### Quality Metrics
- Prompt quality: 4.5+ / 5.0
- Token usage: <75 tokens
- Generation success: >95%
- Consistency score: >90%

---

## Documentation

- [Human Description System](../../technical/HUMAN-DESCRIPTION-SYSTEM.md)
- [DNA Implementation Plan](../../technical/DNA-IMPLEMENTATION-PLAN.md)
- [IN-002: Character DNA Enhancement System](../../initiatives/IN-002-character-dna-enhancement.md)

---

**Last Updated**: 2026-01-XX
