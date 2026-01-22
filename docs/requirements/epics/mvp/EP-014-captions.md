# [EPIC] EP-014: AI Caption Generation

**Status**: Proposed
**Phase**: P2
**Created**: 2026-01-21
**Last Updated**: 2026-01-21


## Overview

Auto-generate captions for AI Influencer posts based on their personality, archetype, and the scene context. A key differentiator vs competitors — users get complete posts (image + caption) ready for export.

---

## Business Impact

**Target Metric**: C - Core Value

**Hypothesis**: When users receive AI-generated captions that match their AI Influencer's personality, they will save time and export more complete posts.

**Success Criteria**:
- Caption acceptance rate: **>60%** (used without major edit)
- Caption edit rate: **<40%**
- Export with caption: **>70%**
- Time saved: **~2 min per post** (estimated)

---

## Features

### F1: Caption Generation

- Generate 1 caption per image (MVP)
- Based on AI Influencer identity (archetype + personality + bio)
- Based on scene context (scene preset + environment)
- Max 280 characters (Twitter-friendly)

### F2: Caption Picker UI

- Shows generated caption after image generation
- Edit input field
- Skip option (no caption)
- Regenerate button

### F3: Archetype-Based Tone

| Archetype | Caption Tone | Example Style |
|-----------|--------------|---------------|
| Girl Next Door | Casual, relatable, warm | "Just a lazy Sunday ☀️ Who else loves mornings like this?" |
| Fitness Enthusiast | Motivational, energetic | "Rise and grind! 💪 No excuses today." |
| Luxury Lifestyle | Aspirational, elegant | "Living my best life ✨ Every moment is a memory." |
| Mysterious/Edgy | Cryptic, intriguing | "Some things are better left unsaid... 🖤" |
| Playful/Fun | Playful, emoji-rich | "Caught you looking! 😜 What's on your mind?" |
| Professional/Boss | Confident, inspiring | "Success isn't given, it's earned. Let's go. 🔥" |

### F4: Personality Trait Influence

| Trait | Caption Modifier |
|-------|------------------|
| Confident | Direct, assertive statements |
| Shy | More questions, softer tone |
| Bold | Strong statements, provocative |
| Flirty | Suggestive, playful innuendo |
| Classy | Refined, sophisticated language |
| Adventurous | Travel/experience references |
| Homebody | Comfort, cozy references |

### F5: Scene Context

| Scene | Caption Context |
|-------|-----------------|
| Professional portrait | Professional, business-oriented |
| Candid lifestyle | Authentic, everyday life |
| Fashion editorial | Style, fashion references |
| Fitness motivation | Workout, health references |
| Morning vibes | Morning routine, fresh start |
| Night out | Nightlife, glamour |
| Cozy at home | Relaxation, comfort |
| Beach day | Vacation, summer vibes |

### F6: Caption Storage

- Caption saved with post
- Track if caption was edited
- Track if caption was skipped

---

## Technical Architecture

### Caption Generation Flow

```
1. Image generation completes
2. System calls caption generation API
3. Build caption prompt from:
   - AI Influencer archetype
   - AI Influencer personality traits
   - AI Influencer bio (if available)
   - Scene preset
   - Environment preset
   - NSFW status (affects tone)
4. Call text AI model (GPT-4o-mini or Claude Haiku)
5. Receive caption
6. Store with post
7. Display in caption picker UI
```

### Caption Prompt Template

```typescript
function buildCaptionPrompt(
  influencer: AIInfluencer,
  scene: ScenePreset,
  environment: EnvironmentPreset,
  nsfw: boolean
): string {
  const identity = influencer.identity;
  
  return `
    Generate a social media caption for an AI influencer post.
    
    Character Profile:
    - Name: ${influencer.name}
    - Archetype: ${identity.archetype}
    - Personality: ${identity.personalityTraits.join(', ')}
    - Bio: ${identity.bio || 'Not provided'}
    
    Image Context:
    - Scene: ${scene}
    - Environment: ${environment}
    - Content type: ${nsfw ? 'Adult/Suggestive' : 'Safe for work'}
    
    Requirements:
    - Max 280 characters
    - Match the character's personality and archetype
    - Include 1-2 relevant emojis
    - ${nsfw ? 'Can be flirty/suggestive but not explicit' : 'Keep it clean and professional'}
    - Write in first person as the character
    - Make it engaging and authentic
    
    Generate only the caption, nothing else.
  `.trim();
}
```

### Model Selection

**Primary**: OpenAI GPT-4o-mini
- Fast, cheap (~$0.001 per caption)
- Good quality
- Handles NSFW appropriately

**Fallback**: Claude Haiku
- Alternative if OpenAI issues
- Similar cost/quality

### Cost Estimate

- ~$0.001-0.002 per caption
- 5 images = ~$0.01
- Negligible compared to image generation cost

---

## Acceptance Criteria

### AC-1: Caption Generation

- [ ] Caption generated for each image
- [ ] Caption uses AI Influencer personality
- [ ] Caption uses scene context
- [ ] Caption max 280 characters
- [ ] Caption includes 1-2 emojis

### AC-2: Caption Picker UI

- [ ] Caption displayed after generation
- [ ] User can edit caption
- [ ] User can regenerate caption
- [ ] User can skip caption
- [ ] Save button confirms selection

### AC-3: Archetype Influence

- [ ] Girl Next Door = casual, warm tone
- [ ] Fitness Enthusiast = motivational tone
- [ ] Luxury Lifestyle = aspirational tone
- [ ] Mysterious/Edgy = cryptic tone
- [ ] Playful/Fun = playful, emoji-rich
- [ ] Professional/Boss = confident tone

### AC-4: Caption Storage

- [ ] Caption saved with post
- [ ] Caption edit tracked
- [ ] Caption skip tracked
- [ ] Caption accessible in post gallery

---

## Analytics Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `caption_generated` | Caption API returns | `influencer_id`, `scene`, `archetype` |
| `caption_accepted` | User accepts as-is | `influencer_id`, `caption_length` |
| `caption_edited` | User modifies caption | `influencer_id`, `original_length`, `new_length` |
| `caption_regenerated` | User clicks regenerate | `influencer_id`, `attempt_number` |
| `caption_skipped` | User skips caption | `influencer_id` |

### Key Metrics

1. **Caption Acceptance Rate**: Accepted without edit / Total
2. **Caption Edit Rate**: Edited / Total
3. **Caption Skip Rate**: Skipped / Total
4. **Regeneration Rate**: Regenerate clicked / Total
5. **Average Caption Length**: Mean character count

---

## API Endpoints

```
POST /api/captions/generate
  Body: { 
    influencer_id,
    scene,
    environment,
    nsfw
  }
  Response: { caption, tokens_used }

POST /api/posts/:post_id/caption
  Body: { caption }
  Response: { success: true }
```

---

## Database Schema

```sql
-- Posts table already includes caption field (EP-005)
-- Additional tracking:

ALTER TABLE posts ADD COLUMN IF NOT EXISTS caption_source TEXT DEFAULT 'ai'; 
-- 'ai', 'edited', 'manual', 'skipped'

ALTER TABLE posts ADD COLUMN IF NOT EXISTS caption_regenerations INTEGER DEFAULT 0;
```

---

## Non-Goals (Phase 2+)

- Multiple caption options (pick from 3)
- Caption tone controls (adjust flirtiness, formality)
- Caption length controls (short/medium/long)
- Caption templates/presets
- Hashtag suggestions
- Caption A/B testing analytics
- Multi-language captions
- Caption scheduling hints

---

## Dependencies

- AI Influencer identity data (EP-001)
- Content Studio generation (EP-005)
- Text AI model API (OpenAI/Anthropic)
- Posts storage (EP-008)

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Caption quality inconsistent | Medium | Medium | Test all archetype/scene combos, refine prompts |
| NSFW captions inappropriate | Low | High | Clear prompt constraints, content filtering |
| API latency | Low | Low | Caption generation is fast (<1s) |
| Cost scaling | Low | Low | Captions are cheap (~$0.001 each) |

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

