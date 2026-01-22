# [EPIC] EP-033: Base Character Image Generation

**Status**: Proposed
**Phase**: P2
**Created**: 2026-01-21
**Last Updated**: 2026-01-21


**Related Initiative**: [IN-004](../initiatives/IN-004-wizard-image-generation.md) - Wizard Image Generation & Asset Creation

## Overview

Generate appealing, attractive base character images for one male and one female character to establish the foundation for all subsequent wizard image generation. These base characters will serve as reference templates for ethnicity-specific and feature-specific image generation.

---

## Business Impact

**Target Metric**: A - Activation, C - Core Value

**Hypothesis**: When users see appealing, attractive base character images in the wizard, they will have confidence in the character creation process and complete the wizard flow.

**Success Criteria**:
- 2 high-quality base character images generated (1 male, 1 female)
- Images are appealing, attractive, and professional quality
- Images serve as reference templates for subsequent generation
- Images clearly showcase the character's appearance
- Images optimized and ready for production use

---

## Scope

### In Scope

- Generate 1 base female character image
- Generate 1 base male character image
- Images focus on clear, appealing character appearance
- Professional quality (8K, photorealistic)
- Consistent style and composition
- Image optimization (WebP, < 100KB)

### Out of Scope

- Ethnicity-specific variants (covered in EP-034)
- Body type variations (covered in EP-035)
- Feature-specific images (covered in EP-036)
- Multiple style options (realistic only for base)

---

## Features

### F1: Base Female Character Image

- **Appearance**: Attractive, appealing female character
- **Style**: Realistic, photorealistic
- **Focus**: Clear facial features, appealing appearance, professional quality
- **Composition**: Full body or upper body portrait
- **Clothing**: Appropriate, attractive casual outfit
- **Quality**: 8K hyper-realistic, professional photography quality

### F2: Base Male Character Image

- **Appearance**: Attractive, appealing male character
- **Style**: Realistic, photorealistic
- **Focus**: Clear facial features, appealing appearance, professional quality
- **Composition**: Full body or upper body portrait
- **Clothing**: Appropriate, attractive casual outfit
- **Quality**: 8K hyper-realistic, professional photography quality

### F3: Image Generation Script

- Script to generate base character images using ComfyUI + Z-Image Turbo
- Leverages existing generation infrastructure
- Uses proven prompt engineering patterns
- Automated workflow execution
- Quality validation and optimization

### F4: Image Optimization

- Convert to WebP format
- Compress to < 100KB per image
- Maintain visual quality
- Optimize for web delivery

---

## Technical Implementation

### Generation Approach

**Tools & Technologies:**
- ComfyUI pod with Z-Image Turbo workflow
- Existing generation scripts as reference (`generate-studio-preset-thumbnails.ts`)
- RunPod GPU infrastructure

**Image Specifications:**
- **Dimensions**: 768×960 (4:5 aspect ratio, matches UI)
- **Format**: WebP
- **Quality**: 80% (balance quality and file size)
- **Max File Size**: < 100KB per image

### Prompt Engineering

**Base Female Character Prompt:**
```
A beautiful, attractive woman, 25 years old, caucasian ethnicity, long brown hair, brown eyes, slim athletic body type, wearing casual stylish outfit, professional portrait, 8K hyper-realistic, photorealistic, professional photography, ultra high quality, extremely detailed, sharp focus, clean composition, studio lighting, editorial fashion photography, masterpiece, best quality
```

**Base Male Character Prompt:**
```
A handsome, attractive man, 28 years old, caucasian ethnicity, short brown hair, brown eyes, athletic body type, wearing casual stylish outfit, professional portrait, 8K hyper-realistic, photorealistic, professional photography, ultra high quality, extremely detailed, sharp focus, clean composition, studio lighting, editorial fashion photography, masterpiece, best quality
```

**Negative Prompt:**
```
deformed, blurry, bad anatomy, ugly, low quality, watermark, signature, multiple people, extra limbs, distorted face, bad hands, missing fingers, extra fingers, mutated hands, poorly drawn hands, bad proportions, long neck, duplicate, mutilated, disfigured, bad anatomy, out of frame, extra limbs, bad body, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, mutated, ugly, bad face, bad eyes, text, watermark, signature, no person, empty scene, no character, nude, naked, no clothing, bare skin, exposed
```

### Script Structure

**File**: `scripts/generation/generate-base-characters.ts`

**Key Functions:**
- `generateBaseFemaleCharacter()` - Generate female base character
- `generateBaseMaleCharacter()` - Generate male base character
- `optimizeImage()` - Compress and convert to WebP
- `saveImage()` - Save to appropriate directory

**Output Paths:**
- Female: `apps/web/public/images/base-characters/female-base.webp`
- Male: `apps/web/public/images/base-characters/male-base.webp`

---

## Acceptance Criteria

### AC-1: Base Female Character Image

- [ ] Image generated with appealing, attractive female character
- [ ] Image shows clear facial features and appearance
- [ ] Image is professional quality (8K, photorealistic)
- [ ] Image is optimized (WebP, < 100KB)
- [ ] Image saved to correct path
- [ ] Image ready for use as reference template

### AC-2: Base Male Character Image

- [ ] Image generated with appealing, attractive male character
- [ ] Image shows clear facial features and appearance
- [ ] Image is professional quality (8K, photorealistic)
- [ ] Image is optimized (WebP, < 100KB)
- [ ] Image saved to correct path
- [ ] Image ready for use as reference template

### AC-3: Generation Script

- [ ] Script successfully generates both base character images
- [ ] Script uses ComfyUI + Z-Image Turbo workflow
- [ ] Script handles errors gracefully
- [ ] Script provides progress feedback
- [ ] Script validates image quality before saving

### AC-4: Image Quality

- [ ] Images are appealing and attractive
- [ ] Images have consistent style and composition
- [ ] Images are professional quality
- [ ] Images clearly showcase character appearance
- [ ] Images optimized for web delivery

### AC-5: Documentation

- [ ] Script documented with usage instructions
- [ ] Image paths documented
- [ ] Prompt engineering approach documented
- [ ] Quality standards documented

---

## User Stories

### ST-001: Generate Base Female Character

**As a** developer generating wizard assets  
**I want to** generate an appealing base female character image  
**So that** I can use it as a reference template for ethnicity-specific image generation

**AC**: AC-1, AC-3, AC-4

### ST-002: Generate Base Male Character

**As a** developer generating wizard assets  
**I want to** generate an appealing base male character image  
**So that** I can use it as a reference template for ethnicity-specific image generation

**AC**: AC-2, AC-3, AC-4

---

## Dependencies

- **ComfyUI Pod**: Requires running ComfyUI pod with Z-Image Turbo workflow
- **RunPod Infrastructure**: GPU compute resources
- **Existing Scripts**: Reference `generate-studio-preset-thumbnails.ts` for patterns
- **Image Optimization Tools**: Pillow/PIL for compression

---

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation Strategy |
|------|------------|--------|-------------------|
| Image quality inconsistent | Medium | High | Quality review process, iterative refinement, use proven prompts |
| Generation fails | Low | Medium | Error handling, retry logic, fallback prompts |
| Images not appealing | Medium | High | Design team review, iterative refinement, multiple attempts |

---

## Related Work

### Epics

| Epic | Name | Status | Link |
|------|------|--------|------|
| EP-034 | Ethnicity Image Generation | Not Started | `EP-034-ethnicity-image-generation.md` |
| EP-035 | Body Type Image Generation | Not Started | `EP-035-body-type-image-generation.md` |
| EP-036 | Ethnicity-Specific Feature Images | Not Started | `EP-036-ethnicity-specific-features.md` |

### Dependencies

- **Blocks**: EP-034 (needs base characters as reference)
- **Blocked By**: None
- **Related Initiative**: IN-004 (Wizard Image Generation & Asset Creation)

---

## Definition of Done

- [ ] Base female character image generated and optimized
- [ ] Base male character image generated and optimized
- [ ] Generation script created and tested
- [ ] Images reviewed and approved by design team
- [ ] Images saved to correct paths
- [ ] Documentation updated
- [ ] Ready to use as reference for EP-034

---

**Created**: 2026-01-XX  
**Status**: Not Started  
**Priority**: P1
