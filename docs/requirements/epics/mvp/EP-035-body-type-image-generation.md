# [EPIC] EP-035: Body Type Image Generation

**Related Initiative**: [IN-004](../initiatives/IN-004-wizard-image-generation.md) - Wizard Image Generation & Asset Creation

## Overview

Generate appealing, attractive body type images for all body type options (4 female + 4 male = 8 total images). These images will clearly showcase each body type's distinct characteristics while maintaining the appealing, attractive character appearance.

---

## Business Impact

**Target Metric**: A - Activation, C - Core Value

**Hypothesis**: When users can visually preview body type options with appealing, attractive images that clearly show body type differences, they will have confidence in their selection and complete the wizard flow.

**Success Criteria**:
- 8 body type images generated (4 female + 4 male)
- Images clearly showcase each body type's distinct characteristics
- Images are appealing, attractive, and professional quality
- Images maintain consistency with base characters from EP-033
- All images optimized and ready for production use

---

## Scope

### In Scope

- Generate body type images for all options:
  - **Female**: Slim, Athletic, Curvy, Voluptuous
  - **Male**: Slim, Athletic, Muscular, Chubby
- Images focus on clear body type differentiation
- Professional quality (8K, photorealistic)
- Consistent style and composition
- Image optimization (WebP, < 100KB)

### Out of Scope

- Ethnicity-specific body type variants (use base ethnicity from EP-034)
- Feature-specific images (hair, eyes, etc.) (covered in EP-036)
- Multiple style options (realistic only)

---

## Features

### F1: Female Body Type Images (4 images)

- **Body Types**: Slim, Athletic, Curvy, Voluptuous
- **Focus**: Clear body type differentiation, appealing appearance
- **Style**: Realistic, photorealistic
- **Composition**: Full body view to showcase body type
- **Quality**: 8K hyper-realistic, professional photography quality

### F2: Male Body Type Images (4 images)

- **Body Types**: Slim, Athletic, Muscular, Chubby
- **Focus**: Clear body type differentiation, appealing appearance
- **Style**: Realistic, photorealistic
- **Composition**: Full body view to showcase body type
- **Quality**: 8K hyper-realistic, professional photography quality

### F3: Body Type-Specific Prompt Engineering

- Prompts that accurately represent each body type
- Clear body type differentiation
- Appealing, attractive appearance
- Consistent with base character style
- Appropriate clothing to showcase body type

### F4: Image Generation Script

- Script to generate all 8 body type images
- Batch processing capability
- Quality validation
- Error handling and retry logic
- Progress tracking

### F5: Image Optimization

- Convert to WebP format
- Compress to < 100KB per image
- Maintain visual quality
- Optimize for web delivery

---

## Technical Implementation

### Generation Approach

**Tools & Technologies:**
- ComfyUI pod with Z-Image Turbo workflow
- Base character images from EP-033 as reference
- Existing generation scripts as reference
- RunPod GPU infrastructure

**Image Specifications:**
- **Dimensions**: 768×960 (4:5 aspect ratio, matches UI)
- **Format**: WebP
- **Quality**: 80% (balance quality and file size)
- **Max File Size**: < 100KB per image

### Prompt Engineering

**Base Prompt Template:**
```
A [attractive/beautiful/handsome] [gender], [age] years old, [ethnicity] ethnicity, [hair description], [eye color] eyes, [body type description] body type, full body view, wearing [outfit], professional portrait, 8K hyper-realistic, photorealistic, professional photography, ultra high quality, extremely detailed, sharp focus, clean composition, studio lighting, editorial fashion photography, masterpiece, best quality
```

**Body Type-Specific Prompts:**

**Female - Slim:**
```
A beautiful, attractive woman, 25 years old, caucasian ethnicity, long brown hair, brown eyes, slim slender body type with lean frame, full body view, wearing form-fitting casual outfit, professional portrait, 8K hyper-realistic, photorealistic, professional photography, ultra high quality, extremely detailed, sharp focus, clean composition, studio lighting, editorial fashion photography, masterpiece, best quality
```

**Female - Athletic:**
```
A beautiful, attractive woman, 25 years old, caucasian ethnicity, long brown hair, brown eyes, athletic toned body type with defined muscles and fit physique, full body view, wearing athletic casual outfit, professional portrait, 8K hyper-realistic, photorealistic, professional photography, ultra high quality, extremely detailed, sharp focus, clean composition, studio lighting, editorial fashion photography, masterpiece, best quality
```

**Female - Curvy:**
```
A beautiful, attractive woman, 25 years old, caucasian ethnicity, long brown hair, brown eyes, curvy body type with hourglass figure and fuller curves, full body view, wearing form-fitting casual outfit, professional portrait, 8K hyper-realistic, photorealistic, professional photography, ultra high quality, extremely detailed, sharp focus, clean composition, studio lighting, editorial fashion photography, masterpiece, best quality
```

**Female - Voluptuous:**
```
A beautiful, attractive woman, 25 years old, caucasian ethnicity, long brown hair, brown eyes, voluptuous body type with full curves and generous proportions, full body view, wearing form-fitting casual outfit, professional portrait, 8K hyper-realistic, photorealistic, professional photography, ultra high quality, extremely detailed, sharp focus, clean composition, studio lighting, editorial fashion photography, masterpiece, best quality
```

**Male - Slim:**
```
A handsome, attractive man, 28 years old, caucasian ethnicity, short brown hair, brown eyes, slim slender body type with lean frame, full body view, wearing casual outfit, professional portrait, 8K hyper-realistic, photorealistic, professional photography, ultra high quality, extremely detailed, sharp focus, clean composition, studio lighting, editorial fashion photography, masterpiece, best quality
```

**Male - Athletic:**
```
A handsome, attractive man, 28 years old, caucasian ethnicity, short brown hair, brown eyes, athletic toned body type with defined muscles and fit physique, full body view, wearing casual outfit, professional portrait, 8K hyper-realistic, photorealistic, professional photography, ultra high quality, extremely detailed, sharp focus, clean composition, studio lighting, editorial fashion photography, masterpiece, best quality
```

**Male - Muscular:**
```
A handsome, attractive man, 28 years old, caucasian ethnicity, short brown hair, brown eyes, muscular body type with well-developed muscles and strong physique, full body view, wearing casual outfit, professional portrait, 8K hyper-realistic, photorealistic, professional photography, ultra high quality, extremely detailed, sharp focus, clean composition, studio lighting, editorial fashion photography, masterpiece, best quality
```

**Male - Chubby:**
```
A handsome, attractive man, 28 years old, caucasian ethnicity, short brown hair, brown eyes, chubby body type with fuller frame and soft physique, full body view, wearing casual outfit, professional portrait, 8K hyper-realistic, photorealistic, professional photography, ultra high quality, extremely detailed, sharp focus, clean composition, studio lighting, editorial fashion photography, masterpiece, best quality
```

**Negative Prompt:**
```
deformed, blurry, bad anatomy, ugly, low quality, watermark, signature, multiple people, extra limbs, distorted face, bad hands, missing fingers, extra fingers, mutated hands, poorly drawn hands, bad proportions, long neck, duplicate, mutilated, disfigured, bad anatomy, out of frame, extra limbs, bad body, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, mutated, ugly, bad face, bad eyes, text, watermark, signature, no person, empty scene, no character, nude, naked, no clothing, bare skin, exposed
```

### Script Structure

**File**: `scripts/generation/generate-body-type-images.ts`

**Key Functions:**
- `generateBodyTypeImages()` - Generate all body type images
- `generateBodyTypeImage(bodyType, gender)` - Generate single body type image
- `getBodyTypePrompt(bodyType, gender)` - Get body type-specific prompt
- `optimizeImage()` - Compress and convert to WebP
- `saveImage()` - Save to appropriate directory

**Output Paths:**
- Female: `apps/web/public/images/body/female/body-{bodyType}.webp`
- Male: `apps/web/public/images/body/male/body-{bodyType}.webp`

**Body Type Values:**
- Female: `slim`, `athletic`, `curvy`, `voluptuous`
- Male: `slim`, `athletic`, `muscular`, `chubby`

---

## Acceptance Criteria

### AC-1: Female Body Type Images

- [ ] 4 female body type images generated (Slim, Athletic, Curvy, Voluptuous)
- [ ] Each image clearly showcases the body type's distinct characteristics
- [ ] Images are appealing, attractive, and professional quality
- [ ] Images maintain consistency with base female character
- [ ] All images optimized (WebP, < 100KB)
- [ ] All images saved to correct paths

### AC-2: Male Body Type Images

- [ ] 4 male body type images generated (Slim, Athletic, Muscular, Chubby)
- [ ] Each image clearly showcases the body type's distinct characteristics
- [ ] Images are appealing, attractive, and professional quality
- [ ] Images maintain consistency with base male character
- [ ] All images optimized (WebP, < 100KB)
- [ ] All images saved to correct paths

### AC-3: Body Type Differentiation

- [ ] Images clearly show differences between body types
- [ ] Body type characteristics are accurately represented
- [ ] Full body view clearly showcases body type
- [ ] Appropriate clothing to highlight body type
- [ ] Design team approval for accuracy

### AC-4: Generation Script

- [ ] Script successfully generates all 8 body type images
- [ ] Script uses ComfyUI + Z-Image Turbo workflow
- [ ] Script handles errors gracefully
- [ ] Script provides progress feedback
- [ ] Script validates image quality before saving
- [ ] Script supports batch processing

### AC-5: Image Quality

- [ ] Images are appealing and attractive
- [ ] Images have consistent style and composition
- [ ] Images are professional quality (8K, photorealistic)
- [ ] Images clearly showcase body type differences
- [ ] Images optimized for web delivery

### AC-6: Documentation

- [ ] Script documented with usage instructions
- [ ] Image paths documented
- [ ] Prompt engineering approach documented
- [ ] Quality standards documented

---

## User Stories

### ST-001: Generate Female Body Type Images

**As a** developer generating wizard assets  
**I want to** generate appealing body type-specific images for all 4 female body types  
**So that** users can visually preview body type options in the wizard

**AC**: AC-1, AC-3, AC-4, AC-5

### ST-002: Generate Male Body Type Images

**As a** developer generating wizard assets  
**I want to** generate appealing body type-specific images for all 4 male body types  
**So that** users can visually preview body type options in the wizard

**AC**: AC-2, AC-3, AC-4, AC-5

---

## Dependencies

- **EP-033**: Requires base character images as reference
- **ComfyUI Pod**: Requires running ComfyUI pod with Z-Image Turbo workflow
- **RunPod Infrastructure**: GPU compute resources
- **Design Team Review**: Body type representation accuracy review

---

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation Strategy |
|------|------------|--------|-------------------|
| Body type differentiation unclear | Medium | High | Clear prompt engineering, full body view, design team review |
| Image quality inconsistent | Medium | High | Quality review process, iterative refinement, use proven prompts |
| Body type representation issues | Low | Medium | Design team review, iterative feedback, multiple attempts |

---

## Related Work

### Epics

| Epic | Name | Status | Link |
|------|------|--------|------|
| EP-033 | Base Character Image Generation | Not Started | `EP-033-base-character-image-generation.md` |
| EP-034 | Ethnicity Image Generation | Not Started | `EP-034-ethnicity-image-generation.md` |
| EP-036 | Ethnicity-Specific Feature Images | Not Started | `EP-036-ethnicity-specific-features.md` |

### Dependencies

- **Blocks**: None
- **Blocked By**: EP-033 (needs base characters as reference)
- **Related Initiative**: IN-004 (Wizard Image Generation & Asset Creation)

---

## Definition of Done

- [ ] All 8 body type images generated and optimized
- [ ] Images reviewed and approved by design team
- [ ] Generation script created and tested
- [ ] Images saved to correct paths
- [ ] Documentation updated

---

**Created**: 2026-01-XX  
**Status**: Not Started  
**Priority**: P1
