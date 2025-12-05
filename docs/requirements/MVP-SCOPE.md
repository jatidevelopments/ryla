# RYLA MVP Scope

## Important: Funnel vs. MVP Product Separation

| Concern                   | Scope                                      | Status                     |
| ------------------------- | ------------------------------------------ | -------------------------- |
| **Funnel + Landing Page** | Acquisition, conversion, payment           | ✅ Exists (separate topic) |
| **MVP Product**           | Character creation, management, generation | 🔨 Building this           |

> **This document focuses on the MVP PRODUCT**, not the funnel/landing page.
> Funnel/Landing page is a separate workstream.

---

## MVP Objective

> Enable users to **create, generate, and manage AI influencer characters** for NSFW/OnlyFans use cases.
>
> **Success**: D7 retention >15%, Characters/user >2, Generation success >95%

---

## Funnel Data Context

**Ghost Test (Nov 2025):**

- Funnel validated demand (93% first-timers, 39% want AI OnlyFans)
- ⚠️ **Known bug** after character creation prevented payment progression
- Payment drop-off data may reflect bug, not conversion issues

**What we validated:**

- Users want AI OnlyFans (39% US)
- Users enable NSFW (72%)
- Funnel UX is stable (21% mid-funnel attrition)
- Users complete character creation

---

## What's IN the MVP

### MVP Product Journey (Post-Conversion)

```
[Funnel] → Dashboard → Create Character → Generate Images → Manage → Download
         ↑ separate
```

### ICP Summary (See ICP-PERSONAS.md)

| Attribute      | Value                           |
| -------------- | ------------------------------- |
| Location       | **US (82% of users)**           |
| AI Experience  | **93% first-timers**            |
| Primary Intent | **39% AI OnlyFans** (2x global) |
| NSFW Adoption  | **72%**                         |
| User Type      | Beginner with clear intent      |

### Key Differentiators (vs. Competitors)

| Feature                  | RYLA MVP           | Higgsfield ($50M) | Foxy.ai | SoulGen |
| ------------------------ | ------------------ | ----------------- | ------- | ------- |
| Character consistency    | ✅                 | ✅                | ✅      | ✅      |
| NSFW support             | ✅                 | ❌                | ❌      | ✅      |
| **Monetization export**  | ✅ OF/Fanvue ready | ❌                | ❌      | ❌      |
| Self-serve               | ✅                 | ✅                | ✅      | ✅      |
| Platform-optimized sizes | ✅                 | ❌                | ❌      | ❌      |

### Epics (Priority Order)

#### MVP Product (`docs/requirements/epics/mvp/`)

| Epic                                             | Name                        | Priority | Metric       | Status     |
| ------------------------------------------------ | --------------------------- | -------- | ------------ | ---------- |
| [EP-001](./epics/mvp/EP-001-character-wizard.md) | Character Creation Wizard   | P0       | A-Activation | 📝 Defined |
| [EP-002](./epics/mvp/EP-002-authentication.md)   | User Authentication         | P0       | A-Activation | 📝 Defined |
| [EP-004](./epics/mvp/EP-004-dashboard.md)        | Character Management        | P0       | B-Retention  | 📝 Defined |
| [EP-005](./epics/mvp/EP-005-generation.md)       | Image Generation Engine     | P0       | C-Core Value | 📝 Defined |
| [EP-007](./epics/mvp/EP-007-emails.md)           | Emails & Notifications      | P1       | A-Activation | 📝 Defined |
| [EP-008](./epics/mvp/EP-008-gallery.md)          | Image Gallery & Downloads   | P0       | C-Core Value | 📝 Defined |
| [EP-009](./epics/mvp/EP-009-credits.md)          | Generation Credits & Limits | P0       | D-Conversion | 📝 Defined |
| [EP-010](./epics/mvp/EP-010-subscription.md)     | Subscription Management     | P0       | B-Retention  | 📝 Defined |
| [EP-011](./epics/mvp/EP-011-legal.md)            | Legal & Compliance          | P0       | Risk         | 📝 Defined |
| [EP-012](./epics/mvp/EP-012-onboarding.md)       | Onboarding & First-Time UX  | P1       | A-Activation | 📝 Defined |
| [EP-013](./epics/mvp/EP-013-education.md)        | Education Hub               | P1       | B-Retention  | 📝 Defined |

#### Funnel (`docs/requirements/epics/funnel/`)

| Epic                                       | Name                   | Priority | Metric       | Status                 |
| ------------------------------------------ | ---------------------- | -------- | ------------ | ---------------------- |
| [EP-003](./epics/funnel/EP-003-payment.md) | Payment & Subscription | P0       | D-Conversion | 📝 Separate workstream |

#### Landing Page (`docs/requirements/epics/landing/`)

| Epic                                        | Name         | Priority | Metric       | Status                 |
| ------------------------------------------- | ------------ | -------- | ------------ | ---------------------- |
| [EP-006](./epics/landing/EP-006-landing.md) | Landing Page | P0       | A-Activation | 📝 Separate workstream |

#### Future (`docs/requirements/epics/future/`)

See [future/README.md](./epics/future/README.md) for Phase 2+ planned features.

### Features per Epic

#### EP-001: Character Creation Wizard ✅

**6-Step Wizard Flow:**

- Step 1: Style (gender + style)
- Step 2: General (ethnicity + age)
- Step 3: Face (hair style/color + eye color)
- Step 4: Body (body type + breast size if female)
- Step 5: Details (outfit + personality)
- Step 6: Generate (preview + confirm)

**Character Options:**

- 7 ethnicities, 4 body types, 7 hair styles
- 7 hair colors, 6 eye colors, 20 outfits
- Gender-filtered options (auto-adjust per selection)

**UX Features:**

- Progress persistence (localStorage)
- Resume from last step
- Image-based option selection
- Preview before generation
- **NSFW toggle (18+ gate)**
- Validation before each step

#### EP-002: User Authentication

- Email/password signup
- Email/password login
- Session management
- Password reset (basic)
- Guest → registered conversion
- **Age verification for NSFW**

#### EP-003: Payment & Subscription (Funnel)

- Stripe Checkout integration
- Subscription plans (starting $29/mo)
- Payment success/failure handling
- Subscription status in UI
- Webhook processing

#### EP-007: Emails & Notifications

- Welcome email on signup
- Password reset email
- Payment receipt email
- Download ready notification

#### EP-004: Character Dashboard ✅

**Character List:**

- Grid view with thumbnails
- Character name + creation date
- Quick actions (view, regenerate, delete)

**Character Detail:**

- Full character config display
- Image gallery (all generated images)
- Regenerate with same config
- Download options

**Downloads:**

- Individual image download
- ZIP pack download
- Generic resolution (MVP)
- _Platform-specific presets (P2)_

#### EP-005: Image Generation Engine ✅

**Core Generation:**

- AI model integration (Replicate/Fal)
- Consistent face generation (seed locking)
- Image pack generation (5-10 images)
- Queue management
- Error handling & retries

**Generation Options (MVP):**

- Aspect ratio selector (1:1, 9:16, 2:3)
- Quality mode toggle (Draft/HQ)
- NSFW toggle (safe mode)
- Progress indicator

**NSFW Routing:**

- Auto-select NSFW-capable models
- Compliant storage handling

#### EP-009: Generation Credits & Limits ✅

**Credit System:**

- Credit balance per user
- Credits consumed per generation (1 draft, 3 HQ)
- Real-time balance display in header
- Low credit warnings (<10)
- Zero credit blocks with upgrade CTA

**Plan Limits:**

| Plan      | Credits/mo |
| --------- | ---------- |
| Free      | 10 (once)  |
| Starter   | 100        |
| Pro       | 300        |
| Unlimited | ∞          |

#### EP-010: Subscription Management ✅

- View current plan & billing date
- Plan comparison view
- Upgrade/downgrade flow
- Cancellation flow with retention offer
- Billing history & invoice download
- Payment method management (via Stripe)

#### EP-011: Legal & Compliance ✅

**Required Pages:**

- Terms of Service (`/terms`)
- Privacy Policy (`/privacy`)
- Content Guidelines (`/guidelines`)
- DMCA Process (`/dmca`)
- Cookie Policy (`/cookies`)

**Compliance Features:**

- ToS acceptance during signup (tracked)
- Cookie consent banner
- Age verification gate (18+)

#### EP-012: Onboarding & First-Time UX ✅

- Welcome modal (first login)
- Product tour (3-5 steps, optional)
- Empty state CTAs
- First-time wizard guidance
- Success celebration (first character)
- Progress checklist widget

#### EP-013: Education Hub ✅

**Content Sections:**

- Getting Started (5 beginner guides)
- Monetization (4 guides: OnlyFans 101, pricing, etc.)
- Best Practices (image generation tips)

**Features:**

- Tutorial format with screenshots
- Progress tracking per user
- Contextual tips throughout app
- Mark as complete functionality

---

## Out of MVP Product Scope (Funnel/Landing)

These are handled separately:

| Item                      | Notes               |
| ------------------------- | ------------------- |
| **Landing Page (EP-006)** | Separate workstream |
| **Payment Flow (EP-003)** | Separate workstream |
| **Funnel optimization**   | Separate workstream |

---

## What's NOT in MVP (Phase 2+)

### Explicitly Out of Scope

| Feature                    | Reason                                 | Phase |
| -------------------------- | -------------------------------------- | ----- |
| Video generation           | Complexity, validate images first      | P2    |
| Lip-sync / talking head    | Depends on video                       | P2    |
| Voice cloning              | Complexity                             | P2    |
| Platform auto-posting (OF) | Integration complexity                 | P2    |
| Content scheduling         | Needs platform integration             | P2    |
| Multi-character scenes     | Complexity                             | P2    |
| Character chat/personality | Different product (dFans.ai territory) | P3    |
| API access                 | B2B, not MVP focus                     | P3    |
| Team/agency features       | B2B                                    | P3    |
| Advanced NSFW controls     | Start with simple on/off               | P2    |
| Referral system            | Optimize CAC later                     | P2    |
| Mobile app                 | Web-first                              | P3    |
| i18n (multi-language)      | English only for MVP                   | P2    |

### Simplified for MVP

| Feature           | MVP Version         | Full Version (Later)       |
| ----------------- | ------------------- | -------------------------- |
| Auth              | Email/password only | + Social login, 2FA        |
| Pricing           | 1-2 plans           | Multiple tiers, annual     |
| Character editing | Regenerate only     | Full attribute editing     |
| Images per pack   | 5-10                | Unlimited/configurable     |
| Export formats    | Platform presets    | Custom sizes, watermarks   |
| Analytics         | PostHog only        | Custom dashboard           |
| NSFW              | Simple toggle       | Advanced controls, filters |

---

## MVP Product Focus: Character Creation & Management

### Core Value Proposition

Users come to **create and manage AI influencer characters**. The MVP must deliver:

1. **Character Creation** - Wizard flow, customization, NSFW toggle
2. **Image Generation** - Consistent faces, quality output
3. **Character Management** - Dashboard, regeneration, downloads
4. **Persistence** - Characters saved, accessible anytime

### MVP Product Features

| Feature                     | Priority | Epic   |
| --------------------------- | -------- | ------ |
| Character wizard (6-step)   | P0       | EP-001 |
| Character attribute options | P0       | EP-001 |
| Consistent face generation  | P0       | EP-005 |
| Character dashboard         | P0       | EP-004 |
| Image gallery & download    | P0       | EP-008 |
| NSFW toggle                 | P0       | EP-001 |
| Aspect ratio selection      | P0       | EP-005 |
| Quality mode (draft/HQ)     | P0       | EP-005 |
| Form state persistence      | P0       | EP-001 |
| Auth & settings             | P0       | EP-002 |
| Credit system & limits      | P0       | EP-009 |
| Subscription management     | P0       | EP-010 |
| Legal pages & compliance    | P0       | EP-011 |
| Onboarding experience       | P1       | EP-012 |
| Education hub               | P1       | EP-013 |
| Emails & notifications      | P1       | EP-007 |

---

## Character Creation Options (Validated from MDC)

### 6-Step Wizard Flow

```
Step 1: Style     → Gender + Style (Realistic/Anime)
Step 2: General   → Ethnicity + Age
Step 3: Face      → Hair style + Hair color + Eye color
Step 4: Body      → Body type + (Breast size if female)
Step 5: Identity  → Outfit + Archetype + Personality traits + Bio
Step 6: Generate  → Preview + Generate button
```

### Character Attributes (MVP)

#### Appearance Attributes

| Attribute      | Options              | Priority |
| -------------- | -------------------- | -------- |
| **Gender**     | Female, Male         | P0       |
| **Style**      | Realistic, Anime     | P0       |
| **Ethnicity**  | 7 real-world options | P0       |
| **Age**        | 18-65 slider         | P0       |
| **Body Type**  | 4 options            | P0       |
| **Hair Style** | 7 options per gender | P0       |
| **Hair Color** | 7 options            | P0       |
| **Eye Color**  | 6 options            | P0       |
| **Outfit**     | 20 popular options   | P0       |

#### Identity Attributes (NEW)

| Attribute       | Options                   | Priority |
| --------------- | ------------------------- | -------- |
| **Archetype**   | 6 persona types           | P0       |
| **Personality** | Pick 3 of 16 traits       | P0       |
| **Bio**         | Optional text (200 chars) | P0       |
| **Voice**       | 3-5 voices                | P1       |

**Archetypes:**

- Girl Next Door, Fitness Enthusiast, Luxury Lifestyle
- Mysterious/Edgy, Playful/Fun, Professional/Boss

**Personality Traits (pick 3):**

- Energy: Confident, Shy, Bold, Laid-back
- Social: Playful, Mysterious, Caring, Independent
- Lifestyle: Adventurous, Homebody, Ambitious, Creative
- Vibe: Flirty, Classy, Edgy, Sweet

### Body Types (MVP)

- Slim
- Athletic
- Curvy
- Voluptuous
- _(Thick/Pregnant → P2)_

> **Note**: US users prefer thicker/curvy types (37% vs 27% global) — prioritize these in UI.

### Ethnicities (MVP)

- Asian
- Black/African
- White/Caucasian
- Latina
- Arab
- Indian
- Mixed
- _(Fantasy: Elf, Angel, Demon → P2)_

### Hair Styles (MVP)

**Female**: Long, Short, Braids, Ponytail, Bangs, Bun, Wavy

**Male**: Short, Medium, Long, Buzzcut, Slicked, Curly, Fade

### Hair Colors (MVP)

Black, Brown, Blonde, Red, Auburn, Gray, White

### Eye Colors (MVP)

Brown, Blue, Green, Hazel, Gray, Amber

### Outfits (Top 20 for MVP)

**Casual**: Casual streetwear, Athleisure, Yoga, Jeans, Tank top, Crop top

**Glamour**: Date night glam, Cocktail dress, Mini skirt, Dress, Summer chic

**Intimate**: Bikini, Lingerie, Swimsuit, Nightgown, Leotard

**Fantasy**: Cheerleader, Nurse, Maid, Student uniform, Business

> **Note**: US users prefer "date night glam" (31% vs 22% global) — feature prominently.

---

## Image Generation Features (MVP)

### Aspect Ratios (P0)

| Ratio | Name          | Use Case                     |
| ----- | ------------- | ---------------------------- |
| 1:1   | Square        | Instagram feed, profile pics |
| 9:16  | Portrait      | Stories, TikTok, Reels       |
| 2:3   | Tall Portrait | Pinterest, OnlyFans          |

### Quality Modes (P0)

| Mode             | Speed | Quality | Credits | Use Case           |
| ---------------- | ----- | ------- | ------- | ------------------ |
| **Draft**        | ~10s  | Good    | 1       | Preview, iteration |
| **High Quality** | ~30s  | Best    | 3       | Final images       |

### NSFW Support (P0)

- Simple on/off toggle (72% enable)
- Age gate requirement (18+)
- NSFW-capable model routing
- Compliant storage

### Generation Features by Priority

| Feature                | MVP (P0)         | Phase 2           |
| ---------------------- | ---------------- | ----------------- |
| Aspect ratio selection | ✅ 3 options     | Custom sizes      |
| Quality toggle         | ✅ Draft/HQ      | Fine-tune control |
| NSFW toggle            | ✅ Simple on/off | Advanced filters  |
| Face consistency       | ✅ Seed locking  | Better control    |
| Progress indicator     | ✅ Loading state | Queue position    |
| Face repair            | ❌               | ✅ Auto-fix       |
| Upscale                | ❌               | ✅ 2x/4x          |
| Model selection        | ❌ Auto          | ✅ Manual         |
| LoRA/Presets           | ❌               | ✅ Style presets  |

---

## State & Persistence (MVP)

### Form State Persistence (P0)

- Save wizard progress to localStorage
- Resume from last completed step
- Persist across browser sessions
- Auto-clear after successful generation

### Character Persistence (P0)

- Save character config to database
- Associate with user account
- Persist generated images
- Enable regeneration with same config

### Phase 2: Monetization Export

| Platform      | Image Sizes          | Phase |
| ------------- | -------------------- | ----- |
| **Generic**   | Original resolution  | MVP   |
| **OnlyFans**  | 1080x1350, 1080x1920 | P2    |
| **Fanvue**    | 1080x1350, 1080x1920 | P2    |
| **Instagram** | 1080x1080, 1080x1920 | P2    |

---

## MVP User Personas

### Primary: "NSFW Natalie" (US, 82% of users)

- **93% first-timer** (but with clear intent)
- **39% want AI OnlyFans** specifically
- **72% enable NSFW**
- Completes funnel fine, hesitates at payment
- Needs trust signals to convert
- **Prefers: Thick body types (37%), date night glam (31%)**

### Secondary: "Global Creator"

- Less NSFW-focused (21% vs 39%)
- Prefers athletic body types
- More likely to convert at payment
- "Not sure" about use case (34%)

📄 **Full personas**: [ICP-PERSONAS.md](./ICP-PERSONAS.md)

---

## MVP Technical Constraints

| Constraint      | Requirement                |
| --------------- | -------------------------- |
| Browser support | >98% global coverage       |
| Mobile          | Responsive web (no native) |
| Page load       | <3s on 3G                  |
| Generation time | <60s per character         |
| Uptime          | 99% (acceptable for MVP)   |
| NSFW hosting    | Compliant storage provider |

---

## MVP Product Launch Checklist

### P0: Core Product

**Authentication:**

- [ ] User can sign up and log in
- [ ] User can access dashboard
- [ ] Age gate for NSFW (18+)

**Character Creation (6-Step Wizard):**

- [ ] Step 1: Gender + Style selection
- [ ] Step 2: Ethnicity + Age selection
- [ ] Step 3: Hair style/color + Eye color
- [ ] Step 4: Body type (+ breast size if female)
- [ ] Step 5: Outfit + Personality
- [ ] Step 6: Preview + Generate
- [ ] **NSFW toggle works (72% want it)**
- [ ] Form state persists in localStorage
- [ ] Resume from last step works

**Image Generation:**

- [ ] Character generates with consistent face
- [ ] Aspect ratio selection (1:1, 9:16, 2:3)
- [ ] Quality mode toggle (Draft/HQ)
- [ ] Generation progress indicator
- [ ] Error handling & retry

**Dashboard:**

- [ ] User can view characters in grid
- [ ] User can view character detail + gallery
- [ ] User can download image pack
- [ ] User can regenerate images
- [ ] User can delete character

**Quality:**

- [ ] Analytics tracking all key events
- [ ] Mobile responsive
- [ ] <3s page load

### P1: Nice to Have

- [ ] Email confirmation
- [ ] Forgot password flow
- [ ] Personality options
- [ ] Voice selection
- [ ] Character editing (beyond regenerate)
- [ ] Platform-specific export presets

### Funnel/Landing (Separate Checklist)

- [ ] Payment flow works
- [ ] Landing page converts
- [ ] Trust signals in place

### Not in MVP

- Video features
- Platform auto-posting
- Advanced NSFW customization
- Admin dashboard
- Chat/personality features

---

## Success Metrics (MVP Product)

### Primary (Product Quality)

| Metric                    | Target | How to Measure |
| ------------------------- | ------ | -------------- |
| **Generation success**    | >95%   | Backend logs   |
| **D7 retention**          | >15%   | PostHog cohort |
| **Characters/user**       | >2     | Database query |
| **Time to 1st character** | <10min | PostHog timing |

### Secondary (UX Quality)

| Metric                | Target | How to Measure |
| --------------------- | ------ | -------------- |
| NSFW toggle adoption  | >70%   | PostHog event  |
| Dashboard return rate | >50%   | PostHog        |
| Download completion   | >80%   | PostHog event  |

### Funnel Metrics (Separate Workstream)

| Metric             | Target | Owner       |
| ------------------ | ------ | ----------- |
| Payment conversion | TBD    | Funnel team |
| Funnel completion  | >50%   | Funnel team |

---

## Timeline Estimate (MVP Product)

| Week | Focus      | Epics                                   |
| ---- | ---------- | --------------------------------------- |
| 1-2  | Foundation | EP-002 (Auth), EP-004 (Dashboard shell) |
| 2-3  | Core       | EP-001 (Wizard + NSFW), EP-005 (Gen)    |
| 3-4  | Polish     | Integration, testing, dashboard UX      |
| 4-5  | Launch     | Deploy, monitor product metrics         |

**Funnel/Landing timeline is separate.**

---

## Decision Log

| Decision                      | Rationale                                        |
| ----------------------------- | ------------------------------------------------ |
| Email auth only               | Fastest to implement                             |
| No video for MVP              | Images validate demand, video is 10x complexity  |
| Web only                      | Faster iteration than native apps                |
| Voice in MVP                  | Basic selection only, cloning is Phase 2         |
| Resend for emails             | Simple API, good deliverability                  |
| **NSFW from day 1**           | 72% enable, 39% want AI OnlyFans (funnel data)   |
| **Platform export → Phase 2** | Core product first, export features second       |
| **Separate funnel/product**   | Different concerns, different timelines          |
| **Copy MDC wizard pattern**   | Validated 6-step flow, saves 5-7 weeks dev time  |
| **localStorage persistence**  | Critical UX - users expect resume from last step |
| **3 aspect ratios only**      | Covers 90% use cases, keep UI simple             |
| **Draft/HQ mode**             | Fast iteration + quality output, simple toggle   |

### Funnel Decisions (Separate)

| Decision              | Rationale                               |
| --------------------- | --------------------------------------- |
| $29/mo starting price | Validated in ghost test                 |
| Lead with AI OnlyFans | 39% US users select this (funnel data)  |
| Show curvy body types | 37% US prefer thick (funnel data)       |
| Payment provider TBD  | Bug in funnel needs investigation first |

## Legal Requirements (MVP)

- [ ] Terms of Service page
- [ ] Privacy Policy page
- [ ] Cookie consent (if EU traffic)
- [ ] Content guidelines for AI generation
- [ ] **Age verification (18+) for NSFW**
- [ ] **NSFW content hosting compliance**
