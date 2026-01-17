# [EPIC] EP-034: Ethnicity Image Generation

**Related Initiative**: [IN-004](../initiatives/IN-004-wizard-image-generation.md) - Wizard Image Generation & Asset Creation

## Overview

Generate appealing, attractive ethnicity-specific base character images for all 7 ethnicities across both genders (14 total images). These images will clearly showcase each ethnicity's distinct features while maintaining the appealing, attractive character appearance established in EP-033.

---

## Business Impact

**Target Metric**: A - Activation, C - Core Value

**Hypothesis**: When users can visually preview ethnicity options with appealing, attractive images that clearly show ethnic features, they will have confidence in their selection and complete the wizard flow.

**Success Criteria**:
- 14 ethnicity images generated (7 ethnicities × 2 genders)
- Images clearly showcase each ethnicity's distinct features
- Images are appealing, attractive, and professional quality
- Images maintain consistency with base characters from EP-033
- All images optimized and ready for production use

---

## Scope

### In Scope

- Generate ethnicity images for all 7 ethnicities:
  - Asian
  - Black/African
  - White/Caucasian
  - Latina
  - Arab
  - Indian
  - Mixed
- Generate for both genders (female and male)
- Images focus on clear ethnic feature representation
- Professional quality (8K, photorealistic)
- Consistent style and composition
- Image optimization (WebP, < 100KB)

### Out of Scope

- Body type variations (covered in EP-035)
- Feature-specific images (hair, eyes, etc.) (covered in EP-036)
- Multiple style options (realistic only)

---

## Features

### F1: Female Ethnicity Images (7 images)

- **Ethnicities**: Asian, Black, Caucasian, Latina, Arab, Indian, Mixed
- **Focus**: Clear ethnic features, appealing appearance
- **Style**: Realistic, photorealistic
- **Composition**: Full body or upper body portrait
- **Quality**: 8K hyper-realistic, professional photography quality

### F2: Male Ethnicity Images (7 images)

- **Ethnicities**: Asian, Black, Caucasian, Latino, Arab, Indian, Mixed
- **Focus**: Clear ethnic features, appealing appearance
- **Style**: Realistic, photorealistic
- **Composition**: Full body or upper body portrait
- **Quality**: 8K hyper-realistic, professional photography quality

### F3: Ethnicity-Specific Prompt Engineering

- Prompts that accurately represent each ethnicity
- Cultural sensitivity and accuracy
- Clear ethnic feature focus
- Appealing, attractive appearance
- Consistent with base character style

### F4: Image Generation Script

- Script to generate all 14 ethnicity images
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
A [attractive/beautiful/handsome] [gender], [age] years old, [ethnicity] ethnicity, [hair description], [eye color] eyes, [body type], wearing [outfit], professional portrait, 8K hyper-realistic, photorealistic, professional photography, ultra high quality, extremely detailed, sharp focus, clean composition, studio lighting, editorial fashion photography, masterpiece, best quality
```

**Ethnicity-Specific Prompts:**

**Asian (Female):**
```
A beautiful, attractive woman, 25 years old, Asian ethnicity with distinct Asian facial features, long black hair, brown eyes, slim athletic body type, wearing casual stylish outfit, professional portrait, 8K hyper-realistic, photorealistic, professional photography, ultra high quality, extremely detailed, sharp focus, clean composition, studio lighting, editorial fashion photography, masterpiece, best quality
```

**Black (Female):**
```
A beautiful, attractive woman, 25 years old, Black/African ethnicity with distinct African facial features, long black hair, brown eyes, slim athletic body type, wearing casual stylish outfit, professional portrait, 8K hyper-realistic, photorealistic, professional photography, ultra high quality, extremely detailed, sharp focus, clean composition, studio lighting, editorial fashion photography, masterpiece, best quality
```

**Caucasian (Female):**
```
A beautiful, attractive woman, 25 years old, Caucasian/White ethnicity with distinct European facial features, long brown hair, brown eyes, slim athletic body type, wearing casual stylish outfit, professional portrait, 8K hyper-realistic, photorealistic, professional photography, ultra high quality, extremely detailed, sharp focus, clean composition, studio lighting, editorial fashion photography, masterpiece, best quality
```

**Latina (Female):**
```
A beautiful, attractive woman, 25 years old, Latina/Hispanic ethnicity with distinct Latin American facial features, long dark brown hair, brown eyes, slim athletic body type, wearing casual stylish outfit, professional portrait, 8K hyper-realistic, photorealistic, professional photography, ultra high quality, extremely detailed, sharp focus, clean composition, studio lighting, editorial fashion photography, masterpiece, best quality
```

**Arab (Female):**
```
A beautiful, attractive woman, 25 years old, Arab/Middle Eastern ethnicity with distinct Middle Eastern facial features, long dark brown hair, brown eyes, slim athletic body type, wearing casual stylish outfit, professional portrait, 8K hyper-realistic, photorealistic, professional photography, ultra high quality, extremely detailed, sharp focus, clean composition, studio lighting, editorial fashion photography, masterpiece, best quality
```

**Indian (Female):**
```
A beautiful, attractive woman, 25 years old, Indian/South Asian ethnicity with distinct South Asian facial features, long black hair, brown eyes, slim athletic body type, wearing casual stylish outfit, professional portrait, 8K hyper-realistic, photorealistic, professional photography, ultra high quality, extremely detailed, sharp focus, clean composition, studio lighting, editorial fashion photography, masterpiece, best quality
```

**Mixed (Female):**
```
A beautiful, attractive woman, 25 years old, mixed ethnicity with diverse mixed heritage facial features, long brown hair, brown eyes, slim athletic body type, wearing casual stylish outfit, professional portrait, 8K hyper-realistic, photorealistic, professional photography, ultra high quality, extremely detailed, sharp focus, clean composition, studio lighting, editorial fashion photography, masterpiece, best quality
```

*(Similar prompts for male versions with "handsome man" and appropriate male characteristics)*

**Negative Prompt:**
```
deformed, blurry, bad anatomy, ugly, low quality, watermark, signature, multiple people, extra limbs, distorted face, bad hands, missing fingers, extra fingers, mutated hands, poorly drawn hands, bad proportions, long neck, duplicate, mutilated, disfigured, bad anatomy, out of frame, extra limbs, bad body, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, mutated, ugly, bad face, bad eyes, text, watermark, signature, no person, empty scene, no character, nude, naked, no clothing, bare skin, exposed, stereotypical, caricature, offensive
```

### Script Structure

**File**: `scripts/generation/generate-ethnicity-images.ts`

**Key Functions:**
- `generateEthnicityImages()` - Generate all ethnicity images
- `generateEthnicityImage(ethnicity, gender)` - Generate single ethnicity image
- `getEthnicityPrompt(ethnicity, gender)` - Get ethnicity-specific prompt
- `optimizeImage()` - Compress and convert to WebP
- `saveImage()` - Save to appropriate directory

**Output Paths:**
- Female: `apps/web/public/images/ethnicity/female/{ethnicity}-ethnicity.webp`
- Male: `apps/web/public/images/ethnicity/male/{ethnicity}-ethnicity.webp`

**Ethnicity Values:**
- `asian`, `black`, `caucasian`, `latina`, `arabian`, `indian`, `mixed`

---

## Acceptance Criteria

### AC-1: Female Ethnicity Images

- [ ] 7 female ethnicity images generated (Asian, Black, Caucasian, Latina, Arab, Indian, Mixed)
- [ ] Each image clearly showcases the ethnicity's distinct features
- [ ] Images are appealing, attractive, and professional quality
- [ ] Images maintain consistency with base female character
- [ ] All images optimized (WebP, < 100KB)
- [ ] All images saved to correct paths

### AC-2: Male Ethnicity Images

- [ ] 7 male ethnicity images generated (Asian, Black, Caucasian, Latino, Arab, Indian, Mixed)
- [ ] Each image clearly showcases the ethnicity's distinct features
- [ ] Images are appealing, attractive, and professional quality
- [ ] Images maintain consistency with base male character
- [ ] All images optimized (WebP, < 100KB)
- [ ] All images saved to correct paths

### AC-3: Ethnicity Accuracy

- [ ] Images accurately represent each ethnicity
- [ ] Cultural sensitivity maintained
- [ ] No stereotypes or caricatures
- [ ] Clear ethnic feature representation
- [ ] Design team approval for accuracy

### AC-4: Generation Script

- [ ] Script successfully generates all 14 ethnicity images
- [ ] Script uses ComfyUI + Z-Image Turbo workflow
- [ ] Script handles errors gracefully
- [ ] Script provides progress feedback
- [ ] Script validates image quality before saving
- [ ] Script supports batch processing

### AC-5: Image Quality

- [ ] Images are appealing and attractive
- [ ] Images have consistent style and composition
- [ ] Images are professional quality (8K, photorealistic)
- [ ] Images clearly showcase ethnic features
- [ ] Images optimized for web delivery

### AC-6: Documentation

- [ ] Script documented with usage instructions
- [ ] Image paths documented
- [ ] Prompt engineering approach documented
- [ ] Quality standards documented
- [ ] Ethnicity representation guidelines documented

---

## User Stories

### ST-001: Generate Female Ethnicity Images

**As a** developer generating wizard assets  
**I want to** generate appealing ethnicity-specific images for all 7 female ethnicities  
**So that** users can visually preview ethnicity options in the wizard

**AC**: AC-1, AC-3, AC-4, AC-5

### ST-002: Generate Male Ethnicity Images

**As a** developer generating wizard assets  
**I want to** generate appealing ethnicity-specific images for all 7 male ethnicities  
**So that** users can visually preview ethnicity options in the wizard

**AC**: AC-2, AC-3, AC-4, AC-5

---

## Dependencies

- **EP-033**: Requires base character images as reference
- **ComfyUI Pod**: Requires running ComfyUI pod with Z-Image Turbo workflow
- **RunPod Infrastructure**: GPU compute resources
- **Design Team Review**: Cultural sensitivity and accuracy review

---

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation Strategy |
|------|------------|--------|-------------------|
| Ethnicity representation accuracy issues | Medium | High | Design team review, cultural sensitivity checks, iterative feedback |
| Image quality inconsistent | Medium | High | Quality review process, iterative refinement, use proven prompts |
| Stereotypes or caricatures | Low | High | Careful prompt engineering, design team review, cultural sensitivity guidelines |
| Generation takes longer than expected | Medium | Medium | Parallel generation, efficient batching, prioritize critical images first |

---

## Related Work

### Epics

| Epic | Name | Status | Link |
|------|------|--------|------|
| EP-033 | Base Character Image Generation | Not Started | `EP-033-base-character-image-generation.md` |
| EP-035 | Body Type Image Generation | Not Started | `EP-035-body-type-image-generation.md` |
| EP-036 | Ethnicity-Specific Feature Images | Not Started | `EP-036-ethnicity-specific-features.md` |

### Dependencies

- **Blocks**: EP-036 (needs ethnicity images as base)
- **Blocked By**: EP-033 (needs base characters as reference)
- **Related Initiative**: IN-004 (Wizard Image Generation & Asset Creation)

---

## Definition of Done

- [ ] All 14 ethnicity images generated and optimized
- [ ] Images reviewed and approved by design team for accuracy
- [ ] Generation script created and tested
- [ ] Images saved to correct paths
- [ ] Documentation updated
- [ ] Ready to use as base for EP-036

---

**Created**: 2026-01-XX  
**Status**: Not Started  
**Priority**: P1
