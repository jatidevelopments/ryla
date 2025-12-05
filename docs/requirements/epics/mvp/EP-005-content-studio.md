# [EPIC] EP-005: Content Studio & Generation

## Overview

The Content Studio is where users generate content for their AI Influencers. It combines scene presets, environment presets, and outfit options to create varied, consistent images with AI-generated captions.

> ⚠️ **Scope**: This epic covers content generation. AI Influencer creation is EP-001. Caption generation is EP-014.

---

## Terminology

| Term | Definition |
|------|------------|
| **Content Studio** | The workspace for generating content for an AI Influencer |
| **Scene Preset** | A pre-defined scenario (e.g., "beach photoshoot", "morning vibes") |
| **Environment Preset** | A location setting (e.g., beach, bedroom, office) |
| **Post** | An image + caption, ready for export |

---

## Business Impact

**Target Metric**: C - Core Value

**Hypothesis**: When users can easily generate varied content using scene and environment presets, they will create more posts and find value in the product.

**Success Criteria**:
- Generation success rate: **>95%**
- Time to first post: **<30 seconds**
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

### F6: AI Model Integration

- Connect to AI model provider (Replicate/Fal)
- Build prompt from: AI Influencer appearance + Scene + Environment + Outfit
- Send generation requests
- Receive and process generated images
- Handle model errors gracefully

### F7: Consistent Face Generation

- Seed locking for reproducibility per AI Influencer
- Style consistency parameters
- Same AI Influencer produces similar faces across generations
- Face reference system for consistency

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

### AC-7: Face Consistency

- [ ] Same AI Influencer produces similar faces
- [ ] Multiple generations are recognizably same person
- [ ] Seed is locked per AI Influencer
- [ ] Consistency maintained across sessions

### AC-8: Image Pack

- [ ] Can generate 1-10 images per request
- [ ] All images maintain face consistency
- [ ] Progress reported (X of Y complete)
- [ ] Partial success handled

---

## Analytics Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `studio_opened` | User opens Content Studio | `influencer_id` |
| `scene_selected` | Scene preset chosen | `scene`, `influencer_id` |
| `environment_selected` | Environment preset chosen | `environment`, `influencer_id` |
| `outfit_changed` | Outfit changed from default | `outfit`, `influencer_id` |
| `generation_started` | Generate clicked | `influencer_id`, `scene`, `environment`, `outfit`, `count`, `ratio`, `quality` |
| `generation_image_completed` | Single image done | `influencer_id`, `image_index`, `duration_ms` |
| `generation_pack_completed` | All images done | `influencer_id`, `image_count`, `total_duration_ms` |
| `generation_failed` | Error occurred | `influencer_id`, `error_type`, `retry_count` |

### Key Metrics

1. **Studio Opens**: How often users enter the Content Studio
2. **Generation Success Rate**: Successful / Total attempts
3. **Average Generation Time**: Mean time per image
4. **Scene Distribution**: Which scenes are most popular
5. **Environment Distribution**: Which environments are most used
6. **Outfit Change Rate**: % of generations with outfit change

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
1. User opens Content Studio from AI Influencer profile
2. User selects: Scene + Environment + Outfit + Options
3. Frontend: POST /api/generate with config
4. Backend: Validate user, AI Influencer, credits
5. Backend: Create generation job in database
6. Backend: Deduct credits
7. Worker: Pick up job from queue
8. Worker: Build prompt from config
9. Worker: Call AI model API (Replicate)
10. Worker: Download generated image
11. Worker: Upload to Supabase Storage
12. Worker: Generate thumbnail
13. Worker: Trigger caption generation (EP-014)
14. Worker: Update job status
15. Worker: Repeat for each image in pack
16. Worker: Mark job complete
17. Frontend: Poll for status, show progress
18. Frontend: Display completed images with captions
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
  Response: { job_id, status: 'queued', credits_used }

GET /api/generate/:job_id
  Response: { 
    status: 'queued' | 'processing' | 'completed' | 'failed',
    progress: { completed: 3, total: 5 },
    posts: [{ id, image_url, thumbnail_url, caption }],
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
  influencer_id UUID REFERENCES influencers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'queued', -- queued, processing, completed, failed
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

-- Indexes
CREATE INDEX idx_generation_jobs_status ON generation_jobs(status);
CREATE INDEX idx_generation_jobs_influencer ON generation_jobs(influencer_id);
CREATE INDEX idx_posts_influencer ON posts(influencer_id);
CREATE INDEX idx_posts_liked ON posts(influencer_id, liked);
```

---

## Non-Goals (Phase 2+)

- **Image Sequences** - Multi-scene stories (morning routine, etc.)
- **Full Wardrobe System** - Owned items, unlocking clothes
- **Custom Environments** - User-defined locations
- **Scene Builder** - Manual scene composition
- **Props/Items** - Objects in scenes
- Video generation
- Real-time generation preview
- Custom model fine-tuning
- Multiple model selection UI
- Advanced NSFW controls (beyond toggle)
- Image editing/inpainting
- Upscaling
- Face repair/enhancement
- LoRA/style presets

---

## Dependencies

- AI Influencer persistence (EP-001)
- User authentication (EP-002)
- Caption generation (EP-014)
- Credits system (EP-009)
- AI model provider account (Replicate)
- Supabase Storage configured

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
