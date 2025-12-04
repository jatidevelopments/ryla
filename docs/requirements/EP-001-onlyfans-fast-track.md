# EP-001: OnlyFans Fast Track

## Epic Summary

**Goal**: Reduce funnel from 36 steps to 5 for OnlyFans creators
**Metric**: A - Activation, D - Conversion
**Target**: >50% fast track usage, >40% payment conversion

---

## Problem Statement

Current funnel has 36 steps with 81% payment drop-off. Data shows:
- 39% choose OnlyFans as primary use case
- 72% enable NSFW
- 100% completion once generation starts

Users want faster path to value. Popular archetype is known (thick Latina/Caucasian).

---

## MVP Objective

Allow OnlyFans creators to generate their first AI influencer in **5 steps** instead of 36, using preset templates based on popular choices.

---

## Non-Goals (Out of Scope)

- Video generation
- Lip-sync
- Full customization flow (keep existing for "Advanced" users)
- Platform integrations (OF auto-post)
- Voice cloning

---

## Business Metric

- [x] **A - Activation**: Fast track completion rate
- [ ] B - Retention
- [ ] C - Core Value
- [x] **D - Conversion**: Payment conversion improvement

---

## Hypothesis

**When we** reduce OnlyFans funnel to 5 steps with preset templates,
**Users will** complete faster and convert at higher rates,
**Measured by** payment conversion improving from 19% to >40%.

---

## User Flow

```
Step 1: Use Case Selection
├── "AI OnlyFans" ← Auto-select fast track
├── "AI Influencer/UGC" → Path 2
└── "I want full control" → 36-step flow

Step 2: Choose Template
├── "Thick Latina with long hair"
├── "Athletic Caucasian with date night glam"
├── "Curvy mixed-race influencer"
├── "Petite Asian influencer"
└── "Custom" → 36-step flow

Step 3: Email Capture ← CRITICAL
├── "Enter email to create your character"
├── Show: "Join 100+ creators"
└── Optional: Name your character

Step 4: Quick Customize (optional)
├── Adjust ethnicity (if wanted)
├── Adjust body type (if wanted)
├── Adjust outfit (if wanted)
└── NSFW enabled by default

Step 5: Generate + Preview
├── Show character consistency preview
├── Display 3-5 sample images
└── "Love it? Get unlimited access →"

Step 6: Pricing
├── Free: 1 character, 5 images
├── Creator $29/mo: Unlimited
└── Pro $99/mo: Advanced features
```

---

## Acceptance Criteria

### AC-1: Fast Track Entry
- [ ] User selecting "AI OnlyFans" at step 1 enters fast track
- [ ] NSFW is enabled by default
- [ ] Skip to step 2 (template selection)

### AC-2: Template Selection
- [ ] 5 preset templates displayed with preview images
- [ ] Each template pre-configures: ethnicity, body, hair, outfit
- [ ] "Custom" option available for full flow

### AC-3: Early Email Capture
- [ ] Email field at step 3 (before generation)
- [ ] Required to proceed
- [ ] Trust signals displayed ("Join 100+ creators")
- [ ] Email stored in database for funnel tracking

### AC-4: Quick Customization
- [ ] Only 3-5 key attributes editable
- [ ] Changes preview in real-time
- [ ] Can skip (use template defaults)

### AC-5: Generation & Preview
- [ ] Character generated using selected/default parameters
- [ ] Consistency preview video shown (from existing step 12)
- [ ] 3-5 sample images displayed
- [ ] "Get unlimited access" CTA prominent

### AC-6: Pricing Display
- [ ] Three tiers shown clearly
- [ ] Free tier highlighted for risk-averse users
- [ ] ROI calculator visible
- [ ] Trust signals (money-back, testimonials)

### AC-7: Analytics Events
- [ ] `fast_track_started` when entering fast track
- [ ] `template_selected` with template_id
- [ ] `email_captured` at step 3
- [ ] `fast_track_completed` when reaching pricing
- [ ] `fast_track_converted` on payment

---

## Analytics Acceptance Criteria

| Event | Properties | Funnel Position |
|-------|------------|-----------------|
| `fast_track_started` | `use_case`, `source` | Step 1 |
| `template_selected` | `template_id`, `template_name` | Step 2 |
| `email_captured` | `email_domain` (not full) | Step 3 |
| `customization_changed` | `field`, `value` | Step 4 |
| `character_generated` | `template_id`, `customizations` | Step 5 |
| `pricing_viewed` | `plans_shown` | Step 6 |
| `fast_track_converted` | `plan`, `amount` | Payment |

---

## Templates Specification

### Template 1: Thick Latina
```json
{
  "id": "thick-latina",
  "name": "Thick Latina with long hair",
  "ethnicity": "latina",
  "body_type": "thick",
  "hair_style": "long",
  "hair_color": "dark_brown",
  "outfit": "date_night_glam",
  "nsfw_enabled": true
}
```

### Template 2: Athletic Caucasian
```json
{
  "id": "athletic-caucasian",
  "name": "Athletic Caucasian with date night glam",
  "ethnicity": "caucasian",
  "body_type": "athletic",
  "hair_style": "long",
  "hair_color": "blonde",
  "outfit": "date_night_glam",
  "nsfw_enabled": true
}
```

### Template 3: Curvy Mixed
```json
{
  "id": "curvy-mixed",
  "name": "Curvy mixed-race influencer",
  "ethnicity": "mixed",
  "body_type": "curvy",
  "hair_style": "wavy",
  "hair_color": "brunette",
  "outfit": "casual_chic",
  "nsfw_enabled": true
}
```

### Template 4: Petite Asian
```json
{
  "id": "petite-asian",
  "name": "Petite Asian influencer",
  "ethnicity": "asian",
  "body_type": "petite",
  "hair_style": "straight_long",
  "hair_color": "black",
  "outfit": "date_night_glam",
  "nsfw_enabled": true
}
```

### Template 5: Classic Blonde
```json
{
  "id": "classic-blonde",
  "name": "Classic blonde bombshell",
  "ethnicity": "caucasian",
  "body_type": "thick",
  "hair_style": "long",
  "hair_color": "blonde",
  "outfit": "glamour",
  "nsfw_enabled": true
}
```

---

## Success Metrics

| Metric | Target | Baseline |
|--------|--------|----------|
| Fast track entry rate | >50% of OnlyFans users | N/A |
| Template selection rate | >80% | N/A |
| Email capture rate | >80% | ~25% (at step 34) |
| Fast track completion | >90% | 100% (gen only) |
| Payment conversion | >40% | 19% |
| Free→Paid (7d) | >15% | N/A |

---

## Technical Dependencies

- Existing character generation pipeline
- Email capture API endpoint
- User/session storage
- PostHog analytics integration
- Stripe payment integration

---

## Stories Breakdown

| Story ID | Title | Priority |
|----------|-------|----------|
| ST-001 | Fast track routing logic | P0 |
| ST-002 | Template data model & API | P0 |
| ST-003 | Email capture at step 3 | P0 |
| ST-004 | Template selection UI | P0 |
| ST-005 | Quick customization UI | P1 |
| ST-006 | Pricing page with free tier | P0 |
| ST-007 | Analytics events | P0 |
| ST-008 | A/B test fast track vs full | P2 |

---

## Risks

| Risk | Mitigation |
|------|------------|
| Templates don't match user preferences | Start with 5 most popular, add more based on data |
| Email bounce/spam | Use double opt-in for marketing, single for product |
| Free tier abuse | Watermark, rate limit, require email |

---

## Timeline Estimate

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| P3: Architecture | 2 days | Data model, API design |
| P4: UI Skeleton | 2 days | Screens, navigation |
| P5: Tech Spec | 1 day | File plan, tasks |
| P6: Implementation | 5 days | Code complete |
| P7: Testing | 2 days | E2E, analytics verification |
| P8: Integration | 1 day | Merge, stability |

**Total: ~2 weeks**

