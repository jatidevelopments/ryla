# [EPIC] EP-005: Image Generation Engine

## Overview

Backend AI integration for generating consistent character images. Core value driver for the MVP - this is what users pay for.

---

## Business Impact

**Target Metric**: C - Core Value

**Hypothesis**: When we generate consistent, high-quality character images quickly, users will see value and engage with the product.

**Success Criteria**:
- Generation success rate: **>95%**
- Time to first image: **<30 seconds**
- Face consistency score: **>85%** (visual similarity)
- Pack generation: **<2 minutes** (5 images)

---

## Features

### F1: AI Model Integration

- Connect to AI model provider (Replicate/Fal)
- Send generation requests with character config
- Receive and process generated images
- Handle model errors gracefully

### F2: Consistent Face Generation

- Seed locking for reproducibility
- Style consistency parameters
- Same character produces similar faces across generations
- Face reference system for consistency

### F3: Image Pack Generation

- Generate 5-10 images per request
- Vary poses while maintaining face consistency
- Sequential or parallel processing
- Progress tracking with real-time updates

### F4: Aspect Ratio Selection

User-selectable output dimensions:

| Ratio | Name | Dimensions | Use Case |
|-------|------|------------|----------|
| 1:1 | Square | 1024x1024 | Instagram feed, profile pics |
| 9:16 | Portrait | 768x1365 | Stories, TikTok, Reels |
| 2:3 | Tall | 819x1228 | Pinterest, general portrait |

### F5: Quality Mode Toggle

| Mode | Steps | Speed | Quality | Use Case |
|------|-------|-------|---------|----------|
| **Draft** | 20 | ~10s | Good | Preview, iteration |
| **High Quality** | 40 | ~30s | Best | Final images |

### F6: NSFW Model Routing

- Detect NSFW toggle from character config
- Route to appropriate model (SFW vs NSFW capable)
- Maintain content safety boundaries
- Store adult content in compliant storage

### F7: Queue Management

- Job queue for generation requests
- Retry failed jobs automatically (3 attempts)
- Rate limiting per user
- Status polling from frontend

### F8: Image Storage

- Upload generated images to Supabase Storage
- Generate thumbnails (300px width)
- Organize by user/character
- Return accessible URLs

---

## Acceptance Criteria

### AC-1: Basic Generation

- [ ] System sends prompt to AI model
- [ ] System receives generated image
- [ ] Image is stored in Supabase Storage
- [ ] URL is returned to frontend
- [ ] Errors handled gracefully with retry

### AC-2: Face Consistency

- [ ] Same character config produces similar faces
- [ ] Multiple generations are recognizably same person
- [ ] Seed is locked per character
- [ ] Consistency maintained across sessions

### AC-3: Image Pack

- [ ] Can generate 5-10 images per request
- [ ] All images maintain face consistency
- [ ] Progress reported to frontend (X of Y complete)
- [ ] Partial success handled (some fail, others succeed)

### AC-4: Aspect Ratios

- [ ] User can select 1:1, 9:16, or 2:3
- [ ] Generated images match selected ratio
- [ ] Default is 9:16 (portrait)
- [ ] Ratio stored with generation request

### AC-5: Quality Modes

- [ ] User can select Draft or High Quality
- [ ] Draft generates faster (~10s)
- [ ] High Quality generates slower but better (~30s)
- [ ] Quality setting affects model parameters

### AC-6: NSFW Routing

- [ ] NSFW toggle detected from character config
- [ ] NSFW requests route to appropriate model
- [ ] SFW requests produce non-adult content
- [ ] Adult content stored in compliant bucket

### AC-7: Queue & Performance

- [ ] Requests are queued properly
- [ ] Failed jobs retry automatically
- [ ] Status is pollable from frontend
- [ ] Queue handles concurrent requests

### AC-8: Storage

- [ ] Images stored in Supabase Storage
- [ ] Thumbnails generated automatically
- [ ] URLs are accessible from frontend
- [ ] Images organized by user/character

---

## Analytics Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `generation_started` | Job begins | `character_id`, `image_count`, `aspect_ratio`, `quality` |
| `generation_image_completed` | Single image done | `character_id`, `image_index`, `duration_ms` |
| `generation_pack_completed` | All images done | `character_id`, `image_count`, `total_duration_ms` |
| `generation_failed` | Error occurred | `character_id`, `error_type`, `retry_count` |
| `generation_retried` | Retry attempted | `character_id`, `attempt_number` |
| `nsfw_generation` | NSFW job started | `character_id` |
| `aspect_ratio_selected` | Ratio chosen | `ratio`, `character_id` |
| `quality_mode_selected` | Quality chosen | `mode`, `character_id` |

### Key Metrics

1. **Generation Success Rate**: Successful / Total attempts
2. **Average Generation Time**: Mean time per image
3. **NSFW Adoption**: % of generations with NSFW enabled
4. **Aspect Ratio Distribution**: Usage of each ratio option

---

## Technical Architecture

### Model Provider

**Primary**: Replicate
- Simple API
- Wide model selection
- Pay-per-use pricing
- Good documentation

**Fallback**: Fal.ai
- Faster generation
- Alternative if Replicate issues

### Generation Flow

```
1. Frontend: User clicks "Generate" in wizard/dashboard
2. Frontend: POST /api/generate with character_id, options
3. Backend: Validate user, character, and options
4. Backend: Create generation job in database
5. Backend: Queue job for processing
6. Worker: Pick up job from queue
7. Worker: Build prompt from character config
8. Worker: Call AI model API (Replicate)
9. Worker: Download generated image
10. Worker: Upload to Supabase Storage
11. Worker: Generate thumbnail
12. Worker: Update job status
13. Worker: Repeat for each image in pack
14. Worker: Mark job complete
15. Frontend: Poll for status, show progress
16. Frontend: Display completed images
```

### Prompt Engineering

```typescript
function buildPrompt(config: CharacterConfig, nsfw: boolean): string {
  const base = `
    ${config.style === 'realistic' ? 'Photo' : 'Anime illustration'} of a 
    ${config.age} year old ${config.ethnicity} ${config.gender === 'female' ? 'woman' : 'man'}
    with ${config.hairColor} ${config.hairStyle} hair,
    ${config.eyeColor} eyes, ${config.bodyType} body type,
    wearing ${config.outfit},
    professional photography, high quality, detailed
  `.trim();

  const negative = `
    deformed, blurry, bad anatomy, disfigured, poorly drawn face,
    mutation, mutated, extra limb, ugly, poorly drawn hands
  `.trim();

  return { prompt: base, negative_prompt: negative };
}
```

### Generation Parameters

```typescript
interface GenerationRequest {
  character_id: string;
  image_count: number;       // 5-10
  aspect_ratio: '1:1' | '9:16' | '2:3';
  quality_mode: 'draft' | 'hq';
}

interface GenerationParams {
  prompt: string;
  negative_prompt: string;
  seed: number;              // Fixed per character
  width: number;             // Based on aspect_ratio
  height: number;            // Based on aspect_ratio
  num_inference_steps: number; // 20 (draft) or 40 (hq)
  guidance_scale: number;    // 7.5
  scheduler: string;         // 'DPMSolverMultistep'
}
```

### Dimension Mapping

```typescript
const DIMENSIONS = {
  '1:1':  { width: 1024, height: 1024 },
  '9:16': { width: 768,  height: 1365 },
  '2:3':  { width: 819,  height: 1228 },
};

const QUALITY_STEPS = {
  'draft': 20,
  'hq': 40,
};
```

---

## API Endpoints

```
POST /api/generate
  Body: { character_id, image_count, aspect_ratio, quality_mode }
  Response: { job_id, status: 'queued' }

GET /api/generate/:job_id
  Response: { 
    status: 'queued' | 'processing' | 'completed' | 'failed',
    progress: { completed: 3, total: 5 },
    images: [{ id, url, thumbnail_url }],
    error?: string
  }

POST /api/generate/:job_id/cancel
  Response: { cancelled: true }
```

---

## Database Schema

```sql
-- Generation jobs
CREATE TABLE generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'queued', -- queued, processing, completed, failed
  image_count INTEGER NOT NULL,
  completed_count INTEGER DEFAULT 0,
  aspect_ratio TEXT NOT NULL,
  quality_mode TEXT NOT NULL,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Character images
CREATE TABLE character_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  job_id UUID REFERENCES generation_jobs(id),
  storage_path TEXT NOT NULL,
  thumbnail_path TEXT,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_generation_jobs_status ON generation_jobs(status);
CREATE INDEX idx_character_images_character ON character_images(character_id);
```

---

## Non-Goals (Phase 2+)

- Video generation
- Real-time generation preview
- Custom model fine-tuning
- Multiple model selection UI
- Advanced NSFW controls (beyond toggle)
- Image editing/inpainting
- Upscaling
- Face repair/enhancement
- Platform-specific dimensions (use aspect ratios instead)
- LoRA/style presets

---

## Dependencies

- AI model provider account (Replicate)
- Supabase Storage configured
- Character persistence (EP-001)
- User authentication (EP-002)

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Model quality insufficient | Medium | High | Test multiple models, have fallback provider |
| High latency | Medium | Medium | Queue system, progress feedback, quality modes |
| Cost overruns | Medium | High | Rate limiting, usage tracking |
| Face inconsistency | High | High | Seed locking, face reference system |
| NSFW content issues | Low | High | Clear ToS, compliant storage, model selection |

---

## Phase Checklist

- [x] P1: Requirements (this epic)
- [ ] P2: Stories created
- [ ] P3: Architecture design
- [ ] P4: UI skeleton
- [ ] P5: Tech spec
- [ ] P6: Implementation
- [ ] P7: Testing
- [ ] P8: Integration
- [ ] P9: Deployment
- [ ] P10: Validation
