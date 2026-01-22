# [EPIC] EP-005: Content Studio & Generation

**Status**: In Progress
**Phase**: P6
**Created**: 2026-01-21
**Last Updated**: 2026-01-21


> **Initiative**: [IN-006: LoRA Character Consistency System](../../../initiatives/IN-006-lora-character-consistency.md) (LoRA usage in generation)

## Overview

The Content Studio is where users generate images for their AI Influencers. It combines scene presets, environment presets, and outfit options to create varied, consistent images.

> ⚠️ **Scope**: This epic covers **image generation**. AI Influencer creation is EP-001.
>
> **MVP constraint**: "Posts" (image + caption as an export-ready entity) and caption generation (EP-014) are **Phase 2+**, not MVP.

---

## Terminology

| Term | Definition |
|------|------------|
| **Content Studio** | The workspace for generating content for an AI Influencer |
| **Scene Preset** | A pre-defined scenario (e.g., "beach photoshoot", "morning vibes") |
| **Environment Preset** | A location setting (e.g., beach, bedroom, office) |
| **Image Asset (MVP)** | A generated image saved to the user’s gallery/library with generation metadata |
| **Post (Phase 2+)** | An image + caption, ready for export |

---

## Business Impact

**Target Metric**: C - Core Value

**Hypothesis**: When users can easily generate varied images using scene and environment presets, they will create more images and find value in the product.

**Success Criteria**:
- Generation success rate: **>95%**
- Time to first image: **<30 seconds**
- Face consistency score: **>85%** (visual similarity)
- Pack generation: **<2 minutes** (5 images)
- Studio opens per user: **>5/week**

---

## Features

### F1: Content Studio UI

- Opens from AI Influencer profile
- Scene preset selector (dropdown/cards)
- Environment preset selector (dropdown/cards)
- Outfit change option
- Quality/Ratio/NSFW controls
- Credit cost preview
- Generate button

### F2: Scene Presets (8 options)

| Scene | Description | Prompt Context |
|-------|-------------|----------------|
| Professional portrait | Headshot style, confident, eye contact | "professional headshot style, confident pose, eye contact" |
| Candid lifestyle | Natural moment, authentic | "candid moment, natural pose, authentic lifestyle shot" |
| Fashion editorial | Dramatic, magazine quality | "fashion editorial style, dramatic pose, magazine quality" |
| Fitness motivation | Athletic, energetic | "fitness pose, athletic, energetic, motivational" |
| Morning vibes | Relaxed, fresh, natural light | "morning light, relaxed pose, fresh and natural" |
| Night out | Glamorous, sophisticated | "glamorous night look, sophisticated, elegant pose" |
| Cozy at home | Comfortable, intimate | "comfortable relaxed pose, cozy atmosphere, intimate" |
| Beach day | Summer vibes, relaxed | "beach lifestyle, relaxed pose, summer vibes" |

### F3: Environment Presets (7 options)

| Environment | Description | Prompt Context |
|-------------|-------------|----------------|
| Beach | Ocean, golden hour | "on a sunny beach, ocean in background, golden hour lighting" |
| Home - Bedroom | Cozy, natural light | "in a cozy bedroom, soft natural lighting, comfortable atmosphere" |
| Home - Living Room | Modern, warm | "in a stylish living room, modern decor, warm lighting" |
| Office | Professional, clean | "in a professional office setting, clean modern workspace" |
| Cafe | Trendy, warm interior | "in a trendy cafe, coffee shop ambiance, warm interior" |
| Urban Street | City, street style | "on a city street, urban environment, street style" |
| Studio | Plain background | "in a photography studio, clean background, professional lighting" |

### F4: Outfit Options

- **Keep current**: Use default outfit from AI Influencer
- **Change outfit**: Opens outfit picker (same 20 options as wizard)
- Per-generation only (doesn't change AI Influencer default)

### F5: Generation Options

| Option | Values | Default |
|--------|--------|---------|
| Aspect Ratio | 1:1, 9:16, 2:3 | 9:16 |
| Quality Mode | Draft, HQ | Draft |
| Image Count | 1, 5, 10 | 5 |
| NSFW | On/Off | From AI Influencer |

### F6: AI Model Integration (RunPod)

- Connect to RunPod serverless endpoints (self-hosted infrastructure)
- Build prompt from: AI Influencer appearance + Scene + Environment + Outfit
- **Primary Model**: Flux Dev (uncensored checkpoint for NSFW support)
- **Secondary Model**: Z-Image-Turbo (test in parallel, use if NSFW works for faster/cheaper generation)
- **Model Selection Logic**:
  - If LoRA ready: Use Flux Dev + Custom LoRA (HD mode)
  - If LoRA not ready: Use Flux Dev + IPAdapter FaceID (Face Swap mode)
- Send generation requests to RunPod
- Receive and process generated images
- Handle model errors gracefully
- **NSFW Support**: Use uncensored Flux Dev checkpoint when NSFW enabled
- **Decision Rationale**: See `docs/technical/MVP-MODEL-DECISION.md` for complete analysis

### F7: Consistent Face Generation (Hybrid Strategy)

**Tier 1: Face Swap (Instant - While LoRA Trains)**
- **Tech**: IPAdapter FaceID / PuLID (via RunPod)
- **Base Image**: Selected base image from wizard
- **Availability**: Immediate upon character creation (<15s)
- **Use Case**: Initial exploration, draft generations, rapid iteration while LoRA trains
- **Consistency**: ~80% face match
- **Status**: Available immediately, works until LoRA is ready

**Tier 2: HD (LoRA Trained)**
- **Tech**: Custom LoRA model (Flux Dev, trained on RunPod)
- **Availability**: Ready 15-45 mins after creation (background training)
- **Trigger**: Automatic background workflow:
  1. Character sheet generation from base image (background)
  2. LoRA training kickoff after character sheets ready (background)
- **Use Case**: Final high-quality exports, best consistency
- **Consistency**: >95% face match
- **Notification**: User notified when "HD Mode" is unlocked
- **Auto-switch**: System automatically uses LoRA when ready (seamless upgrade)

### F7a: Character Sheet Generation (Background)

- **Trigger**: Automatic after character creation (base image selected)
- **Input**: Selected base image from wizard
- **Process**: 
  - Generate 7-10 character variations using PuLID + ControlNet
  - Multiple angles (front, side, 3/4, back)
  - Different poses and expressions
  - Various lighting conditions
- **Output**: Character sheet images (7-10 images)
- **Storage**: Save to Supabase Storage
- **Status**: Background job, user can generate with face swap while this runs
- **Next Step**: Once complete, automatically kick off LoRA training

### F7b: LoRA Training (Background)

- **Trigger**: Automatic after character sheet generation completes
- **Input**: Character sheet images (7-10 images from F7a)
- **Process**:
  - Upload images to RunPod
  - Start LoRA training job on RunPod (flux-dev-lora-trainer template)
  - Training: 700 steps for face LoRA (~45 minutes)
  - Save trained LoRA model (.safetensors) to storage
- **Output**: Trained LoRA model + trigger word
- **Storage**: LoRA model stored in Supabase Storage
- **Status**: Background job, user can generate with face swap while this runs
- **Completion**: When ready, system automatically switches to LoRA for new generations

### F8: Image Pack Generation

- Generate 1-10 images per request
- Vary poses while maintaining face consistency
- Sequential or parallel processing
- Progress tracking with real-time updates

### F9: NSFW Model Routing

- Detect NSFW toggle from AI Influencer config
- Route to appropriate model (SFW vs NSFW capable)
- Maintain content safety boundaries
- Store adult content in compliant storage

### F10: Queue Management

- Job queue for generation requests
- Retry failed jobs automatically (3 attempts)
- Rate limiting per user
- Status polling from frontend

### F11: Image Storage

- Upload generated images to Supabase Storage
- Generate thumbnails (300px width)
- Organize by user/influencer
- Return accessible URLs

### F12: Image Editing (Inpainting) — MVP

Allow users to select an existing **image asset** and edit it by describing a change (e.g., “add a nano banana on the table”) and applying an **inpainting mask**.

- Source image is selected from the user’s gallery/library
- User supplies:
  - edit prompt (what to add/change)
  - optional negative prompt
  - mask (drawn in UI; white=edit, black=keep)
- Backend runs an inpaint workflow (ComfyUI Flux Fill / inpaint) and returns a new edited image asset
- The original image remains unchanged; the edited asset links back to the source (lineage)

---

## Prompt Engineering

### Prompt Structure

```typescript
function buildPrompt(
  influencer: AIInfluencer,
  scene: ScenePreset,
  environment: EnvironmentPreset,
  outfit: string
): PromptConfig {
  const appearance = influencer.appearance;
  
  const base = `
    ${appearance.style === 'realistic' ? 'Photo' : 'Anime illustration'} of a 
    ${appearance.age} year old ${appearance.ethnicity} ${appearance.gender === 'female' ? 'woman' : 'man'}
    with ${appearance.hairColor} ${appearance.hairStyle} hair,
    ${appearance.eyeColor} eyes, ${appearance.bodyType} body type,
    wearing ${outfit},
    ${getEnvironmentPrompt(environment)},
    ${getScenePrompt(scene)},
    professional photography, high quality, detailed
  `.trim();

  const negative = `
    deformed, blurry, bad anatomy, disfigured, poorly drawn face,
    mutation, mutated, extra limb, ugly, poorly drawn hands,
    bad fingers, extra fingers, missing fingers
  `.trim();

  return { prompt: base, negative_prompt: negative };
}
```

### Scene Prompts

```typescript
const SCENE_PROMPTS: Record<ScenePreset, string> = {
  'professional_portrait': 'professional headshot style, confident pose, eye contact',
  'candid_lifestyle': 'candid moment, natural pose, authentic lifestyle shot',
  'fashion_editorial': 'fashion editorial style, dramatic pose, magazine quality',
  'fitness_motivation': 'fitness pose, athletic, energetic, motivational',
  'morning_vibes': 'morning light, relaxed pose, fresh and natural',
  'night_out': 'glamorous night look, sophisticated, elegant pose',
  'cozy_home': 'comfortable relaxed pose, cozy atmosphere, intimate',
  'beach_day': 'beach lifestyle, relaxed pose, summer vibes',
};
```

### Environment Prompts

```typescript
const ENVIRONMENT_PROMPTS: Record<EnvironmentPreset, string> = {
  'beach': 'on a sunny beach, ocean in background, golden hour lighting',
  'home_bedroom': 'in a cozy bedroom, soft natural lighting, comfortable atmosphere',
  'home_living_room': 'in a stylish living room, modern decor, warm lighting',
  'office': 'in a professional office setting, clean modern workspace',
  'cafe': 'in a trendy cafe, coffee shop ambiance, warm interior',
  'urban_street': 'on a city street, urban environment, street style',
  'studio': 'in a photography studio, clean background, professional lighting',
};
```

---

## Acceptance Criteria

### AC-1: Content Studio Access

- [ ] User can open Content Studio from AI Influencer profile
- [ ] Studio shows AI Influencer name and avatar
- [ ] All generation options visible
- [ ] Credit cost calculated and displayed

### AC-2: Scene Selection

- [ ] User can select from 8 scene presets
- [ ] Scene affects generation prompt
- [ ] Visual cards or dropdown with descriptions
- [ ] Default: Professional portrait

### AC-3: Environment Selection

- [ ] User can select from 7 environment presets
- [ ] Environment affects generation prompt
- [ ] Visual cards or dropdown with descriptions
- [ ] Default: Studio (plain background)

### AC-4: Outfit Changes

- [ ] User can keep current outfit (default)
- [ ] User can change outfit from 20 options
- [ ] Outfit change applies to this generation only
- [ ] AI Influencer default outfit unchanged

### AC-5: Generation Options

- [ ] User can select aspect ratio (1:1, 9:16, 2:3)
- [ ] User can select quality mode (Draft/HQ)
- [ ] User can select image count (1, 5, 10)
- [ ] NSFW toggle visible if AI Influencer has it enabled

### AC-6: Generation Flow

- [ ] Generate button starts generation
- [ ] Progress indicator shows status
- [ ] Images appear as they complete
- [ ] Error handling with retry option
- [ ] Each completed image is saved as an **image asset** with structured metadata (scene, environment, outfit, aspect ratio, quality, nsfw)

### AC-7: Face Consistency

- [ ] Same AI Influencer produces similar faces
- [ ] Multiple generations are recognizably same person
- [ ] Face Swap mode works immediately (IPAdapter FaceID)
- [ ] LoRA mode automatically activates when ready
- [ ] Consistency maintained across sessions
- [ ] System seamlessly switches from Face Swap to LoRA (no user action needed)

### AC-8: Image Pack

- [ ] Can generate 1-10 images per request
- [ ] All images maintain face consistency
- [ ] Progress reported (X of Y complete)
- [ ] Partial success handled

### AC-9: Image Editing (Inpaint)

- [ ] User can select an existing image asset and open an “Edit” flow
- [ ] User can enter an edit prompt (e.g., “add a nano banana”)
- [ ] User can create/clear a mask (simple brush is sufficient for MVP)
- [ ] Clicking “Apply Edit” starts an inpaint job
- [ ] Progress indicator shown while job runs
- [ ] On success, a **new image asset** is created and shown in the gallery (source image unchanged)
- [ ] On failure, user sees an error and can retry (prompt/mask preserved)
- [ ] Edited image asset preserves the source’s structured metadata by default (scene, environment, outfit, aspect ratio, quality, nsfw)
- [ ] (Nice-to-have) Persist the edit mask for debugging/replay (store `editMaskS3Key`)

### AC-10: LoRA Integration with Z-Image/Denrisi

- [ ] System checks for ready LoRA model when generating with Z-Image/Denrisi workflow
- [ ] LoRA file automatically downloaded to ComfyUI pod if not present
- [ ] Trigger word automatically included in prompt when LoRA is used
- [ ] Z-Image/Denrisi workflow correctly applies LoRA via LoraLoader node
- [ ] Generation succeeds with LoRA applied (no errors)
- [ ] Face consistency improves when LoRA is used (>95% vs ~80% without)
- [ ] System falls back gracefully if LoRA unavailable (generates without LoRA)
- [ ] LoRA usage tracked in generation job metadata

---

## Analytics Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `studio_opened` | User opens Content Studio | `influencer_id`, `lora_status` |
| `scene_selected` | Scene preset chosen | `scene`, `influencer_id` |
| `environment_selected` | Environment preset chosen | `environment`, `influencer_id` |
| `outfit_changed` | Outfit changed from default | `outfit`, `influencer_id` |
| `generation_started` | Generate clicked | `influencer_id`, `scene`, `environment`, `outfit`, `count`, `ratio`, `quality`, `mode` (face_swap/lora) |
| `generation_image_completed` | Single image done | `influencer_id`, `image_index`, `duration_ms`, `mode` |
| `generation_pack_completed` | All images done | `influencer_id`, `image_count`, `total_duration_ms`, `mode` |
| `generation_failed` | Error occurred | `influencer_id`, `error_type`, `retry_count` |
| `character_sheet_generation_started` | Background job starts | `influencer_id`, `base_image_id` |
| `character_sheet_generation_completed` | Character sheets ready | `influencer_id`, `sheet_count`, `duration_ms` |
| `lora_training_started` | LoRA training begins | `influencer_id`, `sheet_count` |
| `lora_training_completed` | LoRA ready | `influencer_id`, `training_duration_ms`, `training_cost_cents` |
| `lora_mode_activated` | System switches to LoRA | `influencer_id`, `time_since_creation_ms` |
| `hd_mode_unlocked_notification` | User sees HD mode notification | `influencer_id`, `time_since_creation_ms` |
| `image_edit_opened` | User opens edit/inpaint for an image | `influencer_id`, `image_id` |
| `inpaint_started` | User starts an inpaint edit | `influencer_id`, `image_id`, `mask_coverage_pct` |
| `inpaint_completed` | Inpaint finished successfully | `influencer_id`, `image_id`, `duration_ms` |
| `inpaint_failed` | Inpaint failed | `influencer_id`, `image_id`, `error_type` |

### Key Metrics

1. **Studio Opens**: How often users enter the Content Studio
2. **Generation Success Rate**: Successful / Total attempts
3. **Average Generation Time**: Mean time per image
4. **Scene Distribution**: Which scenes are most popular
5. **Environment Distribution**: Which environments are most used
6. **Outfit Change Rate**: % of generations with outfit change

---

## User Stories

### ST-023: Open Content Studio

**As a** user with an AI Influencer  
**I want to** open the Content Studio for that AI Influencer  
**So that** I can generate new content for them

**AC**: AC-1

### ST-024: Choose a Scene Preset

**As a** user in the Content Studio  
**I want to** select a scene preset  
**So that** the generated image matches the scenario I’m going for

**AC**: AC-2

### ST-025: Choose an Environment Preset

**As a** user in the Content Studio  
**I want to** select an environment preset  
**So that** the generated image has the right location/backdrop

**AC**: AC-3

### ST-026: Change Outfit for a Single Generation

**As a** user generating content  
**I want to** optionally change the outfit for a single generation  
**So that** I get variety without changing my AI Influencer’s default outfit

**AC**: AC-4

### ST-027: Configure Generation Options

**As a** user generating content  
**I want to** choose aspect ratio, quality, count, and NSFW settings  
**So that** I can control output format and cost

**AC**: AC-5

### ST-028: Generate a Pack with Progress + Retry

**As a** user generating content  
**I want to** generate 1–10 images and see progress and errors  
**So that** I can reliably create content at scale

**AC**: AC-6, AC-8

### ST-029: Maintain Face Consistency (Auto Face Swap → LoRA)

**As a** user generating content over time  
**I want to** always get consistent faces across sessions  
**So that** my AI Influencer stays recognizable

**AC**: AC-7

### ST-030: Edit an Image via Inpainting

**As a** user refining an image  
**I want to** select an image and apply an edit prompt to a masked region  
**So that** I can add/remove elements (e.g., "add a nano banana") without regenerating from scratch

**AC**: AC-9

### ST-031: Use LoRA in Z-Image/Denrisi Workflow

**As a** user generating images  
**I want to** have my trained LoRA automatically used when generating with Z-Image/Denrisi workflow  
**So that** I get >95% face consistency in my generated images

**AC**: AC-10

**Note**: This story is part of [EP-038: LoRA Usage in Image Generation](../EP-038-lora-usage-in-generation.md), which covers LoRA integration across all workflows. This story focuses specifically on Z-Image/Denrisi as the first implementation target.

---

## Technical Architecture

### Model Provider

**Primary**: RunPod (Serverless Endpoints)
- GPU infrastructure for Flux Dev model
- Serverless endpoints (scale to 0 when idle)
- Cost-effective: $0.22/hr for RTX 3090, $0 when idle
- Direct model control (uncensored checkpoints for NSFW)

**Models Used**:
- **Base Model**: Flux Dev (uncensored checkpoint for NSFW)
- **Face Swap**: IPAdapter FaceID (while LoRA trains)
- **LoRA Training**: flux-dev-lora-trainer template on RunPod
- **Character Sheets**: PuLID + ControlNet (background generation)

**Infrastructure**:
- Serverless endpoints for image generation
- Persistent pods for LoRA training (or serverless with network volumes)
- Network volumes for model storage (LoRA models)

### Generation Flow

```
1. User opens Content Studio from AI Influencer profile
2. User selects: Scene + Environment + Outfit + Options
3. Frontend: POST /api/generate with config
4. Backend: Validate user, AI Influencer, credits
5. Backend: Check LoRA status (is character model trained?)
   - If LoRA ready: Use Flux Dev + Custom LoRA (HD mode, >95% consistency)
   - If LoRA not ready: Use Flux Dev + IPAdapter FaceID (Face Swap mode, ~80% consistency)
6. Backend: Create generation job in database
7. Backend: Deduct credits
8. Worker: Pick up job from queue
9. Worker: Build prompt from config
10. Worker: Call RunPod serverless endpoint
    - Model: Flux Dev (uncensored if NSFW enabled)
    - Face consistency: IPAdapter FaceID (if LoRA not ready) OR LoRA (if ready)
11. Worker: Download generated image
12. Worker: Upload to Supabase Storage
13. Worker: Generate thumbnail
14. Worker: (Phase 2+) Trigger caption generation (EP-014) if/when “posts” are introduced
15. Worker: Update job status
16. Worker: Repeat for each image in pack
17. Worker: Mark job complete
18. Frontend: Poll for status, show progress
19. Frontend: Display completed images (MVP)
```

### Background Workflow (Character Creation)

```
1. User selects base image in wizard
2. User clicks "Create AI Influencer"
3. Backend: Save character with base_image_id
4. Backend: Start background job queue:
   
   Job 1: Character Sheet Generation
   - Input: base_image_id
   - Process: Generate 7-10 variations using PuLID + ControlNet
   - Output: Character sheet images (7-10 images)
   - Status: lora_status = 'generating_sheets'
   
   Job 2: LoRA Training (starts after Job 1 completes)
   - Input: Character sheet images
   - Process: Train LoRA on RunPod (flux-dev-lora-trainer)
   - Training: 700 steps, ~45 minutes
   - Output: Trained LoRA model (.safetensors) + trigger word
   - Status: lora_status = 'training' → 'ready'
   
5. User can generate images immediately (Face Swap mode)
6. System automatically switches to LoRA when ready (seamless)
7. User notified: "HD Mode unlocked!" (optional notification)
```

### Data Model

```typescript
interface GenerationJob {
  id: string;
  influencerId: string;
  userId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  config: GenerationConfig;
  imageCount: number;
  completedCount: number;
  mode: 'face_swap' | 'lora'; // Which mode was used
  errorMessage?: string;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
}

interface CharacterSheetJob {
  id: string;
  influencerId: string;
  baseImageId: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  sheetImages: string[]; // URLs to generated character sheet images
  errorMessage?: string;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
}

interface LoraTrainingJob {
  id: string;
  influencerId: string;
  characterSheetJobId: string;
  status: 'pending' | 'training' | 'completed' | 'failed';
  runpodJobId?: string;
  modelUrl?: string; // URL to trained LoRA model
  triggerWord?: string;
  trainingSteps: number;
  trainingDurationMs?: number;
  trainingCostCents?: number;
  errorMessage?: string;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
}

interface GenerationConfig {
  scene: ScenePreset;
  environment: EnvironmentPreset;
  outfit: string;
  aspectRatio: '1:1' | '9:16' | '2:3';
  qualityMode: 'draft' | 'hq';
  nsfw: boolean;
}

type ScenePreset = 
  | 'professional_portrait'
  | 'candid_lifestyle'
  | 'fashion_editorial'
  | 'fitness_motivation'
  | 'morning_vibes'
  | 'night_out'
  | 'cozy_home'
  | 'beach_day';

type EnvironmentPreset = 
  | 'beach'
  | 'home_bedroom'
  | 'home_living_room'
  | 'office'
  | 'cafe'
  | 'urban_street'
  | 'studio';
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

### Image Generation

```
POST /api/generate
  Body: { 
    influencer_id,
    scene,
    environment,
    outfit,
    image_count,
    aspect_ratio,
    quality_mode
  }
  Response: { 
    job_id, 
    status: 'queued', 
    credits_used,
    mode: 'face_swap' | 'lora' // Which mode will be used
  }

GET /api/generate/:job_id
  Response: { 
    status: 'queued' | 'processing' | 'completed' | 'failed',
    progress: { completed: 3, total: 5 },
    mode: 'face_swap' | 'lora',
    images: [{ id, image_url, thumbnail_url }],
    error?: string
  }

POST /api/generate/:job_id/cancel
  Response: { cancelled: true }
```

### Background Jobs (Internal/Admin)

```
GET /api/influencers/:id/lora-status
  Response: {
    lora_status: 'pending' | 'generating_sheets' | 'training' | 'ready' | 'failed',
    character_sheet_job_id?: string,
    lora_training_job_id?: string,
    estimated_time_remaining_ms?: number,
    error_message?: string
  }

GET /api/influencers/:id/character-sheet-job/:job_id
  Response: {
    status: 'pending' | 'generating' | 'completed' | 'failed',
    sheet_count: number,
    sheet_images: string[],
    progress?: number, // 0-100
    error_message?: string
  }

GET /api/influencers/:id/lora-training-job/:job_id
  Response: {
    status: 'pending' | 'training' | 'completed' | 'failed',
    runpod_job_id?: string,
    progress?: number, // 0-100 (if available from RunPod)
    training_steps: number,
    estimated_completion?: string, // ISO timestamp
    error_message?: string
  }
```

### Webhooks (RunPod)

```
POST /api/webhooks/runpod/lora-training
  Body: RunPod webhook payload
  Response: { received: true }
  
  Handles:
  - Training job completion
  - Training job failure
  - Updates lora_training_jobs table
  - Updates influencers.lora_status
  - Notifies user (optional notification)
```

---

## Database Schema

```sql
-- Generation jobs
CREATE TABLE generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID REFERENCES influencers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'queued', -- queued, processing, completed, failed
  mode TEXT NOT NULL, -- 'face_swap' or 'lora'
  scene TEXT NOT NULL,
  environment TEXT NOT NULL,
  outfit TEXT NOT NULL,
  aspect_ratio TEXT NOT NULL,
  quality_mode TEXT NOT NULL,
  nsfw BOOLEAN DEFAULT FALSE,
  image_count INTEGER NOT NULL,
  completed_count INTEGER DEFAULT 0,
  error_message TEXT,
  credits_used INTEGER NOT NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Character sheet generation jobs (background)
CREATE TABLE character_sheet_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID REFERENCES influencers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  base_image_id UUID NOT NULL, -- Reference to selected base image
  status TEXT DEFAULT 'pending', -- pending, generating, completed, failed
  sheet_images TEXT[], -- Array of image URLs (7-10 images)
  sheet_count INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- LoRA training jobs (background)
CREATE TABLE lora_training_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID REFERENCES influencers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  character_sheet_job_id UUID REFERENCES character_sheet_jobs(id),
  status TEXT DEFAULT 'pending', -- pending, training, completed, failed
  runpod_job_id TEXT, -- RunPod job ID for tracking
  model_url TEXT, -- URL to trained LoRA model (.safetensors)
  trigger_word TEXT, -- Trigger word for LoRA activation
  training_steps INTEGER DEFAULT 700,
  training_duration_ms INTEGER,
  training_cost_cents INTEGER, -- Cost in cents
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Posts (images with captions)
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID REFERENCES influencers(id) ON DELETE CASCADE,
  job_id UUID REFERENCES generation_jobs(id),
  user_id UUID REFERENCES auth.users(id),
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  caption_edited BOOLEAN DEFAULT FALSE,
  liked BOOLEAN DEFAULT FALSE,
  scene TEXT NOT NULL,
  environment TEXT NOT NULL,
  outfit TEXT NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update influencers table (from EP-001)
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS base_image_id UUID;
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS base_image_url TEXT;
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS lora_status TEXT DEFAULT 'pending';
-- lora_status: 'pending', 'generating_sheets', 'training', 'ready', 'failed'

-- Indexes
CREATE INDEX idx_generation_jobs_status ON generation_jobs(status);
CREATE INDEX idx_generation_jobs_influencer ON generation_jobs(influencer_id);
CREATE INDEX idx_character_sheet_jobs_influencer ON character_sheet_jobs(influencer_id);
CREATE INDEX idx_character_sheet_jobs_status ON character_sheet_jobs(status);
CREATE INDEX idx_lora_training_jobs_influencer ON lora_training_jobs(influencer_id);
CREATE INDEX idx_lora_training_jobs_status ON lora_training_jobs(status);
CREATE INDEX idx_posts_influencer ON posts(influencer_id);
CREATE INDEX idx_posts_liked ON posts(influencer_id, liked);
```

---

## Non-Goals (Phase 2+)

- **Posts (image + caption as a first-class entity)** - keep MVP as image assets only
- **Caption generation** (EP-014) and caption editing flows
- Platform-specific export workflows tied to “posts”
- **Image Sequences** - Multi-scene stories (morning routine, etc.)
- **Full Wardrobe System** - Owned items, unlocking clothes
- **Custom Environments** - User-defined locations
- **Scene Builder** - Manual scene composition
- **Props/Items** - Objects in scenes
- Video generation
- Real-time generation preview
- Custom model fine-tuning (beyond LoRA)
- Multiple model selection UI
- Advanced NSFW controls (beyond toggle)
- Advanced image editing beyond basic inpainting (layers, multi-step pipelines, heavy tooling)
- Upscaling (Phase 2)
- Face repair/enhancement
- Multiple LoRA models per character
- Manual character sheet upload (auto-generation only)

---

## Dependencies

- AI Influencer persistence (EP-001) - **Must include base_image_id**
- User authentication (EP-002)
- Caption generation (EP-014) (Phase 2+)
- Credits system (EP-009)
- RunPod account and API key
- RunPod serverless endpoints configured
- RunPod flux-dev-lora-trainer template
- Supabase Storage configured
- Background job queue system (Bull/BullMQ)

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Model quality insufficient | Medium | High | Test multiple models, have fallback provider |
| High latency | Medium | Medium | Queue system, progress feedback, quality modes |
| Cost overruns | Medium | High | Rate limiting, usage tracking, credit system |
| Face inconsistency | High | High | Seed locking, face reference system |
| NSFW content issues | Low | High | Clear ToS, compliant storage, model selection |
| Scene/environment combos look bad | Medium | Medium | Test all combinations, curate presets |

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
