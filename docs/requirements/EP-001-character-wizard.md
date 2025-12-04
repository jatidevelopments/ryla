# [EPIC] EP-001: Character Creation Wizard

## Overview

The core funnel that takes users from landing to their first AI character. This is the primary activation flow and revenue driver.

---

## Business Impact

**Target Metric**: [x] A - Activation

**Hypothesis**: When we provide a streamlined wizard with consistent character generation and profile persistence, users will complete the funnel and convert to paid subscribers.

**Success Criteria**:

- Funnel start → generation: **>60%**
- Generation → payment: **>30%**
- Time to first character: **<10 minutes**

---

## Features

### F1: Multi-Step Wizard Framework

- Step-based navigation (next/back)
- Progress indicator
- Form state persistence (localStorage + server)
- Step validation before advancement

### F2: Character Configuration

- Ethnicity selection
- Age range
- Physical attributes (body type, hair, eyes)
- Style preferences (outfit, accessories)
- Voice selection (basic)

### F3: Character Generation

- AI image generation from configuration
- Consistent face across generations (seed locking)
- Loading state with progress indication
- Preview of generated character

### F4: Character Persistence

- Save character profile to database
- Retrieve and edit existing characters
- Character library (dashboard)

### F5: Image Pack Generation

- Generate multiple images of same character
- Different poses/outfits (same face)
- Download as ZIP or individual files

### F6: Payment Integration

- Subscription plan selection ($29/mo)
- Email capture
- Finby payment processing
- Success/failure handling

---

## Acceptance Criteria

### AC-1: Wizard Navigation

- [ ] User can navigate forward through all steps
- [ ] User can go back to previous steps
- [ ] Progress is visually indicated
- [ ] Form data persists when navigating back
- [ ] Validation prevents advancement with invalid data

### AC-2: Character Configuration

- [ ] User can select ethnicity from predefined options
- [ ] User can select age range (18-65)
- [ ] User can customize physical attributes
- [ ] User can preview selections before generation
- [ ] Configuration is saved to localStorage

### AC-3: Face Consistency

- [ ] Same configuration produces visually similar faces
- [ ] Character is recognizable across multiple generations
- [ ] Seed/style parameters are locked per character

### AC-4: Character Persistence

- [ ] Character profile is saved after generation
- [ ] User can access saved characters from dashboard
- [ ] Character can be regenerated with same settings
- [ ] Character data survives browser refresh

### AC-5: Image Pack

- [ ] User can generate 5+ images of same character
- [ ] Images maintain face consistency
- [ ] Images can be downloaded individually or as pack
- [ ] Generation status is clearly shown

### AC-6: Payment Flow

- [ ] User sees pricing ($29/mo) before generation completes
- [ ] Email is captured before payment
- [ ] Finby checkout works on mobile and desktop
- [ ] Success redirects to character dashboard
- [ ] Failure shows clear error message

---

## Analytics Acceptance Criteria

### Events Required

| Event                            | Trigger              | Properties                |
| -------------------------------- | -------------------- | ------------------------- |
| `funnel_entry_started`           | User lands on wizard | `source`, `utm_*`         |
| `funnel_step_viewed`             | Step becomes visible | `step_index`, `step_name` |
| `funnel_step_completed`          | User advances        | `step_index`, `form_data` |
| `character_generation_started`   | Generation begins    | `character_config`        |
| `character_generation_completed` | Generation finishes  | `duration_ms`, `success`  |
| `character_saved`                | Character persisted  | `character_id`            |
| `paywall_viewed`                 | Payment screen shown | `plan_options`            |
| `payment_initiated`              | User clicks pay      | `plan_id`, `amount`       |
| `payment_completed`              | Payment succeeds     | `plan_id`, `amount`       |
| `payment_failed`                 | Payment fails        | `error_type`              |

### Funnels to Create in PostHog

1. **Main Conversion Funnel**

   ```
   funnel_entry_started → funnel_step_completed (step 5) →
   character_generation_completed → payment_completed
   ```

2. **Step Drop-off Funnel**

   ```
   funnel_step_viewed → funnel_step_completed (per step)
   ```

3. **Payment Funnel**
   ```
   paywall_viewed → payment_initiated → payment_completed
   ```

---

## User Stories

### ST-001: Complete Wizard Flow

**As a** new user  
**I want to** create my first AI character through a guided wizard  
**So that** I can generate consistent AI influencer content

**AC**: AC-1, AC-2

### ST-002: Generate Consistent Character

**As a** user who completed configuration  
**I want to** generate a character that looks consistent  
**So that** I can use it across multiple images

**AC**: AC-3

### ST-003: Save My Character

**As a** user who generated a character  
**I want to** save it and access it later  
**So that** I don't lose my work

**AC**: AC-4

### ST-004: Download Image Pack

**As a** paying user  
**I want to** generate multiple images of my character  
**So that** I can post varied content on social platforms

**AC**: AC-5

### ST-005: Subscribe to Access Features

**As a** user who wants full access  
**I want to** pay for a subscription  
**So that** I can unlock all generation features

**AC**: AC-6

---

## Non-Goals (Phase 2+)

- Video generation
- Lip-sync / talking head
- Voice cloning
- Multi-character scenes
- Direct platform posting (OnlyFans, TikTok)
- Scheduled content publishing
- API access
- Team/agency features

---

## Dependencies

- Supabase database setup
- Finby account configuration
- AI model provider access (Replicate)
- PostHog project configured

---

## Technical Notes

### Data Model (Preview)

```typescript
interface Character {
  id: string;
  user_id: string;
  name: string;
  config: CharacterConfig;
  seed: string;
  created_at: Date;
  updated_at: Date;
}

interface CharacterConfig {
  ethnicity: string;
  age_range: [number, number];
  body_type: string;
  hair_style: string;
  hair_color: string;
  eye_color: string;
  outfit_style: string;
  // ... other attributes
}
```

### API Endpoints (Preview)

```
POST /api/characters - Create character
GET  /api/characters - List user's characters
GET  /api/characters/:id - Get character
PUT  /api/characters/:id - Update character
POST /api/characters/:id/generate - Generate images
POST /api/checkout - Create Finby session
POST /api/webhooks/finby - Handle payment
```

---

## Open Questions

1. How many configuration steps optimal? (Currently ~10 from funnel data)
2. What's the minimum viable image pack size? (5? 10?)
3. Should we allow character editing after generation?
4. Free tier: watermark vs. limited generations?

---

## Phase Checklist

- [x] P1: Requirements (this epic defined)
- [ ] P2: Scoping (GitHub issue created)
- [ ] P3: Architecture
- [ ] P4: UI Skeleton
- [ ] P5: Tech Spec
- [ ] P6: Implementation
- [ ] P7: Testing
- [ ] P8: Integration
- [ ] P9: Deployment
- [ ] P10: Validation
