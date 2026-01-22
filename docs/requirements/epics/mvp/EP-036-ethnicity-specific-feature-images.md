# [EPIC] EP-036: Ethnicity-Specific Feature Images

**Status**: Proposed
**Phase**: P2
**Created**: 2026-01-21
**Last Updated**: 2026-01-21


**Related Initiative**: [IN-004](../initiatives/IN-004-wizard-image-generation.md) - Wizard Image Generation & Asset Creation

## Overview

Generate appealing, attractive ethnicity-specific feature images for all wizard customization options. This includes hair styles, eye colors, hair colors, face shapes, and age ranges - all with ethnicity-specific variants to ensure accurate representation across different ethnicities.

---

## Business Impact

**Target Metric**: A - Activation, C - Core Value

**Hypothesis**: When users can visually preview all customization options with ethnicity-specific images that accurately represent how features appear across different ethnicities, they will have confidence in their selections and complete the wizard flow.

**Success Criteria**:
- All ethnicity-specific feature images generated
- Images clearly showcase each feature option
- Images are ethnicity-accurate and appealing
- Images maintain consistency with base characters
- All images optimized and ready for production use

---

## Scope

### In Scope

**Hair Styles (Ethnicity-Specific):**
- Female: 7 styles × 6 ethnicities = 42 images (Asian, Black, Caucasian, Latina, Arab, Indian, Mixed)
- Male: 7 styles × 6 ethnicities = 42 images
- Total: 84 hair style images

**Eye Colors (Ethnicity-Specific):**
- Female: 6 colors × 6 ethnicities = 36 images
- Male: 6 colors × 6 ethnicities = 36 images
- Total: 72 eye color images

**Hair Colors (Ethnicity-Specific):**
- Female: 7 colors × 6 ethnicities = 42 images
- Male: 7 colors × 6 ethnicities = 42 images
- Total: 84 hair color images

**Face Shapes (Ethnicity-Specific):**
- Female: 5 shapes × 6 ethnicities = 30 images
- Male: 5 shapes × 6 ethnicities = 30 images
- Total: 60 face shape images

**Age Ranges (Ethnicity-Specific):**
- Female: 4 age ranges × 6 ethnicities = 24 images
- Male: 4 age ranges × 6 ethnicities = 24 images
- Total: 48 age range images

**Total Images**: ~348 ethnicity-specific feature images

### Out of Scope

- Base character images (covered in EP-033)
- Ethnicity base images (covered in EP-034)
- Body type images (covered in EP-035)
- Non-ethnicity-specific images

---

## Features

### F1: Hair Style Images (84 images)

- **Female Styles**: Long, Short, Braids, Ponytail, Bangs, Bun, Wavy
- **Male Styles**: Short, Long, Crew Cut, Wavy, Pompadour, Layered Cut, Bald
- **Ethnicities**: Asian, Black, Caucasian, Latina, Arab, Indian, Mixed
- **Focus**: Clear hair style visibility, ethnicity-appropriate representation
- **Quality**: 8K hyper-realistic, professional photography quality

### F2: Eye Color Images (72 images)

- **Colors**: Brown, Blue, Green, Hazel, Gray, Amber
- **Ethnicities**: Asian, Black, Caucasian, Latina, Arab, Indian, Mixed
- **Focus**: Close-up of eyes showing color clearly, ethnicity-appropriate representation
- **Quality**: 8K hyper-realistic, professional photography quality

### F3: Hair Color Images (84 images)

- **Colors**: Black, Brown, Blonde, Auburn, Red, Gray, White
- **Ethnicities**: Asian, Black, Caucasian, Latina, Arab, Indian, Mixed
- **Focus**: Clear hair color visibility, ethnicity-appropriate representation
- **Quality**: 8K hyper-realistic, professional photography quality

### F4: Face Shape Images (60 images)

- **Shapes**: Oval, Round, Square, Heart, Diamond
- **Ethnicities**: Asian, Black, Caucasian, Latina, Arab, Indian, Mixed
- **Focus**: Clear face shape visibility, ethnicity-appropriate representation
- **Quality**: 8K hyper-realistic, professional photography quality

### F5: Age Range Images (48 images)

- **Age Ranges**: 18-25, 26-33, 34-41, 42-50
- **Ethnicities**: Asian, Black, Caucasian, Latina, Arab, Indian, Mixed
- **Focus**: Clear age representation, ethnicity-appropriate appearance
- **Quality**: 8K hyper-realistic, professional photography quality

### F6: Batch Generation Script

- Script to generate all ethnicity-specific feature images
- Efficient batch processing
- Progress tracking and error handling
- Quality validation
- Automatic optimization

---

## Technical Implementation

### Generation Approach

**Tools & Technologies:**
- ComfyUI pod with Z-Image Turbo workflow
- Base ethnicity images from EP-034 as reference
- Existing generation scripts as reference
- RunPod GPU infrastructure

**Image Specifications:**
- **Dimensions**: 768×960 (4:5 aspect ratio, matches UI)
- **Format**: WebP
- **Quality**: 80% (balance quality and file size)
- **Max File Size**: < 100KB per image

### Prompt Engineering Strategy

**Base Template for Feature Images:**
```
A [attractive/beautiful/handsome] [gender], [age] years old, [ethnicity] ethnicity with distinct [ethnicity] features, [feature-specific description], [other standard features], wearing [outfit], [feature focus instruction], professional portrait, 8K hyper-realistic, photorealistic, professional photography, ultra high quality, extremely detailed, sharp focus, clean composition, studio lighting, editorial fashion photography, masterpiece, best quality
```

**Feature-Specific Focus Instructions:**
- **Hair Style**: "hair style clearly visible, focus on hair"
- **Eye Color**: "close-up of eyes, eye color clearly visible, focus on eyes"
- **Hair Color**: "hair color clearly visible, focus on hair"
- **Face Shape**: "face shape clearly visible, focus on facial structure"
- **Age Range**: "age-appropriate appearance, focus on age characteristics"

### Script Structure

**File**: `scripts/generation/generate-ethnicity-specific-features.ts`

**Key Functions:**
- `generateAllFeatureImages()` - Generate all feature images
- `generateHairStyleImages()` - Generate hair style images
- `generateEyeColorImages()` - Generate eye color images
- `generateHairColorImages()` - Generate hair color images
- `generateFaceShapeImages()` - Generate face shape images
- `generateAgeRangeImages()` - Generate age range images
- `getFeaturePrompt(feature, ethnicity, gender)` - Get feature-specific prompt
- `optimizeImage()` - Compress and convert to WebP
- `saveImage()` - Save to appropriate directory

**Output Paths:**
- Hair Styles: `apps/web/public/images/hair-styles/{ethnicity}/{style}-{gender}.webp`
- Eye Colors: `apps/web/public/images/eye-colors/{ethnicity}/{color}-{gender}.webp`
- Hair Colors: `apps/web/public/images/hair-colors/{ethnicity}/{color}-{gender}.webp`
- Face Shapes: `apps/web/public/images/face-shapes/{ethnicity}/{shape}-{gender}.webp`
- Age Ranges: `apps/web/public/images/age-ranges/{ethnicity}/{range}-{gender}.webp`

---

## Acceptance Criteria

### AC-1: Hair Style Images

- [ ] 84 hair style images generated (7 styles × 6 ethnicities × 2 genders)
- [ ] Each image clearly showcases the hair style
- [ ] Images are ethnicity-appropriate and appealing
- [ ] All images optimized (WebP, < 100KB)
- [ ] All images saved to correct paths

### AC-2: Eye Color Images

- [ ] 72 eye color images generated (6 colors × 6 ethnicities × 2 genders)
- [ ] Each image clearly showcases the eye color
- [ ] Images are ethnicity-appropriate and appealing
- [ ] Close-up focus on eyes
- [ ] All images optimized (WebP, < 100KB)
- [ ] All images saved to correct paths

### AC-3: Hair Color Images

- [ ] 84 hair color images generated (7 colors × 6 ethnicities × 2 genders)
- [ ] Each image clearly showcases the hair color
- [ ] Images are ethnicity-appropriate and appealing
- [ ] All images optimized (WebP, < 100KB)
- [ ] All images saved to correct paths

### AC-4: Face Shape Images

- [ ] 60 face shape images generated (5 shapes × 6 ethnicities × 2 genders)
- [ ] Each image clearly showcases the face shape
- [ ] Images are ethnicity-appropriate and appealing
- [ ] All images optimized (WebP, < 100KB)
- [ ] All images saved to correct paths

### AC-5: Age Range Images

- [ ] 48 age range images generated (4 ranges × 6 ethnicities × 2 genders)
- [ ] Each image clearly represents the age range
- [ ] Images are ethnicity-appropriate and appealing
- [ ] All images optimized (WebP, < 100KB)
- [ ] All images saved to correct paths

### AC-6: Generation Script

- [ ] Script successfully generates all feature images
- [ ] Script uses ComfyUI + Z-Image Turbo workflow
- [ ] Script handles errors gracefully
- [ ] Script provides progress feedback
- [ ] Script validates image quality before saving
- [ ] Script supports efficient batch processing

### AC-7: Image Quality

- [ ] Images are appealing and attractive
- [ ] Images have consistent style and composition
- [ ] Images are professional quality (8K, photorealistic)
- [ ] Images clearly showcase the specific feature
- [ ] Images are ethnicity-appropriate
- [ ] Images optimized for web delivery

### AC-8: Documentation

- [ ] Script documented with usage instructions
- [ ] Image paths documented
- [ ] Prompt engineering approach documented
- [ ] Quality standards documented
- [ ] Feature-specific guidelines documented

---

## User Stories

### ST-001: Generate Hair Style Images

**As a** developer generating wizard assets  
**I want to** generate appealing ethnicity-specific hair style images for all combinations  
**So that** users can visually preview hair style options in the wizard

**AC**: AC-1, AC-6, AC-7

### ST-002: Generate Eye Color Images

**As a** developer generating wizard assets  
**I want to** generate appealing ethnicity-specific eye color images for all combinations  
**So that** users can visually preview eye color options in the wizard

**AC**: AC-2, AC-6, AC-7

### ST-003: Generate Hair Color Images

**As a** developer generating wizard assets  
**I want to** generate appealing ethnicity-specific hair color images for all combinations  
**So that** users can visually preview hair color options in the wizard

**AC**: AC-3, AC-6, AC-7

### ST-004: Generate Face Shape Images

**As a** developer generating wizard assets  
**I want to** generate appealing ethnicity-specific face shape images for all combinations  
**So that** users can visually preview face shape options in the wizard

**AC**: AC-4, AC-6, AC-7

### ST-005: Generate Age Range Images

**As a** developer generating wizard assets  
**I want to** generate appealing ethnicity-specific age range images for all combinations  
**So that** users can visually preview age range options in the wizard

**AC**: AC-5, AC-6, AC-7

---

## Dependencies

- **EP-033**: Requires base character images as reference
- **EP-034**: Requires ethnicity images as base for feature-specific variants
- **ComfyUI Pod**: Requires running ComfyUI pod with Z-Image Turbo workflow
- **RunPod Infrastructure**: GPU compute resources (large batch processing)
- **Design Team Review**: Feature representation accuracy review

---

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation Strategy |
|------|------------|--------|-------------------|
| Large number of images (348) takes too long | High | Medium | Efficient batching, parallel processing, prioritize critical images first |
| Ethnicity-specific accuracy issues | Medium | High | Design team review, cultural sensitivity checks, iterative feedback |
| Image quality inconsistent | Medium | High | Quality review process, iterative refinement, use proven prompts |
| Feature focus unclear | Medium | Medium | Clear prompt engineering, feature-specific focus instructions, design team review |

---

## Related Work

### Epics

| Epic | Name | Status | Link |
|------|------|--------|------|
| EP-033 | Base Character Image Generation | Not Started | `EP-033-base-character-image-generation.md` |
| EP-034 | Ethnicity Image Generation | Not Started | `EP-034-ethnicity-image-generation.md` |
| EP-035 | Body Type Image Generation | Not Started | `EP-035-body-type-image-generation.md` |

### Dependencies

- **Blocks**: None
- **Blocked By**: EP-033, EP-034 (needs base and ethnicity images as reference)
- **Related Initiative**: IN-004 (Wizard Image Generation & Asset Creation)

---

## Definition of Done

- [ ] All ~348 ethnicity-specific feature images generated and optimized
- [ ] Images reviewed and approved by design team
- [ ] Generation script created and tested
- [ ] Images saved to correct paths
- [ ] Documentation updated
- [ ] All wizard image assets complete

---

**Created**: 2026-01-XX  
**Status**: Not Started  
**Priority**: P1
