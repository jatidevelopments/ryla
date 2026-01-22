# [INITIATIVE] IN-012: Curated Template Library

**Status**: Draft  
**Created**: 2026-01-19  
**Last Updated**: 2026-01-19  
**Owner**: Product Team  
**Stakeholders**: Engineering, Design, Content

---

## Executive Summary

**One-sentence description**: Populate the template gallery with high-quality, curated templates and template sets that users can immediately apply to generate professional content for their AI influencers.

**Business Impact**: A-Activation, C-Core Value

---

## Why (Business Rationale)

### Problem Statement

Users struggle to achieve high-quality content generation because:

1. **Empty gallery**: New users see an empty or sparsely populated template gallery
2. **Decision paralysis**: Too many manual options (scene, outfit, pose, lighting) overwhelms first-time creators (93% are beginners)
3. **No best practices**: Users don't know which combinations work well together
4. **Slow time-to-value**: Users spend time figuring out settings instead of generating content
5. **Missed opportunity**: We have 70 outfits, 105+ poses, 28 scenes, 40 visual styles, 26 lighting options—but they're not curated into ready-to-use templates

### Current State

- IN-011 completed: Template gallery infrastructure exists (templates, template sets, categories, tags, likes)
- Seed script exists (`scripts/utils/seed-templates.ts`) with curated template definitions
- Profile picture set workflow exists with 3 starter sets (Classic Influencer, Professional Model, Natural Beauty)
- Assets exist but are not generating preview images or populating the database
- Users see an empty or minimal template gallery

### Desired State

- **100+ Curated Templates**: Pre-built, proven templates across all categories
- **20+ Template Sets**: Multi-image collections for consistent content packs
- **Visual Previews**: All templates have high-quality preview images
- **Category Coverage**: Templates for every user need (beginner, trending, professional, fitness, glamour, beach, nightlife, artistic, fantasy, intimate)
- **Data-Driven Selection**: Templates based on what works for monetization (OnlyFans, Fanvue)

### Business Drivers

From MVP-SCOPE.md and ICP-PERSONAS.md:

| User Insight | Source | Template Implication |
|---|---|---|
| **39% want AI OnlyFans** | ICP Personas | Include intimate/NSFW templates prominently |
| **72% enable NSFW** | Funnel data | NSFW templates should be well-represented |
| **93% are first-timers** | User research | Beginner-friendly templates are critical |
| **37% prefer thick body types** | US data | Templates should work with diverse body types |
| **31% prefer date night glam** | US data | Glamour templates should be featured |
| **Scene presets (8) + Environment presets (7)** | MVP scope | All combinations should have templates |

### Revenue Impact

- **Faster activation**: Users generate content immediately → higher conversion
- **Higher quality output**: Curated combinations → better results → more sharing
- **Reduced support burden**: Templates guide users → fewer "how do I..." questions

---

## How (Approach & Strategy)

### Strategy

1. **Leverage Existing Assets**: Use the 70 outfits, 105+ poses, 28 scenes, 40 styles, 26 lighting options defined in the seed script
2. **Generate Preview Images**: Use Z-Image/Tenerisi workflow to generate high-quality preview images for each template
3. **Create Template Sets**: Bundle related templates into sets (like profile picture sets)
4. **Prioritize by Use Case**: Start with most popular categories (beginner, trending, glamour, intimate)
5. **Automate Seeding**: Run seed script to populate database with all templates

### Key Principles

- **Quality over Quantity**: Better to have 50 excellent templates than 200 mediocre ones
- **User Journey Focused**: Templates should map to user goals (OnlyFans content, Instagram content, professional shots)
- **Proven Combinations**: Use combinations that work well together (not random permutations)
- **Visual-First**: Templates are discovered visually—preview quality is critical
- **Mobile-Optimized**: Templates should work well in 9:16 (Stories) and 1:1 (Feed) formats

### Template Categories (from seed script)

| Category | Target Count | Description | NSFW |
|---|---|---|---|
| **Beginner** | 10 | Safe, proven templates for first-time users | ❌ |
| **Trending** | 15 | TikTok, Clean Girl, Cottagecore, Coquette, Y2K | ❌ |
| **Professional** | 10 | LinkedIn, business, office aesthetic | ❌ |
| **Fitness** | 10 | Gym, yoga, wellness content | ❌ |
| **Glamour** | 15 | Date night, red carpet, fashion | ❌ |
| **Beach & Summer** | 10 | Beach, pool, vacation content | ❌ |
| **Nightlife** | 10 | Club, neon, party aesthetic | ❌ |
| **Artistic** | 10 | Cyberpunk, vaporwave, creative | ❌ |
| **Fantasy & Cosplay** | 10 | Anime, bunny, costume content | ❌ |
| **Intimate/Adult** | 15+ | Bedroom, lingerie, sensual (NSFW) | ✅ |

**Total: ~105 individual templates**

### Template Set Categories

Based on profile picture set pattern:

| Set Name | Templates in Set | Description | NSFW |
|---|---|---|---|
| **Instagram Starter Pack** | 8 | Mix of feed and story formats | ❌ |
| **OnlyFans Essentials** | 10 | Mix of SFW teasers + NSFW content | ✅ |
| **Professional Portfolio** | 6 | Business-ready headshots and poses | ❌ |
| **Beach Day Collection** | 7 | Various beach scenes and outfits | ❌ |
| **Date Night Series** | 6 | Evening and glamour looks | ❌ |
| **Fitness Journey** | 8 | Gym, yoga, and active content | ❌ |
| **Cozy Home Vibes** | 6 | At-home lifestyle content | ❌ |
| **Bedroom Collection** | 8 | Intimate and sensual content | ✅ |
| **Fantasy Roleplay** | 8 | Cosplay and costume content | ❌ |
| **Street Style Pack** | 7 | Urban and streetwear content | ❌ |

**Total: ~20 template sets**

### Phases

#### Phase 1: Template Preview Generation (Week 1)

| Task | Description | Estimate |
|---|---|---|
| Update seed script | Remove deprecated qualityMode, add categoryId references | 2h |
| Create preview generation script | Use Z-Image/Tenerisi workflow to generate template previews | 8h |
| Generate SFW previews | Run generation for ~90 SFW templates | 4h |
| Generate NSFW previews | Run generation for ~15 NSFW templates | 2h |
| Upload to CDN/storage | Store preview images in production storage | 2h |

**Deliverables**: High-quality preview images for all templates

#### Phase 2: Database Seeding (Week 1-2)

| Task | Description | Estimate |
|---|---|---|
| Update template configs | Ensure all templates have proper config fields | 4h |
| Assign categories | Map templates to IN-011 template_categories | 2h |
| Add tags | Tag templates for AI auto-tagging system | 2h |
| Run seed script | Populate database with all templates | 2h |
| Verify data | Check templates appear correctly in gallery | 2h |

**Deliverables**: All templates seeded in production database

#### Phase 3: Template Set Creation (Week 2)

| Task | Description | Estimate |
|---|---|---|
| Define set configurations | Create template set definitions with member templates | 4h |
| Create set preview images | Generate composite previews for sets | 4h |
| Create seed-template-sets script | Script to seed template_sets and template_set_members | 4h |
| Run set seeding | Populate database with template sets | 2h |
| Test set application | Verify sets work in gallery and studio | 2h |

**Deliverables**: 20+ template sets in production

#### Phase 4: Quality Assurance & Launch (Week 2-3)

| Task | Description | Estimate |
|---|---|---|
| QA template gallery | Test all templates work correctly | 4h |
| Performance testing | Ensure gallery loads quickly with 100+ templates | 2h |
| Analytics setup | Track template usage patterns | 2h |
| Documentation | Update user-facing template documentation | 2h |
| Launch | Enable curated templates for all users | 1h |

**Deliverables**: Production-ready template library

---

## When (Timeline & Priority)

### Timeline

- **Start Date**: 2026-01-20
- **Target Completion**: 2026-02-07
- **Key Milestones**:
  - Phase 1 Complete (preview images): 2026-01-24
  - Phase 2 Complete (templates seeded): 2026-01-28
  - Phase 3 Complete (template sets): 2026-02-03
  - Phase 4 Complete (launch): 2026-02-07

### Priority

**Priority Level**: P1

**Rationale**: Template gallery is useless without content. Users need inspiration and proven configurations to succeed. This directly impacts activation (A-metric) and core value delivery (C-metric).

### Resource Requirements

- **Team**: Engineering (1), Content (0.5)
- **Compute**: GPU time for preview generation (~200 images)
- **Storage**: CDN/S3 for preview images (~500MB)

---

## Who (Stakeholders & Ownership)

### Initiative Owner

**Name**: Engineering Team  
**Role**: Technical Lead  
**Responsibilities**: Implement generation pipeline, seed database

### Key Stakeholders

| Name | Role | Involvement | Responsibilities |
|---|---|---|---|
| Product | Feature definition | Medium | Approve template selection, categories |
| Engineering | Implementation | High | Scripts, generation, seeding |
| Content | Quality review | Medium | Review template names, descriptions |

---

## Success Criteria

### Primary Success Metrics

| Metric | Target | Measurement Method | Timeline |
|---|---|---|---|
| Templates in gallery | 100+ | Database count | Week 2 |
| Template sets in gallery | 20+ | Database count | Week 3 |
| Template usage rate | >30% of generations use templates | PostHog analytics | Week 4+ |
| Template category coverage | All 10 categories have templates | Database check | Week 2 |

### Business Metrics Impact

**Target Metric**: [x] A-Activation [x] C-Core Value [ ] B-Retention [ ] D-Conversion [ ] E-CAC

**Expected Impact**:
- **A-Activation**: +20% (users generate content immediately with templates)
- **C-Core Value**: +15% (higher quality generations from proven combinations)

---

## Definition of Done

### Initiative Complete When:

- [ ] 100+ curated templates with preview images seeded to production
- [ ] 20+ template sets created and seeded
- [ ] All templates properly categorized and tagged
- [ ] Gallery loads quickly (<2s) with full template library
- [ ] Analytics tracking template usage
- [ ] Templates appear correctly on all devices (mobile/desktop)

### Not Done Criteria

**This initiative is NOT done if:**

- [ ] Preview images are missing or low quality
- [ ] Templates don't have proper category/tag assignments
- [ ] Template sets are not functional
- [ ] Gallery performance degrades with full library
- [ ] NSFW templates are not properly gated

---

## Related Work

### Epics

| Epic | Name | Status | Link |
|---|---|---|---|
| EP-050 | Template Preview Generation | Draft | TBD |
| EP-051 | Template Database Seeding | Draft | TBD |
| EP-052 | Template Set Seeding | Draft | TBD |

### Dependencies

- **IN-011**: Template Gallery & Content Library (COMPLETED)
- **Profile Picture Sets**: Reference implementation for set workflow
- **Z-Image/Tenerisi Workflow**: Image generation pipeline

### Documentation

- Seed Script: `scripts/utils/seed-templates.ts`
- Profile Picture Sets: `docs/technical/systems/PROFILE-PICTURE-SETS.md`
- Template Categories: `docs/specs/general/TEMPLATE-CATEGORIES.md`

---

## Technical Implementation

### Existing Assets to Use

From `scripts/utils/seed-templates.ts`:

```typescript
// 70 Outfit Options
const OUTFIT_CATEGORIES = {
  casual: ['Casual Streetwear', 'Athleisure', 'Yoga', ...], // 10
  glamour: ['Date Night Glam', 'Cocktail Dress', ...],     // 10
  intimate: ['Bikini', 'Lingerie', 'Swimsuit', ...],       // 10
  fantasy: ['Cheerleader', 'Nurse', 'Maid', ...],          // 10
  kinky: ['Bondage Gear', 'Leather Outfit', ...],          // 15
  sexual: ['Nude', 'Topless', ...],                        // 15
};

// 105+ Pose Options
const SFW_POSES = [/* 30 poses */];
const ADULT_POSES = [/* 20 poses */];

// 28 Scene Options
const SCENES = {
  nature: ['beach-sunset', 'mountain-view', ...],    // 8
  indoor: ['cozy-cafe', 'luxury-bedroom', ...],      // 9
  urban: ['city-rooftop', 'neon-alley', ...],       // 7
  studio: ['white-studio', 'dark-studio'],          // 2
  fantasy: ['cyberpunk-city', 'enchanted-forest', ...], // 6
};

// 40 Visual Style Options
const VISUAL_STYLES = {
  camera: ['iphone', 'digitalcam', 'polaroid', ...],
  trending: ['cottagecore', 'clean-girl'],
  instagram: ['flight-mode', 'bimbocore', ...],
  // ...
};

// 26 Lighting Options
const LIGHTING = {
  natural: ['natural-daylight', 'blue-hour', ...],
  golden_hour: ['golden-hour', 'sunset-glow'],
  studio: ['studio-softbox', 'ring-light', ...],
  // ...
};
```

### Preview Generation Workflow

1. **Use Z-Image/Tenerisi** workflow for consistent, high-quality generation
2. **Use reference character** (curated test character) for previews
3. **Generate at 1024x1536** (2:3 aspect ratio) for quality
4. **Create thumbnails** at 300px width
5. **Store in S3/CDN** with proper caching

```bash
# Example generation command
pnpm tsx scripts/generate-template-previews.ts \
  --workflow z-image-danrisi \
  --category beginner \
  --output ./assets/templates/
```

### Template Set Structure

Based on profile picture set pattern:

```typescript
interface TemplateSetSeed {
  id: string;
  name: string;
  description: string;
  category: string;
  contentType: 'image' | 'mixed';
  isPublic: true;
  isCurated: true;
  members: Array<{
    templateId: string;  // Reference to template
    orderPosition: number;
  }>;
  previewImageUrl: string;
  thumbnailUrl: string;
}
```

### Database Seeding Process

1. **Seed categories** (already done in IN-011)
2. **Seed templates** with category references
3. **Seed template sets** with member references
4. **Refresh trending view** to include new templates

```bash
# Seeding commands
pnpm tsx scripts/utils/seed-templates.ts
pnpm tsx scripts/utils/seed-template-sets.ts
```

---

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Preview generation takes too long | Medium | Medium | Use fast workflow, parallelize |
| Preview quality is inconsistent | Low | High | Use reference character, manual review |
| Storage costs escalate | Low | Low | Optimize image sizes, use WebP |
| Category mismatch | Low | Low | Manual review before seeding |

---

## Progress Tracking

### Current Phase

**Phase**: Not Started  
**Status**: Initiative document created

### Next Steps

1. Create EP-050 epic for template preview generation
2. Update seed script to remove qualityMode
3. Create preview generation script
4. Generate first batch of previews

---

**Template Version**: 1.0  
**Last Template Update**: 2026-01-19
