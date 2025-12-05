# RYLA MVP Mockups

## Overview

Single clickable wireframe with **decision callouts** for key UX choices.

**Focus**: Character creation & management as **social profiles** with **AI-generated captions**

---

## What's New (Social Profile + Captions)

| Feature | Description |
|---------|-------------|
| **Social Profile Style** | Characters look like social media profiles |
| **Posts, not Files** | Images + captions = posts (ready for OF/Fanvue) |
| **AI Caption Generation** | Auto-generated based on character personality |
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
| Dashboard | `index.html` | Character profiles grid |
| Dashboard (Empty) | `empty-state.html` | First-time user |
| Login | `login.html` | Returning user |

### Character Creation (6-Step Wizard)

| Screen | File | Purpose |
|--------|------|---------|
| Step 1 | `wizard-1.html` | Gender + Style |
| Step 2 | `wizard-2.html` | Ethnicity + Age |
| Step 3 | `wizard-3.html` | Hair + Eyes |
| Step 4 | `wizard-4.html` | Body Type |
| Step 5 | `wizard-5.html` | Outfit + Personality |
| Step 6 | `wizard-6.html` | Review + Generation Options |

### Generation & Captions (NEW)

| Screen | File | Purpose |
|--------|------|---------|
| Generating | `generating.html` | Progress (images + captions) |
| **Caption Picker** | `caption-picker.html` | **Pick/edit AI-generated caption** |

### Character Management (Social Profile Style)

| Screen | File | Purpose |
|--------|------|---------|
| **Character Profile** | `character.html` | **Social profile with posts** |
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
    → Dashboard (character profiles)
    → Create Character (wizard-1 → wizard-6)
    → Generating (images + captions)
    → Caption Picker (pick/edit for each image)  ← NEW
    → Character Profile (social-style posts)     ← NEW
    → Like favorites
    → Export (image + caption package)           ← NEW
```

---

## New Features in Mockups

### 1. Character Profile (Social Style)

```
┌─────────────────────────────────────────┐
│  [Avatar]  Luna Martinez                │
│            @luna.dreams                 │
│            Girl Next Door • Flirty      │
│            "Small-town girl, big dreams"│
│                                         │
│  24 posts  │  156 imgs  │  12 liked    │
│                                         │
│  [+ New Post]  [Generate More]          │
├─────────────────────────────────────────┤
│  📸 Posts  │  ❤️ Liked  │  📁 All      │
├─────────────────────────────────────────┤
│  [img]         [img]         [img]      │
│  "Just..."     "Who's..."    "Morning.."│
│  ❤️ ✏️ 📤      ❤️ ✏️ 📤      ❤️ ✏️ 📤    │
└─────────────────────────────────────────┘
```

### 2. AI Caption Picker

```
┌─────────────────────────────────────────┐
│  Pick a Caption                         │
│                                         │
│  [img]  │  Context:                     │
│         │  Archetype: Girl Next Door    │
│         │  Personality: Flirty, Bold    │
│         │  Outfit: Athleisure           │
├─────────────────────────────────────────┤
│  ○ "Just finished my workout... 😏"     │
│  ○ "Sweaty but worth it 💪"             │
│  ○ "Gym selfie because why not? 📸"     │
│                                         │
│  ✏️ Or write your own: ___________      │
│                                         │
│  [🔄 Regenerate]  [Skip]  [Save →]      │
└─────────────────────────────────────────┘
```

### 3. Export Package

```
┌─────────────────────────────────────────┐
│  Export Post                            │
│                                         │
│  [img preview]                          │
│  "Just finished my workout..."          │
│                                         │
│  Quick Actions:                         │
│  [📋 Copy Caption] [📥 Download] [📦 All]│
│                                         │
│  Options:                               │
│  ☑ Download image                       │
│  ☑ Copy caption to clipboard            │
│  ☐ Include .txt file                    │
│                                         │
│  [Cancel]  [Export]                     │
└─────────────────────────────────────────┘
```

---

## MVP vs Phase 2

### In MVP

- ✅ Social profile UI
- ✅ 1 caption per image (auto-generated)
- ✅ Edit caption
- ✅ Like/favorite posts
- ✅ Export image + copy caption

### Phase 2

- Multiple caption options (pick from 3)
- Tone/length controls
- Platform-specific presets (OnlyFans, Fanvue, etc.)
- Batch export with captions
- Post scheduling hints

---

## Competitive Advantage

| Feature | RYLA | SoulGen | Foxy.ai | Others |
|---------|------|---------|---------|--------|
| Image generation | ✅ | ✅ | ✅ | ✅ |
| Character consistency | ✅ | ✅ | ✅ | ⚠️ |
| **Caption generation** | ✅ | ❌ | ❌ | ❌ |
| **Export package** | ✅ | ❌ | ❌ | ❌ |
| **Social profile feel** | ✅ | ❌ | ❌ | ❌ |

---

## Decision Callouts in Mockups

Yellow boxes mark decisions:

| Screen | Decision |
|--------|----------|
| `index.html` | Characters as social profiles |
| `character.html` | Profile layout, post actions |
| `caption-picker.html` | Caption UI, regenerate flow |
| `export.html` | Export options |

---

## Next Steps

1. Review mockups in browser
2. Validate social profile concept
3. Proceed to P5 - Tech Spec (including caption generation API)
