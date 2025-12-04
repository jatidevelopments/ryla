# [EPIC] EP-005: Image Generation Engine

## Overview

Backend AI integration for generating consistent character images using external AI models.

---

## Business Impact

**Target Metric**: [x] C - Core Value

**Hypothesis**: When we generate consistent, high-quality character images quickly, users will see value and convert.

**Success Criteria**:
- Generation success rate: **>95%**
- Time to first image: **<30 seconds**
- Face consistency score: **>85%** (visual similarity)

---

## Features

### F1: Model Integration
- Connect to AI model provider (Replicate/Fal/RunPod)
- Send generation requests
- Receive generated images
- Handle model errors

### F2: Consistent Face Generation
- Seed locking for reproducibility
- Style consistency parameters
- Face embedding extraction
- Reference image usage

### F3: Image Pack Generation
- Generate multiple images per request
- Vary poses while maintaining face
- Batch processing
- Progress tracking

### F4: Queue Management
- Job queue for generation requests
- Priority handling (paid users)
- Rate limiting
- Retry failed jobs

### F5: Image Storage
- Upload generated images to storage
- Organize by character/user
- Generate thumbnails
- Cleanup orphaned images

---

## Acceptance Criteria

### AC-1: Basic Generation
- [ ] Can send prompt to AI model
- [ ] Receives generated image
- [ ] Image is stored successfully
- [ ] Errors are handled gracefully

### AC-2: Face Consistency
- [ ] Same character config produces similar faces
- [ ] Multiple generations are recognizably same person
- [ ] Seed/style parameters are stored per character

### AC-3: Image Packs
- [ ] Can generate 5-10 images in sequence
- [ ] All images maintain face consistency
- [ ] Progress is reported to client
- [ ] Partial success is handled (some images fail)

### AC-4: Queue & Performance
- [ ] Requests are queued properly
- [ ] Paid users get priority
- [ ] Failed jobs retry automatically
- [ ] Queue status is visible

### AC-5: Storage
- [ ] Images are stored in Supabase Storage
- [ ] Thumbnails are generated
- [ ] URLs are accessible from frontend
- [ ] Old/unused images can be cleaned up

---

## Analytics Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `generation_queued` | Job added to queue | `character_id`, `image_count` |
| `generation_started` | Model API called | `character_id`, `model` |
| `generation_completed` | Image received | `character_id`, `duration_ms` |
| `generation_failed` | Error occurred | `character_id`, `error_type` |
| `image_stored` | Uploaded to storage | `character_id`, `size_bytes` |
| `pack_completed` | All images done | `character_id`, `image_count`, `total_duration_ms` |

---

## Technical Architecture

### Model Provider Options

| Provider | Pros | Cons |
|----------|------|------|
| **Replicate** | Simple API, many models | Can be slow |
| **Fal.ai** | Fast, good quality | Newer, less docs |
| **RunPod** | Cheap, customizable | More setup |
| **Modal** | Serverless, fast | Learning curve |

*Decision: Start with Replicate for simplicity, migrate if needed.*

### Generation Flow
```
1. User completes wizard
2. Frontend calls POST /api/characters
3. Backend saves character config
4. Backend queues generation job
5. Worker picks up job
6. Worker calls AI model API
7. Worker downloads generated image
8. Worker uploads to Supabase Storage
9. Worker updates character with image URLs
10. Frontend polls for completion
11. Frontend shows generated images
```

### Prompt Engineering
```typescript
// libs/business/src/services/generation.service.ts
function buildPrompt(config: CharacterConfig): string {
  return `
    Portrait photo of a ${config.age_range[0]}-${config.age_range[1]} year old 
    ${config.ethnicity} woman with ${config.hair_color} ${config.hair_style} hair,
    ${config.eye_color} eyes, ${config.body_type} body type,
    wearing ${config.outfit_style}, professional photography,
    high quality, detailed skin texture, natural lighting
  `.trim()
}
```

### Consistency Strategy
```typescript
interface GenerationParams {
  prompt: string
  seed: number           // Fixed per character
  style_strength: number // How much to preserve style
  face_reference?: string // Base64 or URL of reference face
  negative_prompt: string
}
```

---

## API Endpoints

```
POST /api/generate
  Body: { character_id, image_count }
  Response: { job_id }

GET /api/generate/:job_id
  Response: { status, progress, images[] }

POST /api/generate/:job_id/cancel
  Response: { cancelled: true }
```

---

## Database Schema

```sql
CREATE TABLE generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID REFERENCES characters(id),
  user_id UUID REFERENCES users(id),
  status TEXT, -- 'queued', 'processing', 'completed', 'failed'
  image_count INTEGER,
  completed_count INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE character_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID REFERENCES characters(id),
  job_id UUID REFERENCES generation_jobs(id),
  storage_path TEXT,
  thumbnail_path TEXT,
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Non-Goals (Phase 2+)

- Video generation
- Real-time generation preview
- Custom model fine-tuning
- Multiple model selection
- NSFW model variants
- Image editing/inpainting

---

## Dependencies

- AI model provider account
- Supabase Storage configured
- Queue system (can start with simple polling)
- Character persistence (EP-001)

---

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Model quality insufficient | Medium | Test multiple models, have fallback |
| High latency | Medium | Queue system, progress feedback |
| Cost overruns | Medium | Rate limiting, paid user priority |
| Face inconsistency | High | Seed locking, face embedding |

