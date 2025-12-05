# [EPIC] EP-001: AI Influencer Creation Wizard

## Overview

6-step wizard for creating and customizing AI Influencers. Core activation flow for the MVP product.

> ⚠️ **Scope**: This epic covers the **product wizard only**. Payment is handled separately in EP-003 (funnel/).

---

## Terminology

| Term | Definition |
|------|------------|
| **AI Influencer** | A persistent AI-generated persona with fixed appearance + identity |
| **Default Outfit** | The initial outfit selected in wizard, can be changed per generation |

---

## Business Impact

**Target Metric**: A - Activation

**Hypothesis**: When users can easily customize and preview their AI Influencer through a streamlined wizard, they will complete creation and engage with the Content Studio.

**Success Criteria**:
- Wizard start → completion: **>70%**
- Time to first AI Influencer: **<10 minutes**
- Form abandonment: **<30%**

---

## 6-Step Wizard Flow

```
Step 1: Style     → Gender + Style (Realistic/Anime)
Step 2: General   → Ethnicity + Age
Step 3: Face      → Hair style + Hair color + Eye color
Step 4: Body      → Body type + (Breast size if female)
Step 5: Identity  → Outfit + Archetype + Personality traits + Bio
Step 6: Generate  → Preview config + Generate button
```

---

## Features

### F1: Multi-Step Wizard Framework

- Step-based navigation (next/back)
- Progress indicator (step X of 6)
- Form state persistence (localStorage)
- Step validation before advancement
- Resume from last completed step

### F2: Step 1 - Style Selection

- Gender selection (Female/Male)
- Style selection (Realistic/Anime)
- Visual cards with preview images
- Single selection per option

### F3: Step 2 - General Attributes

- Ethnicity selection (7 options)
- Age slider (18-65)
- Visual ethnicity cards
- Age displayed numerically

**Ethnicity Options:**
- Asian
- Black/African
- White/Caucasian
- Latina
- Arab
- Indian
- Mixed

### F4: Step 3 - Face Details

- Hair style selection (7 options, gender-filtered)
- Hair color selection (7 options)
- Eye color selection (6 options)
- Visual option cards

**Hair Styles (Female):** Long, Short, Braids, Ponytail, Bangs, Bun, Wavy

**Hair Styles (Male):** Short, Medium, Long, Buzzcut, Slicked, Curly, Fade

**Hair Colors:** Black, Brown, Blonde, Red, Auburn, Gray, White

**Eye Colors:** Brown, Blue, Green, Hazel, Gray, Amber

### F5: Step 4 - Body Configuration

- Body type selection (4 options)
- Breast size selection (female only, 5 options)
- Visual option cards
- Gender-conditional display

**Body Types:** Slim, Athletic, Curvy, Voluptuous

> **Note**: US users prefer curvy/voluptuous (37%) — prioritize in UI ordering.

### F6: Step 5 - Identity & Style

This step creates the AI Influencer's **identity** — who they are beyond appearance.

#### Default Outfit Selection
- 20 outfit options with visual cards
- Organized by category
- This becomes the "default" outfit (can be changed per generation in Content Studio)

**Outfit Categories:**
- Casual: Streetwear, Athleisure, Yoga, Jeans, Tank top, Crop top
- Glamour: Date night glam, Cocktail dress, Mini skirt, Dress, Summer chic
- Intimate: Bikini, Lingerie, Swimsuit, Nightgown, Leotard
- Fantasy: Cheerleader, Nurse, Maid, Student uniform, Business

> **Note**: US users prefer "date night glam" (31%) — feature prominently.

#### Archetype Selection
- AI Influencer "vibe" or persona type
- Visual cards with descriptions
- Single selection
- **Affects caption tone generation**

**Archetypes:**
| Archetype | Description | Vibe | Caption Style |
|-----------|-------------|------|---------------|
| Girl Next Door | Relatable, friendly, approachable | Warm, authentic | Casual, relatable |
| Fitness Enthusiast | Active, healthy, motivational | Energetic, disciplined | Motivational, energetic |
| Luxury Lifestyle | Glamorous, aspirational, sophisticated | Polished, exclusive | Aspirational, elegant |
| Mysterious/Edgy | Intriguing, bold, unconventional | Dark, artistic | Cryptic, intriguing |
| Playful/Fun | Bubbly, entertaining, spontaneous | Light, flirty | Playful, emojis |
| Professional/Boss | Ambitious, confident, successful | Powerful, inspiring | Confident, inspiring |

#### Personality Traits
- Pick 3 personality traits
- Multi-select (exactly 3 required)
- **Traits influence caption generation tone**

**Trait Options:**
| Category | Traits |
|----------|--------|
| Energy | Confident, Shy, Bold, Laid-back |
| Social | Playful, Mysterious, Caring, Independent |
| Lifestyle | Adventurous, Homebody, Ambitious, Creative |
| Vibe | Flirty, Classy, Edgy, Sweet |

#### AI Influencer Bio
- Optional short text field (max 200 chars)
- Placeholder: "A short bio for your AI Influencer..."
- Used for: Brand consistency, caption context
- Example: "Luna is a 25-year-old fitness coach from Miami who loves sunrise workouts and motivating others."

### F7: Step 6 - Preview & Generate

- Summary of all selections
- Visual preview (placeholder or live)
- AI Influencer name input
- Handle/username auto-generation (e.g., @luna.dreams)
- "Create AI Influencer" button
- Loading state during initial generation

### F8: NSFW Content Toggle

- Simple on/off toggle
- Age verification gate (18+ confirmation)
- Toggle visible on Step 1 or Step 6
- State persisted with character config
- Clear content guidelines shown

### F9: Form State Persistence

- Save wizard progress to localStorage
- Resume from last completed step on return
- Persist across browser sessions
- Auto-clear after successful generation
- Handle multi-tab scenarios

---

## Acceptance Criteria

### AC-1: Wizard Navigation

- [ ] User can navigate forward through all 6 steps
- [ ] User can go back to previous steps
- [ ] Progress is visually indicated (step X of 6)
- [ ] Form data persists when navigating back
- [ ] Validation prevents advancement with invalid data

### AC-2: Step 1 - Style

- [ ] User can select gender (Female/Male)
- [ ] User can select style (Realistic/Anime)
- [ ] Selections are shown as visual cards
- [ ] Cannot proceed without both selections

### AC-3: Step 2 - General

- [ ] User can select ethnicity from 7 options
- [ ] User can set age with slider (18-65)
- [ ] Ethnicity shown as visual cards
- [ ] Age displays numeric value

### AC-4: Step 3 - Face

- [ ] User can select hair style (gender-filtered)
- [ ] User can select hair color (7 options)
- [ ] User can select eye color (6 options)
- [ ] All three required to proceed

### AC-5: Step 4 - Body

- [ ] User can select body type (4 options)
- [ ] Female users see breast size option
- [ ] Male users don't see breast size
- [ ] Body type required to proceed

### AC-6: Step 5 - Identity

- [ ] User can select outfit from 20 options
- [ ] Outfits organized by category
- [ ] User can select archetype (6 options)
- [ ] User can select exactly 3 personality traits
- [ ] User can enter optional bio (max 200 chars)
- [ ] Outfit + archetype + 3 traits required to proceed
- [ ] Bio is optional

### AC-7: Step 6 - Generate

- [ ] User sees summary of all selections
- [ ] User can enter character name
- [ ] Generate button triggers generation
- [ ] Loading state shown during generation
- [ ] Success navigates to dashboard

### AC-8: NSFW Toggle

- [ ] Toggle is visible and functional
- [ ] Age verification (18+) shown before enabling
- [ ] NSFW state saved with character config
- [ ] Content guidelines displayed
- [ ] Toggle affects generation parameters

### AC-9: Form Persistence

- [ ] Progress saved to localStorage automatically
- [ ] Returning user resumes from last step
- [ ] Clear on successful generation
- [ ] Manual clear option available

---

## Analytics Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `wizard_started` | User enters wizard | `source`, `utm_*` |
| `wizard_step_viewed` | Step becomes visible | `step_index`, `step_name` |
| `wizard_step_completed` | User advances | `step_index`, `selections` |
| `wizard_abandoned` | User leaves mid-wizard | `last_step`, `time_spent` |
| `wizard_completed` | User clicks Generate | `character_config`, `total_time` |
| `nsfw_toggle_changed` | Toggle state changed | `enabled`, `step` |
| `age_verification_shown` | 18+ gate displayed | - |
| `age_verification_confirmed` | User confirms 18+ | - |
| `form_state_restored` | User resumes session | `restored_step` |
| `archetype_selected` | Archetype chosen | `archetype` |
| `personality_traits_selected` | 3 traits selected | `traits[]` |
| `bio_entered` | User enters bio | `bio_length` |

### Funnels to Create in PostHog

1. **Wizard Completion Funnel**
   ```
   wizard_started → step_1_completed → step_2_completed → 
   step_3_completed → step_4_completed → step_5_completed → wizard_completed
   ```

2. **Step Drop-off Analysis**
   ```
   wizard_step_viewed → wizard_step_completed (per step)
   ```

---

## User Stories

### ST-001: Complete Wizard Flow

**As a** new user  
**I want to** create my first AI Influencer through a guided wizard  
**So that** I can generate consistent content in the Content Studio

**AC**: AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-7

### ST-002: Resume Wizard Progress

**As a** returning user who didn't finish  
**I want to** resume from where I left off  
**So that** I don't have to start over

**AC**: AC-9

### ST-003: Enable NSFW Content

**As an** adult content creator  
**I want to** enable NSFW generation  
**So that** I can create content for OnlyFans/Fanvue

**AC**: AC-8

### ST-004: Customize AI Influencer Appearance

**As a** user creating an AI Influencer  
**I want to** select specific physical attributes  
**So that** my AI Influencer matches my vision

**AC**: AC-3, AC-4, AC-5

### ST-005: Define AI Influencer Identity

**As a** user creating an AI Influencer  
**I want to** define personality, archetype, and backstory  
**So that** my AI Influencer has a consistent brand and captions match their persona

**AC**: AC-6

---

## Technical Notes

### Data Model

```typescript
interface AIInfluencer {
  id: string;
  userId: string;
  name: string;
  handle: string; // e.g., @luna.dreams
  appearance: AppearanceConfig;
  identity: IdentityConfig;
  nsfwEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface AppearanceConfig {
  // Step 1 - Style
  gender: 'female' | 'male';
  style: 'realistic' | 'anime';
  
  // Step 2 - General
  ethnicity: string;
  age: number;
  
  // Step 3 - Face
  hairStyle: string;
  hairColor: string;
  eyeColor: string;
  
  // Step 4 - Body
  bodyType: string;
  breastSize?: string; // female only
}

interface IdentityConfig {
  // Step 5 - Identity
  defaultOutfit: string; // can be changed per generation
  archetype: InfluencerArchetype;
  personalityTraits: string[]; // exactly 3
  bio?: string; // optional, max 200 chars
}

type InfluencerArchetype = 
  | 'girl_next_door'
  | 'fitness_enthusiast'
  | 'luxury_lifestyle'
  | 'mysterious_edgy'
  | 'playful_fun'
  | 'professional_boss';

// Personality trait options
const PERSONALITY_TRAITS = [
  // Energy
  'confident', 'shy', 'bold', 'laid_back',
  // Social
  'playful', 'mysterious', 'caring', 'independent',
  // Lifestyle
  'adventurous', 'homebody', 'ambitious', 'creative',
  // Vibe
  'flirty', 'classy', 'edgy', 'sweet'
] as const;

interface WizardState {
  currentStep: number;
  completedSteps: number[];
  appearance: Partial<AppearanceConfig>;
  identity: Partial<IdentityConfig>;
  name?: string;
  nsfwEnabled: boolean;
  lastUpdated: Date;
}
```

### localStorage Schema

```typescript
// Key: 'ryla_wizard_state'
{
  currentStep: 3,
  completedSteps: [1, 2],
  appearance: {
    gender: 'female',
    style: 'realistic',
    ethnicity: 'latina',
    age: 25,
    // ... partial config
  },
  identity: {},
  nsfwEnabled: false,
  lastUpdated: '2025-12-05T10:00:00Z'
}
```

### API Endpoints

```
POST /api/influencers - Create AI Influencer (after wizard completion)
  Body: { name, appearance: AppearanceConfig, identity: IdentityConfig, nsfwEnabled: boolean }
  Response: { influencer_id, handle, status: 'generating' }
```

---

## Non-Goals (Phase 2+)

- Voice cloning (basic voice selection only in MVP)
- Fantasy ethnicities (Elf, Angel, Demon)
- Advanced personality customization
- AI Influencer appearance editing after generation
- Multiple AI Influencer creation in one session
- Custom attribute values (beyond presets)
- Full wardrobe system (MVP has outfit changes per generation)

---

## Dependencies

- UI components from MDC (copy via MDC-COPY-GUIDE.md)
- AI Influencer constants (body types, ethnicities, etc.)
- User authentication (EP-002)
- Content Studio (EP-005) - for generation after creation
- Caption generation (EP-014) - uses identity for tone

---

## UI Reference

See MDC-COPY-GUIDE.md for reusable components:
- `CreateFromPresetsView.tsx` - Wizard container
- `StyleScreen.tsx`, `GeneralScreen.tsx`, etc. - Step components
- AI Influencer option constants

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
