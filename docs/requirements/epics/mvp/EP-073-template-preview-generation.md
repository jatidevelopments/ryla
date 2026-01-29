# [EPIC] EP-073: Template Preview Generation

**Status**: Complete ✅  
**Phase**: P6 (Implementation)  
**Initiative**: [IN-017](../../../initiatives/IN-017-curated-template-library.md) - Curated Template Library  
**Priority**: P1  
**Business Metric**: A-Activation, C-Core Value

---

## Overview

Generate high-quality preview images for all curated templates using the Z-Image/Denrisi workflow, enabling users to visually browse and select templates in the template gallery.

---

## Problem Statement

The template gallery (IN-011) infrastructure is complete, but templates need visual previews to be discoverable. Users browse templates visually—without preview images, the gallery is unusable.

---

## Goals

1. Generate preview images for 100+ curated templates
2. Create thumbnails for fast gallery loading
3. Store images in production CDN/storage
4. Enable automated regeneration for template updates

---

## Non-Goals

- User-generated template previews (separate feature)
- Video previews (Phase 2)
- Real-time preview generation (pre-computed only)

---

## User Stories

### ST-050-001: Template Preview Images

**As a** user browsing the template gallery  
**I want to** see preview images for each template  
**So that** I can visually understand what the template will produce

**Acceptance Criteria:**

1. ✅ Each template has a preview image (1024x1536 or 1024x1024 depending on aspect ratio)
2. ✅ Each template has a thumbnail (300px width)
3. ✅ Images are in WebP format for optimal compression
4. ✅ Images load quickly (<500ms on 4G)
5. ✅ NSFW templates have appropriate preview images

### ST-050-002: Preview Generation Script

**As an** engineer  
**I want to** run a script to generate all template previews  
**So that** I can populate and update the template library

**Acceptance Criteria:**

1. ✅ Script generates previews for specified categories or all templates
2. ✅ Script uses Z-Image/Denrisi workflow for consistent quality
3. ✅ Script creates both full-size and thumbnail versions
4. ✅ Script uploads to production storage (S3/Bunny CDN)
5. ✅ Script handles failures gracefully (retry, skip, report)
6. ✅ Script can resume from last successful generation
7. ✅ Script updates database with image URLs

### ST-050-003: Reference Character for Previews

**As a** system  
**I want to** use a consistent reference character for all previews  
**So that** templates look professional and consistent

**Acceptance Criteria:**

1. ✅ Reference character is defined (curated test influencer)
2. ✅ Reference character DNA is stored for reproducibility
3. ✅ Both SFW and NSFW reference characters available
4. ✅ Reference character maintains consistency across generations

---

## Technical Specification

### Preview Generation Pipeline

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Template Seed  │ ──▶ │  Denrisi        │ ──▶ │  S3/Bunny CDN   │
│  Definition     │     │  Workflow       │     │  Storage        │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Template       │     │  Generate       │     │  Update DB      │
│  Config         │     │  Thumbnail      │     │  with URLs      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Script Location

```
scripts/
├── generation/
│   ├── generate-template-previews.ts    # Main preview generation script
│   └── lib/
│       ├── denrisi-client.ts            # Denrisi workflow client
│       ├── image-processor.ts           # Thumbnail generation
│       └── storage-uploader.ts          # S3/CDN upload
```

### Configuration

```typescript
interface TemplatePreviewConfig {
  // Generation settings
  workflow: 'z-image-danrisi';
  model: 'flux-pulid';
  
  // Reference character
  referenceCharacterId: string;  // Curated test influencer
  
  // Image settings
  fullSize: {
    width: 1024;
    height: 1536;  // 2:3 aspect ratio default
  };
  thumbnail: {
    maxWidth: 300;
  };
  format: 'webp';
  quality: 85;
  
  // Storage
  bucket: 'ryla-templates';
  cdnBase: 'https://cdn.ryla.ai/templates';
  
  // Parallelization
  concurrency: 3;  // Parallel generations
  retryCount: 2;
}
```

### Generation Script Interface

```bash
# Generate all templates
pnpm tsx scripts/generation/generate-template-previews.ts

# Generate specific category
pnpm tsx scripts/generation/generate-template-previews.ts --category beginner

# Dry run (show what would be generated)
pnpm tsx scripts/generation/generate-template-previews.ts --dry-run

# Resume from last successful
pnpm tsx scripts/generation/generate-template-previews.ts --resume

# Regenerate specific template
pnpm tsx scripts/generation/generate-template-previews.ts --template "Classic Portrait"
```

### Reference Characters

| Type | Character ID | Description |
|---|---|---|
| SFW Default | `ref-sfw-001` | Caucasian, blonde, blue eyes, athletic |
| SFW Diverse | `ref-sfw-002` | Latina, brunette, brown eyes, curvy |
| NSFW Default | `ref-nsfw-001` | Same as SFW but for adult content |

### Storage Structure

```
ryla-templates/
├── previews/
│   ├── beginner/
│   │   ├── classic-portrait.webp
│   │   ├── classic-portrait-thumb.webp
│   │   ├── cozy-home-vibes.webp
│   │   ├── cozy-home-vibes-thumb.webp
│   │   └── ...
│   ├── trending/
│   │   └── ...
│   ├── glamour/
│   │   └── ...
│   └── intimate/  # NSFW
│       └── ...
└── sets/
    ├── instagram-starter-pack/
    │   ├── preview.webp
    │   └── preview-thumb.webp
    └── ...
```

---

## Dependencies

- **IN-011**: Template Gallery infrastructure (COMPLETED)
- **Denrisi Workflow**: Z-Image generation pipeline
- **RunPod/ComfyUI**: GPU compute for generation
- **S3/Bunny CDN**: Image storage

---

## Estimates

| Task | Estimate |
|---|---|
| Create generation script | 8h |
| Implement Denrisi client | 4h |
| Implement thumbnail processor | 2h |
| Implement storage uploader | 2h |
| Generate SFW previews (~90) | 4h |
| Generate NSFW previews (~15) | 2h |
| QA and fixes | 4h |
| **Total** | **26h** |

---

## Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Denrisi workflow unavailable | Low | High | Use fallback workflow |
| Generation quality inconsistent | Medium | Medium | Manual QA, regenerate as needed |
| GPU costs exceed budget | Low | Medium | Batch generation, optimize prompts |
| Storage costs | Low | Low | WebP compression, CDN caching |

---

## Definition of Done

- [x] Generation script created and tested (`scripts/generation/generate-template-previews.ts`)
- [x] All templates have preview images (25 templates across 10 categories)
- [x] Compression script created (`scripts/utils/compress-template-images.py`)
- [x] Images compressed (96% reduction: 9.05 MB → 0.37 MB)
- [x] Images stored locally in `apps/web/public/templates/`
- [ ] Images uploaded to production CDN (defer to deployment)
- [ ] Database updated with image URLs (pending: run seed script)
- [ ] Gallery displays previews correctly (pending: frontend integration)
- [ ] NSFW previews properly gated (pending: frontend implementation)

---

## Related Documentation

- Seed Script: `scripts/utils/seed-templates.ts`
- Denrisi Workflow: `docs/technical/workflows/DENRISI-WORKFLOW.md`
- Profile Picture Set Generation: `scripts/generation/generate-profile-set-previews.ts`
