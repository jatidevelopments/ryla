# RYLA MVP Mockups

## Overview

Single clickable wireframe with **decision callouts** for key UX choices.

**Focus**: AI Influencer creation + **Content Studio** with scenes, environments, and AI-generated captions

---

## What's New

| Feature | Description |
|---------|-------------|
| **AI Influencer** | Renamed from "Character" — persistent persona |
| **Content Studio** | New UI for generating with scenes + environments |
| **Scene Presets** | 8 scenarios (beach day, morning vibes, etc.) |
| **Environment Presets** | 7 locations (beach, bedroom, office, etc.) |
| **Outfit Changes** | Change outfit per generation |
| **Social Profile Style** | AI Influencers look like social media profiles |
| **AI Caption Generation** | Auto-generated based on personality + scene |
| **Like/Favorite** | Curate best posts for export |
| **Export Package** | Download image + copy caption in one action |

---

## How to View

```bash
open /Users/admin/Documents/Projects/RYLA/mockups/mvp/index.html
```

---

## Screen Inventory

### Core Flow

| Screen | File | Purpose |
|--------|------|---------|
| Dashboard | `index.html` | AI Influencer profiles grid |
| Dashboard (Empty) | `empty-state.html` | First-time user |
| Login | `login.html` | Returning user |

### AI Influencer Creation (6-Step Wizard)

| Screen | File | Purpose |
|--------|------|---------|
| Step 1 | `wizard-1.html` | Gender + Style |
| Step 2 | `wizard-2.html` | Ethnicity + Age |
| Step 3 | `wizard-3.html` | Hair + Eyes |
| Step 4 | `wizard-4.html` | Body Type |
| Step 5 | `wizard-5.html` | Outfit + Personality + Archetype |
| Step 6 | `wizard-6.html` | Name + Review + Create |

### Content Studio (NEW)

| Screen | File | Purpose |
|--------|------|---------|
| **Content Studio** | `studio.html` | **Scene + Environment + Outfit selection** |
| Generating | `generating.html` | Progress (images + captions) |
| **Caption Picker** | `caption-picker.html` | **Pick/edit AI-generated caption** |

### AI Influencer Management (Social Profile Style)

| Screen | File | Purpose |
|--------|------|---------|
| **AI Influencer Profile** | `character.html` | **Social profile with posts** |
| **Liked Posts** | `liked.html` | **Asset library for export** |
| **Export** | `export.html` | **Download image + caption** |

### Settings & Other

| Screen | File | Purpose |
|--------|------|---------|
| Settings | `settings.html` | Account, preferences |
| Subscription | `subscription.html` | Plan management |
| Education | `education.html` | Help & guides |
| Legal | `legal.html` | ToS, Privacy, etc. |

---

## User Flow

```
[From Funnel] 
    → Login (if returning)
    → Dashboard (AI Influencer profiles)
    → Create AI Influencer (wizard-1 → wizard-6)
    → AI Influencer Profile (social-style)
    → Content Studio (select scene + environment + outfit)  ← NEW
    → Generating (images + captions)
    → Caption Picker (pick/edit for each image)
    → Back to Profile (posts displayed)
    → Like favorites
    → Export (image + caption package)
```

---

## Content Studio UI

```
┌─────────────────────────────────────────┐
│  🎬 Content Studio - Luna Martinez       │
├─────────────────────────────────────────┤
│                                         │
│  Scene                                  │
│  [📷] [🏠] [👗] [💪] [🌅] [🌙] [☕] [🏖️]│
│  Prof  Life Fash Fit  Morn Nite Cozy Beach│
│                                         │
│  Environment                            │
│  [🏖️] [🛏️] [🛋️] [💼] [☕] [🌆] [📸]  │
│  Beach  Bed  Liv Office Cafe Urban Studio│
│                                         │
│  Outfit                                 │
│  [👗 Date Night Glam] [Change →]        │
│                                         │
│  Options: [9:16] [Draft] [10 images]    │
│                                         │
│  💰 10 credits  Balance: 87             │
│                                         │
│  [ Generate Content → ]                 │
└─────────────────────────────────────────┘
```

---

## AI Influencer Profile (Social Style)

```
┌─────────────────────────────────────────┐
│  [Avatar]  Luna Martinez                │
│            @luna.dreams                 │
│            Girl Next Door • Flirty      │
│            "Small-town girl, big dreams"│
│                                         │
│  24 posts  │  156 imgs  │  12 liked    │
│                                         │
│  [🎬 Content Studio]  [❤️ Export Liked] │
├─────────────────────────────────────────┤
│  📸 Posts  │  ❤️ Liked  │  📁 All      │
├─────────────────────────────────────────┤
│  [img]         [img]         [img]      │
│  "Just..."     "Who's..."    "Morning.."│
│  ❤️ ✏️ 📤      ❤️ ✏️ 📤      ❤️ ✏️ 📤    │
└─────────────────────────────────────────┘
```

---

## MVP vs Phase 2

### In MVP

- ✅ AI Influencer creation (6-step wizard)
- ✅ Content Studio (scene + environment + outfit)
- ✅ 8 scene presets
- ✅ 7 environment presets
- ✅ Outfit changes per generation
- ✅ Social profile UI
- ✅ 1 caption per image (auto-generated)
- ✅ Edit caption
- ✅ Like/favorite posts
- ✅ Export image + copy caption

### Phase 2

- Full wardrobe system (owned items)
- Image sequences (morning routine, etc.)
- Custom environments
- Scene builder
- Multiple caption options (pick from 3)
- Tone/length controls
- Platform-specific presets (OnlyFans, Fanvue, etc.)
- Batch export with captions

---

## Competitive Advantage

| Feature | RYLA | SoulGen | Foxy.ai | Others |
|---------|------|---------|---------|--------|
| Image generation | ✅ | ✅ | ✅ | ✅ |
| Face consistency | ✅ | ✅ | ✅ | ⚠️ |
| **Scene presets** | ✅ | ❌ | ❌ | ❌ |
| **Environment presets** | ✅ | ❌ | ❌ | ❌ |
| **Outfit changes** | ✅ | ❌ | ❌ | ❌ |
| **Caption generation** | ✅ | ❌ | ❌ | ❌ |
| **Export package** | ✅ | ❌ | ❌ | ❌ |
| **Social profile feel** | ✅ | ❌ | ❌ | ❌ |

---

## Decision Callouts in Mockups

Yellow boxes mark decisions:

| Screen | Decision |
|--------|----------|
| `index.html` | AI Influencers as social profiles |
| `studio.html` | Scene vs Environment selection |
| `character.html` | Profile layout, Content Studio button |
| `caption-picker.html` | Caption UI, regenerate flow |
| `export.html` | Export options |

---

## Next Steps

1. Review mockups in browser
2. Validate Content Studio concept
3. Proceed to P5 - Tech Spec (including generation API with scene/environment)
