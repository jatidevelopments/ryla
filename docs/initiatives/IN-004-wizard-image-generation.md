# [INITIATIVE] IN-004: Wizard Image Generation & Asset Creation

**Status**: Proposed  
**Created**: 2026-01-XX  
**Last Updated**: 2026-01-XX  
**Owner**: Product Team  
**Stakeholders**: Design Team, Engineering Team

---

## Executive Summary

**One-sentence description**: Generate all missing visual assets for the character wizard, ensuring appealing, attractive, and ethnicity-specific images that clearly showcase each customization option (ethnicity, body type, hair styles, eye colors, etc.) using AI image generation with ComfyUI and Z-Image Turbo.

**Business Impact**: A-Activation, C-Core Value

---

## Why (Business Rationale)

### Problem Statement

The character wizard currently has many missing or placeholder images, creating a poor user experience during character creation. Users cannot visually preview their selections, which:
- Reduces confidence in selections
- Slows down the character creation process
- Creates confusion about what each option represents
- Hurts conversion rates (users abandon wizard due to poor UX)
- Makes the product feel incomplete or unprofessional

### Current State

**Missing/Incomplete Image Assets:**
- **Ethnicity images**: Some ethnicity options have placeholder or missing images (7 ethnicities × 2 genders = 14 images needed)
- **Body type images**: May be missing or inconsistent (8 images: 4 female + 4 male)
- **Ethnicity-specific assets**: Hair styles, eye colors, hair colors, face shapes need ethnicity-specific variants
- **Age range images**: Need ethnicity-specific age range visuals
- **Base character images**: Need appealing base character representations that showcase the initial generated character

**Current Issues:**
- Users see skeleton/placeholder images during wizard flow
- Images don't clearly focus on the specific feature being selected
- Inconsistent quality and style across image assets
- Missing ethnicity-specific variations for many options
- Base character images don't showcase the appealing, attractive character that was generated

### Desired State

**Complete Image Asset Library:**
- All ethnicity options have high-quality, appealing images showing clear ethnic features
- All body types have clear, attractive visual representations
- All ethnicity-specific options (hair, eyes, face) have proper variants
- Base character images showcase the attractive, appealing character that users generated
- Images are consistent in style, quality, and focus on the specific feature
- All images are optimized (WebP format, compressed, < 100KB per image)

**User Experience:**
- Users can visually preview every option before selecting
- Images clearly show what each option represents
- Consistent, professional appearance throughout wizard
- Fast loading times (optimized images)
- Clear focus on the specific feature (ethnicity, body type, etc.)

### Business Drivers

- **Revenue Impact**: Better UX → higher conversion rates → more paid subscriptions
- **Cost Impact**: Automated generation reduces manual design costs
- **Risk Mitigation**: Reduces user confusion and abandonment
- **Competitive Advantage**: Professional, complete visual experience differentiates from competitors
- **User Experience**: Visual previews increase confidence and satisfaction

---

## How (Approach & Strategy)

### Strategy

**Phase 1: Base Character & Ethnicity Images**
- Generate appealing base character images for each ethnicity (7 ethnicities × 2 genders = 14 images)
- Focus on clear ethnic features, attractive appearance, professional quality
- Use base character from initial generation as reference

**Phase 2: Body Type & Feature Images**
- Generate body type images (8 images: 4 female + 4 male)
- Focus on clearly showing body type differences
- Ensure attractive, appealing representations

**Phase 3: Ethnicity-Specific Assets**
- Generate ethnicity-specific hair styles (6 ethnicities × multiple styles)
- Generate ethnicity-specific eye colors (6 ethnicities × multiple colors)
- Generate ethnicity-specific hair colors (6 ethnicities × multiple colors)
- Generate ethnicity-specific face shapes (6 ethnicities × multiple shapes)
- Generate ethnicity-specific age ranges (6 ethnicities × 4 age ranges)

**Phase 4: Quality Assurance & Optimization**
- Review all generated images for quality and accuracy
- Optimize images (compress, convert to WebP)
- Verify images clearly focus on the specific feature
- Ensure consistent style across all assets

### Key Principles

1. **Appealing & Attractive**: All images must be visually appealing and attractive
2. **Feature Focus**: Images must clearly focus on the specific feature (ethnicity, body type, etc.)
3. **Ethnicity Accuracy**: Ethnicity-specific images must accurately represent the ethnicity
4. **Consistency**: All images must have consistent style, quality, and composition
5. **Base Character Reference**: Use the initially generated base character as reference for consistency
6. **Automated Generation**: Use existing scripts and AI generation to scale efficiently

### Phases

1. **Phase 1: Base Character & Ethnicity Images** - 1-2 weeks
   - Generate 14 ethnicity images (7 ethnicities × 2 genders)
   - Focus on appealing, attractive base characters
   - Clear ethnic feature representation

2. **Phase 2: Body Type Images** - 1 week
   - Generate 8 body type images (4 female + 4 male)
   - Clear body type differentiation
   - Attractive, appealing representations

3. **Phase 3: Ethnicity-Specific Assets** - 2-3 weeks
   - Generate hair styles (ethnicity-specific)
   - Generate eye colors (ethnicity-specific)
   - Generate hair colors (ethnicity-specific)
   - Generate face shapes (ethnicity-specific)
   - Generate age ranges (ethnicity-specific)

4. **Phase 4: Quality Assurance & Optimization** - 1 week
   - Review and quality check all images
   - Optimize and compress images
   - Verify feature focus and consistency
   - Deploy to production

### Dependencies

- **ComfyUI Pod**: Requires running ComfyUI pod with Z-Image Turbo workflow
- **Base Character Reference**: Need access to base character generation for reference
- **Image Generation Scripts**: Leverage existing scripts (`generate-studio-preset-thumbnails.ts`, etc.)
- **Storage**: Cloudflare R2 or Supabase Storage for image hosting
- **Image Optimization Tools**: Scripts for compression and WebP conversion

### Constraints

- **Image Quality**: Must maintain high quality while keeping file sizes < 100KB
- **Generation Time**: AI generation takes time - need efficient batching
- **Cost**: GPU compute costs for image generation
- **Consistency**: Must maintain consistent style across all generated images
- **Ethnicity Accuracy**: Must accurately represent each ethnicity respectfully

---

## When (Timeline & Priority)

### Timeline

- **Start Date**: 2026-01-XX
- **Target Completion**: 2026-03-XX (8-10 weeks total)
- **Key Milestones**:
  - Phase 1 Complete: 2026-02-XX
  - Phase 2 Complete: 2026-02-XX
  - Phase 3 Complete: 2026-03-XX
  - Phase 4 Complete: 2026-03-XX

### Priority

**Priority Level**: P1

**Rationale**: 
- Directly impacts user experience and conversion rates
- Missing images create poor first impression
- Blocks user activation (users abandon wizard)
- High visibility issue (users see missing images immediately)

### Resource Requirements

- **Team**: Product Team (coordination), Engineering Team (script development), Design Team (quality review)
- **Budget**: GPU compute costs for image generation (~$500-1000 for full set)
- **External Dependencies**: ComfyUI pod access, RunPod GPU infrastructure

---

## Who (Stakeholders & Ownership)

### Initiative Owner

**Name**: Product Team  
**Role**: Product Manager  
**Responsibilities**: 
- Coordinate image generation priorities
- Review and approve image quality
- Ensure images meet user experience standards
- Track progress and completion

### Key Stakeholders

| Name | Role | Involvement | Responsibilities |
|------|------|-------------|------------------|
| Engineering Team | Developers | High | Develop/adapt generation scripts, optimize images, deploy assets |
| Design Team | Designers | High | Review image quality, ensure consistency, approve final assets |
| Dandrizy | Image Generation Specialist | High | Generate images using ComfyUI, ensure quality and appeal |
| Product Team | Product Managers | Medium | Define requirements, prioritize, track metrics |

### Teams Involved

- **Product Team**: Requirements, prioritization, quality review
- **Engineering Team**: Script development, automation, deployment
- **Design Team**: Quality review, consistency checks
- **Image Generation**: Dandrizy (specialist) for high-quality generation

### Communication Plan

- **Updates Frequency**: Weekly
- **Update Format**: Status report with sample images, progress metrics
- **Audience**: Product Team, Engineering Team, Design Team

---

## Success Criteria

### Primary Success Metrics

| Metric | Target | Measurement Method | Timeline |
|--------|--------|-------------------|----------|
| Image Coverage | 100% of wizard options have images | Count missing vs. total images | End of Phase 4 |
| Image Quality Score | > 4.5/5.0 average | Design team review scores | End of Phase 4 |
| Wizard Completion Rate | +15% increase | Analytics: wizard step completion | 2 weeks post-deployment |
| User Satisfaction | > 4.0/5.0 | User feedback survey | 1 month post-deployment |
| Image Load Time | < 1s per image | Performance monitoring | End of Phase 4 |

### Business Metrics Impact

**Target Metric**: [x] A-Activation [ ] B-Retention [x] C-Core Value [ ] D-Conversion [ ] E-CAC

**Expected Impact**:
- **A-Activation**: +15% wizard completion rate (users complete character creation)
- **C-Core Value**: +20% user engagement with wizard (more time spent, more options explored)

### Leading Indicators

- Image generation progress (images completed / total needed)
- Quality review pass rate (images approved / images reviewed)
- Script execution success rate (successful generations / total attempts)

### Lagging Indicators

- Wizard completion rate (users who complete character creation)
- Time to complete wizard (average time spent in wizard)
- User satisfaction scores (feedback on wizard experience)
- Conversion rate (wizard completion → subscription)

---

## Definition of Done

### Initiative Complete When:

- [ ] All ethnicity images generated (14 images: 7 ethnicities × 2 genders)
- [ ] All body type images generated (8 images: 4 female + 4 male)
- [ ] All ethnicity-specific hair styles generated (all ethnicities × all styles)
- [ ] All ethnicity-specific eye colors generated (all ethnicities × all colors)
- [ ] All ethnicity-specific hair colors generated (all ethnicities × all colors)
- [ ] All ethnicity-specific face shapes generated (all ethnicities × all shapes)
- [ ] All ethnicity-specific age ranges generated (all ethnicities × all age ranges)
- [ ] All images optimized (WebP format, < 100KB per image)
- [ ] All images reviewed and approved by design team
- [ ] All images deployed to production
- [ ] Image paths updated in codebase
- [ ] Documentation updated (image asset inventory)
- [ ] Metrics validated (wizard completion rate improvement)
- [ ] Stakeholders notified

### Not Done Criteria

**This initiative is NOT done if:**
- [ ] Any wizard option still shows placeholder/skeleton image
- [ ] Image quality is inconsistent or poor
- [ ] Images don't clearly focus on the specific feature
- [ ] Images are not optimized (file sizes too large)
- [ ] Ethnicity-specific variants are missing
- [ ] Base character images don't showcase appealing character
- [ ] Metrics don't show improvement in wizard completion

---

## Related Work

### Epics

| Epic | Name | Status | Link |
|------|------|--------|------|
| EP-033 | Base Character Image Generation | Not Started | `docs/requirements/epics/mvp/EP-033-base-character-image-generation.md` |
| EP-034 | Ethnicity Image Generation | Not Started | `docs/requirements/epics/mvp/EP-034-ethnicity-image-generation.md` |
| EP-035 | Body Type Image Generation | Not Started | `docs/requirements/epics/mvp/EP-035-body-type-image-generation.md` |
| EP-036 | Ethnicity-Specific Feature Images | Not Started | `docs/requirements/epics/mvp/EP-036-ethnicity-specific-feature-images.md` |
| EP-001 | Influencer Wizard | Active | `docs/requirements/epics/mvp/EP-001-influencer-wizard.md` |
| EP-005 | Content Studio | Active | `docs/requirements/epics/mvp/EP-005-content-studio.md` |

### Dependencies

- **Blocks**: None (can proceed independently)
- **Blocked By**: None
- **Related Initiatives**: 
  - IN-003 (SFW/NSFW Separation) - May need separate image sets for SFW/NSFW modes

### Documentation

- **Image Generation Scripts**: `scripts/generation/`
- **Wizard Requirements**: `docs/requirements/epics/mvp/EP-001-influencer-wizard.md`
- **Image Asset Inventory**: `apps/funnel/docs/AI_INFLUENCER_ASSETS_REQUIRED.md`
- **Image Optimization**: `docs/technical/IMAGE-OPTIMIZATION.md`

---

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation Strategy |
|------|------------|--------|-------------------|
| Image generation quality inconsistent | Medium | High | Quality review process, iterative refinement, use proven prompts |
| GPU compute costs exceed budget | Low | Medium | Monitor costs, batch generation efficiently, use cost-effective models |
| Ethnicity representation accuracy issues | Medium | High | Design team review, cultural sensitivity checks, iterative feedback |
| Image generation takes longer than expected | Medium | Medium | Parallel generation, efficient batching, prioritize critical images first |
| Images don't clearly focus on feature | Low | Medium | Clear prompt engineering, quality review, iterative refinement |
| Base character reference unavailable | Low | High | Generate base character first, use as reference for all other images |

---

## Progress Tracking

### Current Phase

**Phase**: Phase 1 - Base Character & Ethnicity Images  
**Status**: Not Started

### Recent Updates

- **2026-01-XX**: Initiative created, requirements defined

### Next Steps

1. Set up image generation environment (ComfyUI pod, scripts)
2. Generate base character reference images
3. Generate ethnicity images (Phase 1)
4. Quality review and refinement
5. Proceed to Phase 2 (Body Type Images)

---

## Technical Implementation Details

### Image Generation Approach

**Tools & Technologies:**
- **ComfyUI**: Image generation platform
- **Z-Image Turbo**: Fast image generation model
- **RunPod**: GPU infrastructure for ComfyUI
- **Existing Scripts**: Leverage `generate-studio-preset-thumbnails.ts` pattern

**Generation Scripts Needed:**
1. `generate-ethnicity-images.ts` - Generate ethnicity base images
2. `generate-body-type-images.ts` - Generate body type images
3. `generate-ethnicity-specific-assets.ts` - Generate hair, eyes, face variants
4. `optimize-wizard-images.ts` - Compress and optimize all images

### Image Specifications

**Dimensions:**
- **Ethnicity Images**: 768×960 (4:5 aspect ratio, matches UI)
- **Body Type Images**: 768×960 (4:5 aspect ratio)
- **Feature Images**: 768×960 (4:5 aspect ratio)

**Format:**
- **Output**: WebP format
- **Quality**: 80% (balance quality and file size)
- **Max File Size**: < 100KB per image
- **Compression**: Use Pillow/PIL for optimization

### Prompt Engineering

**Base Prompt Template:**
```
[Character Description], [Feature Focus], [Style], 8K hyper-realistic, photorealistic, professional photography, ultra high quality, extremely detailed, sharp focus, clean composition, studio lighting, editorial fashion photography, masterpiece, best quality
```

**Feature-Specific Prompts:**
- **Ethnicity**: Focus on clear ethnic features, attractive appearance, professional portrait
- **Body Type**: Focus on body shape, clear differentiation, attractive representation
- **Hair Styles**: Focus on hair style, clearly visible, attractive
- **Eye Colors**: Focus on eye color, close-up of eyes, clearly visible
- **Hair Colors**: Focus on hair color, clearly visible, attractive
- **Face Shapes**: Focus on face shape, clear facial structure, attractive

### Quality Standards

**Image Quality Checklist:**
- [ ] Clear focus on the specific feature (ethnicity, body type, etc.)
- [ ] Attractive, appealing appearance
- [ ] Professional quality (8K, photorealistic)
- [ ] Consistent style across all images
- [ ] Accurate representation (ethnicity, body type, etc.)
- [ ] No artifacts, distortions, or quality issues
- [ ] Proper lighting and composition
- [ ] Appropriate clothing/context for feature focus

---

## Lessons Learned

[To be filled during/after initiative completion]

### What Went Well

- [Learning 1]
- [Learning 2]

### What Could Be Improved

- [Learning 1]
- [Learning 2]

### Recommendations for Future Initiatives

- [Recommendation 1]
- [Recommendation 2]

---

## References

- [Character Wizard Epic](./docs/requirements/epics/mvp/EP-001-influencer-wizard.md)
- [Image Generation Scripts](./scripts/generation/)
- [Image Optimization Guide](./docs/technical/IMAGE-OPTIMIZATION.md)
- [AI Influencer Assets Required](./apps/funnel/docs/AI_INFLUENCER_ASSETS_REQUIRED.md)
- [ComfyUI Workflows](./workflows/)

---

**Template Version**: 1.0  
**Last Template Update**: 2026-01-XX
