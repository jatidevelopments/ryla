# Future Epics (Phase 2+)

Features explicitly out of MVP scope.

## Scope

These epics are **NOT in MVP** — planned for Phase 2 or later.

> 🚫 Do not implement until MVP is validated.

## Planned Epics

### Content Studio Expansion (High Priority P2)

| Epic | Name | Phase | Reason for Delay |
|------|------|-------|------------------|
| EP-038 | Full Wardrobe System | P2 | MVP has outfit changes, not ownership |
| EP-039 | Image Sequences | P2 | Multi-scene stories add complexity |
| EP-040 | Custom Environments | P2 | MVP has presets only |
| EP-041 | Scene Builder | P2 | Manual scene composition |
| EP-042 | Props & Items | P2 | Objects in scenes |
| EP-043 | Advanced Captions | P2 | Multiple options, tone controls |

### Video & Voice

| Epic | Name | Phase | Reason for Delay |
|------|------|-------|------------------|
| EP-024 | Video Generation | P2 | Complexity, validate images first |
| EP-025 | Lip-sync / Talking Head | P2 | Depends on video |
| EP-026 | Voice Cloning | P2 | Complexity |

### Platform Integration

| Epic | Name | Phase | Reason for Delay |
|------|------|-------|------------------|
| EP-027 | Platform Auto-Posting | P2 | Integration complexity |
| EP-028 | Content Scheduling | P2 | Needs platform integration |
| EP-037 | Platform-Specific Export | P2 | OF/Fanvue/Instagram presets |

### AI Influencer Features

| Epic | Name | Phase | Reason for Delay |
|------|------|-------|------------------|
| EP-023 | Advanced Identity | P2 | MVP has minimal identity first |
| EP-029 | Multi-Influencer Scenes | P2 | Complexity |
| EP-030 | AI Influencer Chat | P3 | Different product territory |

### Image Enhancement

| Epic | Name | Phase | Reason for Delay |
|------|------|-------|------------------|
| EP-044 | Face Repair | P2 | Auto-fix generation issues |
| EP-045 | Image Upscaling | P2 | 2x/4x enhancement |
| EP-046 | Image Editing | P2 | Inpainting, adjustments |

### Business & Growth

| Epic | Name | Phase | Reason for Delay |
|------|------|-------|------------------|
| EP-031 | API Access | P3 | B2B, not MVP focus |
| EP-032 | Team/Agency Features | P3 | B2B |
| EP-033 | Advanced NSFW Controls | P2 | Start with simple toggle |
| EP-034 | Referral System | P2 | Optimize CAC later |
| EP-035 | Mobile App | P3 | Web-first |
| EP-036 | i18n (Multi-language) | P2 | English only for MVP |

> **Note**: EP-009 to EP-014 are now used for MVP epics (Credits, Subscription, Legal, Onboarding, Education, Captions)

---

## Phase 2 Priorities

Based on MVP learnings, prioritize:

### Content Studio Expansion (if users want more variety)
1. **Full Wardrobe System** — owned items, unlock more clothes
2. **Image Sequences** — morning routine, day in the life stories
3. **Custom Environments** — user-defined locations

### Video (if images validate demand)
4. **Video generation** — short clips
5. **Lip-sync** — talking head videos

### Platform (if export is popular)
6. **Platform-specific export** — OF/Fanvue/Instagram presets
7. **Content scheduling** — plan posts ahead

### Growth (once conversion is optimized)
8. **Referral system** — viral growth
9. **Advanced NSFW controls** — more granular content options

---

## Epic Details

### EP-038: Full Wardrobe System

**What**: Users own and manage clothing items for their AI Influencers
- Wardrobe inventory per AI Influencer
- Unlock new items (purchase or earn)
- Mix and match outfits
- Outfit history tracking

**Why Phase 2**: MVP has outfit changes per generation, but no persistent wardrobe. Validate that users want variety before building ownership system.

### EP-039: Image Sequences

**What**: Generate multi-scene stories
- "Morning routine" (5 scenes: wake up, shower, breakfast, getting ready, leaving)
- "Day in the life" (8-10 scenes)
- "Transformation" (before/after sequences)
- Narrative continuity between scenes

**Why Phase 2**: Complexity in prompt engineering, UI, and generation flow. Validate single images first.

### EP-040: Custom Environments

**What**: Users create and save custom locations
- Upload reference images
- Describe custom environments
- Save and reuse environments
- Share environments (community)

**Why Phase 2**: MVP presets cover common use cases. Custom environments need more sophisticated prompt engineering.

### EP-041: Scene Builder

**What**: Manual scene composition
- Drag-and-drop scene elements
- Layer environment + pose + props
- Fine-grained control over composition
- Save scene templates

**Why Phase 2**: Power user feature. Most users will be happy with presets.

### EP-043: Advanced Captions

**What**: More caption options and controls
- Pick from 3 generated captions
- Adjust tone (more flirty, more professional)
- Adjust length (short/medium/long)
- Hashtag suggestions
- Multi-language captions

**Why Phase 2**: MVP has 1 caption per image with edit. Validate basic captions first.

---

## Entry Criteria

Before starting Phase 2:

- [ ] MVP launched and stable
- [ ] D7 retention >15%
- [ ] Generation success >95%
- [ ] AI Influencers/user >2
- [ ] Content Studio usage validated
- [ ] Caption acceptance rate measured
- [ ] User feedback collected
- [ ] Payment conversion analyzed (bug fixed)

---

📄 See [MVP-SCOPE.md](../../MVP-SCOPE.md) for what's explicitly out of scope.
