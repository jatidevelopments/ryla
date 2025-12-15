# RYLA MVP Scope

## Important: Funnel vs. MVP Product Separation

| Concern                   | Scope                                              | Status                     |
| ------------------------- | -------------------------------------------------- | -------------------------- |
| **Funnel + Landing Page** | Acquisition, conversion, payment                   | ✅ Exists (separate topic) |
| **MVP Product**           | AI Influencer creation, studio, content management | 🔨 Building this           |

> **This document focuses on the MVP PRODUCT**, not the funnel/landing page.
> Funnel/Landing page is a separate workstream.

---

## MVP Objective

> Enable users to **create AI Influencers and generate content** for NSFW/OnlyFans monetization.
>
> **Success**: D7 retention >15%, AI Influencers/user >2, Generation success >95%

---

## Terminology

| Term               | Definition                                                                                |
| ------------------ | ----------------------------------------------------------------------------------------- |
| **AI Influencer**  | A persistent AI-generated persona with fixed appearance + identity (formerly "Character") |
| **Content Studio** | The workspace for generating images with scenes, environments, and outfit changes         |
| **Post**           | An image + caption, ready for export to platforms                                         |
| **Scene**          | A pre-defined scenario (e.g., "beach photoshoot", "morning vibes")                        |
| **Environment**    | A location setting (e.g., beach, bedroom, office)                                         |

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
[Funnel] → Dashboard → Create AI Influencer → Content Studio → Generate → Manage Posts → Export
         ↑ separate
```

**Content Studio Flow:**

```
Select AI Influencer → Choose Scene + Environment + Outfit → Generate → Pick Captions → Like/Export
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

| Feature                   | RYLA MVP           | Higgsfield ($50M) | Foxy.ai | SoulGen |
| ------------------------- | ------------------ | ----------------- | ------- | ------- |
| AI Influencer consistency | ✅                 | ✅                | ✅      | ✅      |
| NSFW support              | ✅                 | ❌                | ❌      | ✅      |
| **Monetization export**   | ✅ OF/Fanvue ready | ❌                | ❌      | ❌      |
| **Scene presets**         | ✅ 8 scenarios     | ❌                | ❌      | ❌      |
| **Environment presets**   | ✅ 7 locations     | ❌                | ❌      | ❌      |
| **AI-generated captions** | ✅                 | ❌                | ❌      | ❌      |
| **Outfit changes**        | ✅ Per generation  | ❌                | ❌      | ❌      |
| Self-serve                | ✅                 | ✅                | ✅      | ✅      |

### Epics (Priority Order)

#### MVP Product (`docs/requirements/epics/mvp/`)

| Epic                                              | Name                          | Priority | Metric       | Status     |
| ------------------------------------------------- | ----------------------------- | -------- | ------------ | ---------- |
| [EP-001](./epics/mvp/EP-001-influencer-wizard.md) | AI Influencer Creation Wizard | P0       | A-Activation | 📝 Defined |
| [EP-002](./epics/mvp/EP-002-authentication.md)    | User Authentication           | P0       | A-Activation | 📝 Defined |
| [EP-004](./epics/mvp/EP-004-dashboard.md)         | AI Influencer Management      | P0       | B-Retention  | 📝 Defined |
| [EP-005](./epics/mvp/EP-005-content-studio.md)    | Content Studio & Generation   | P0       | C-Core Value | 📝 Defined |
| [EP-007](./epics/mvp/EP-007-emails.md)            | Emails & Notifications        | P1       | A-Activation | 📝 Defined |
| [EP-008](./epics/mvp/EP-008-gallery.md)           | Posts Gallery & Export        | P0       | C-Core Value | 📝 Defined |
| [EP-009](./epics/mvp/EP-009-credits.md)           | Generation Credits & Limits   | P0       | D-Conversion | 📝 Defined |
| [EP-010](./epics/mvp/EP-010-subscription.md)      | Subscription Management       | P0       | B-Retention  | 📝 Defined |
| [EP-011](./epics/mvp/EP-011-legal.md)             | Legal & Compliance            | P0       | Risk         | 📝 Defined |
| [EP-012](./epics/mvp/EP-012-onboarding.md)        | Onboarding & First-Time UX    | P1       | A-Activation | 📝 Defined |
| [EP-013](./epics/mvp/EP-013-education.md)         | Education Hub                 | P1       | B-Retention  | 📝 Defined |
| [EP-014](./epics/mvp/EP-014-captions.md)          | AI Caption Generation         | P0       | C-Core Value | 📝 Defined |

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

#### EP-001: AI Influencer Creation Wizard ✅

**6-Step Wizard Flow:**

- Step 1: Style (gender + style)
- Step 2: General (ethnicity + age)
- Step 3: Face (hair style/color + eye color)
- Step 4: Body (body type + breast size if female)
- Step 5: Identity (default outfit + archetype + personality + bio)
- Step 6: Generate (name + preview + confirm)

**AI Influencer Options:**

- 7 ethnicities, 4 body types, 7 hair styles
- 7 hair colors, 6 eye colors, 20 outfits
- 6 archetypes, 16 personality traits (pick 3)
- Gender-filtered options (auto-adjust per selection)

**UX Features:**

- Progress persistence (localStorage)
- Resume from last step
- Image-based option selection
- Preview before generation
- **NSFW toggle (18+ gate)**
- Validation before each step
- Handle/username generation (e.g., @luna.dreams)

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

#### EP-004: AI Influencer Dashboard ✅

**AI Influencer List:**

- Social profile card style (not just thumbnails)
- Name + handle + archetype tags
- Post count + liked count
- Quick actions (open studio, view profile, delete)

**AI Influencer Profile (Social Style):**

- Avatar + name + handle + bio
- Archetype + personality tags
- Stats (posts, images, liked)
- Posts grid with captions
- Like/Edit/Export actions per post

**Profile Tabs:**

- 📸 Posts (images + captions)
- ❤️ Liked (curated for export)
- 📁 All Images (raw gallery)
- ⚙️ Settings (edit profile)

#### EP-005: Content Studio & Generation ✅

**Content Studio UI:**

- Scene preset selector (8 options)
- Environment preset selector (7 options)
- Outfit change option (keep or change)
- Quality/Ratio/NSFW controls (existing)
- Credit cost preview

**Scene Presets (MVP - 8):**

1. Professional portrait
2. Candid lifestyle
3. Fashion editorial
4. Fitness motivation
5. Morning vibes
6. Night out
7. Cozy at home
8. Beach day

**Environment Presets (MVP - 7):**

1. Beach (ocean, golden hour)
2. Home - Bedroom (cozy, natural light)
3. Home - Living Room (modern, warm)
4. Office (professional, clean)
5. Cafe (trendy, warm interior)
6. Urban Street (city, street style)
7. Studio (plain background, professional)

**Outfit Changes:**

- Keep current (default from wizard)
- Change outfit → opens outfit picker
- Outfit change per generation (not permanent)

**Core Generation:**

- AI model integration (Replicate/Fal)
- Consistent face generation (seed locking)
- Image pack generation (5-10 images)
- Queue management
- Error handling & retries

**Generation Options (MVP):**

- Scene preset (new)
- Environment preset (new)
- Outfit selection (new)
- Aspect ratio selector (1:1, 9:16, 2:3)
- Quality mode toggle (Draft/HQ)
- NSFW toggle (safe mode)
- Progress indicator

**NSFW Routing:**

- Auto-select NSFW-capable models
- Compliant storage handling

#### EP-014: AI Caption Generation ✅

**Caption Generation:**

- Auto-generate caption for each image
- Based on: AI Influencer personality + scene + environment
- 1 caption per image (MVP)
- Pick or edit before saving

**Caption Picker UI:**

- Generated caption preview
- Custom caption input
- Skip option (no caption)
- Regenerate button

**Caption Features:**

- Archetype influences tone (Girl Next Door = relatable)
- Personality traits influence style (Flirty = suggestive)
- Scene context adds relevance
- Max 280 characters (Twitter-friendly)

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

| Feature                      | Reason                                 | Phase |
| ---------------------------- | -------------------------------------- | ----- |
| **Full Wardrobe System**     | MVP has outfit changes, not ownership  | P2    |
| **Image Sequences**          | Multi-scene stories, complexity        | P2    |
| **Custom Environments**      | MVP has presets only                   | P2    |
| **Scene Builder**            | Manual scene composition               | P2    |
| **Props/Items**              | Objects in scenes                      | P2    |
| Video generation             | Complexity, validate images first      | P2    |
| Lip-sync / talking head      | Depends on video                       | P2    |
| Voice cloning                | Complexity                             | P2    |
| Platform auto-posting (OF)   | Integration complexity                 | P2    |
| Content scheduling           | Needs platform integration             | P2    |
| Multi-influencer scenes      | Complexity                             | P2    |
| AI Influencer chat           | Different product (dFans.ai territory) | P3    |
| API access                   | B2B, not MVP focus                     | P3    |
| Team/agency features         | B2B                                    | P3    |
| Advanced NSFW controls       | Start with simple on/off               | P2    |
| Referral system              | Optimize CAC later                     | P2    |
| Mobile app                   | Web-first                              | P3    |
| i18n (multi-language)        | English only for MVP                   | P2    |
| Multiple caption options     | Pick from 3 captions                   | P2    |
| Caption tone/length controls | Advanced caption customization         | P2    |

### Simplified for MVP

| Feature               | MVP Version           | Full Version (Later)           |
| --------------------- | --------------------- | ------------------------------ |
| Auth                  | Email/password only   | + Social login, 2FA            |
| Pricing               | 1-2 plans             | Multiple tiers, annual         |
| AI Influencer editing | Regenerate only       | Full attribute editing         |
| Images per pack       | 5-10                  | Unlimited/configurable         |
| Export formats        | Generic resolution    | Platform-specific presets      |
| Analytics             | PostHog only          | Custom dashboard               |
| NSFW                  | Simple toggle         | Advanced controls, filters     |
| Scenes                | 8 presets             | Custom scene builder           |
| Environments          | 7 presets             | Custom environments, uploads   |
| Outfits               | Change per generation | Full wardrobe ownership        |
| Captions              | 1 per image           | Multiple options, tone control |
| Sequences             | ❌ Not in MVP         | Morning routine, storylines    |

---

## MVP Product Focus: AI Influencer Creation & Content Studio

### Core Value Proposition

Users come to **create AI Influencers and generate content for monetization**. The MVP must deliver:

1. **AI Influencer Creation** - Wizard flow, customization, identity, NSFW toggle
2. **Content Studio** - Scene/environment/outfit configuration, generation
3. **AI Captions** - Auto-generated captions matching persona
4. **Post Management** - Social profile view, like/export workflow
5. **Persistence** - AI Influencers saved, accessible anytime

### MVP Product Features

| Feature                          | Priority | Epic   | Notes |
| -------------------------------- | -------- | ------ | ----- |
| AI Influencer wizard (6-step)    | P0       | EP-001 | |
| **Hybrid Generation Pipeline**   | **P0**   | **EP-005** | **Standard (Instant) + HD (LORA)** |
| **Background LORA Training**     | **P0**   | **EP-005** | **Train while user explores app** |
| Content Studio UI                | P0       | EP-005 | |
| Scene presets (8)                | P0       | EP-005 |
| Environment presets (7)          | P0       | EP-005 |
| Outfit changes in generation     | P0       | EP-005 |
| AI caption generation            | P0       | EP-014 |
| Consistent face generation       | P0       | EP-005 |
| Social profile dashboard         | P0       | EP-004 |
| Posts gallery (image+caption)    | P0       | EP-008 |
| Like/favorite posts              | P0       | EP-008 |
| Export (image + caption copy)    | P0       | EP-008 |
| NSFW toggle                      | P0       | EP-001 |
| Aspect ratio selection           | P0       | EP-005 |
| Quality mode (draft/HQ)          | P0       | EP-005 |
| Form state persistence           | P0       | EP-001 |
| Auth & settings                  | P0       | EP-002 |
| Credit system & limits           | P0       | EP-009 |
| Subscription management          | P0       | EP-010 |
| Legal pages & compliance         | P0       | EP-011 |
| Onboarding experience            | P1       | EP-012 |
| Education hub                    | P1       | EP-013 |
| Emails & notifications           | P1       | EP-007 |

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

## Content Studio Features (MVP)

### Scene Presets (P0 - 8 options)

| Scene                 | Description                            | Use Case               |
| --------------------- | -------------------------------------- | ---------------------- |
| Professional portrait | Headshot style, confident, eye contact | Profile pics, business |
| Candid lifestyle      | Natural moment, authentic              | Relatable posts        |
| Fashion editorial     | Dramatic, magazine quality             | Fashion content        |
| Fitness motivation    | Athletic, energetic                    | Fitness niche          |
| Morning vibes         | Relaxed, fresh, natural light          | Morning posts          |
| Night out             | Glamorous, sophisticated               | Evening content        |
| Cozy at home          | Comfortable, intimate                  | Personal content       |
| Beach day             | Summer vibes, relaxed                  | Vacation/beach content |

### Environment Presets (P0 - 7 options)

| Environment        | Description           | Prompt Addition                              |
| ------------------ | --------------------- | -------------------------------------------- |
| Beach              | Ocean, golden hour    | "sunny beach, ocean background, golden hour" |
| Home - Bedroom     | Cozy, natural light   | "cozy bedroom, soft natural lighting"        |
| Home - Living Room | Modern, warm          | "stylish living room, modern decor"          |
| Office             | Professional, clean   | "professional office, clean workspace"       |
| Cafe               | Trendy, warm interior | "trendy cafe, coffee shop ambiance"          |
| Urban Street       | City, street style    | "city street, urban environment"             |
| Studio             | Plain background      | "photography studio, clean background"       |

### Outfit Changes (P0)

- **Keep current**: Use default outfit from wizard
- **Change outfit**: Pick from 20 options (same as wizard)
- **Per-generation**: Changes don't affect AI Influencer default

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

### Content Studio Features by Priority

| Feature                | MVP (P0)          | Phase 2                |
| ---------------------- | ----------------- | ---------------------- |
| Scene presets          | ✅ 8 options      | Custom scene builder   |
| Environment presets    | ✅ 7 options      | Custom environments    |
| Outfit changes         | ✅ Per generation | Full wardrobe system   |
| Aspect ratio selection | ✅ 3 options      | Custom sizes           |
| Quality toggle         | ✅ Draft/HQ       | Fine-tune control      |
| NSFW toggle            | ✅ Simple on/off  | Advanced filters       |
| Face consistency       | ✅ Seed locking   | Better control         |
| Progress indicator     | ✅ Loading state  | Queue position         |
| AI captions            | ✅ 1 per image    | Multiple options       |
| Sequences              | ❌                | ✅ Multi-scene stories |
| Face repair            | ❌                | ✅ Auto-fix            |
| Upscale                | ❌                | ✅ 2x/4x               |
| Model selection        | ❌ Auto           | ✅ Manual              |
| Props/items            | ❌                | ✅ Scene objects       |

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

**AI Influencer Creation (6-Step Wizard):**

- [ ] Step 1: Gender + Style selection
- [ ] Step 2: Ethnicity + Age selection
- [ ] Step 3: Hair style/color + Eye color
- [ ] Step 4: Body type (+ breast size if female)
- [ ] Step 5: Identity (Outfit + Archetype + Personality + Bio)
- [ ] Step 6: Name + Preview + Generate
- [ ] **NSFW toggle works (72% want it)**
- [ ] Form state persists in localStorage
- [ ] Resume from last step works

**Content Studio:**

- [ ] Studio UI opens from AI Influencer profile
- [ ] Scene preset selector (8 options)
- [ ] Environment preset selector (7 options)
- [ ] Outfit change option (keep or change)
- [ ] Aspect ratio selection (1:1, 9:16, 2:3)
- [ ] Quality mode toggle (Draft/HQ)
- [ ] Credit cost preview
- [ ] Generation progress indicator
- [ ] Error handling & retry

**AI Caption Generation:**

- [ ] Caption generated per image
- [ ] Caption uses AI Influencer personality
- [ ] Caption picker UI (pick/edit/skip)
- [ ] Caption saved with image

**AI Influencer Profile (Social Style):**

- [ ] Social profile header (avatar, name, handle, bio)
- [ ] Stats (posts, images, liked)
- [ ] Posts grid (image + caption preview)
- [ ] Like/Edit/Export actions per post
- [ ] Liked posts tab

**Export:**

- [ ] Download image
- [ ] Copy caption to clipboard
- [ ] Export image + caption.txt (optional)

**Quality:**

- [ ] Analytics tracking all key events
- [ ] Mobile responsive
- [ ] <3s page load

### P1: Nice to Have

- [ ] Email confirmation
- [ ] Forgot password flow
- [ ] Voice selection
- [ ] AI Influencer editing (beyond regenerate)
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
- Full wardrobe system
- Image sequences
- Custom environments
- Scene builder

---

## Success Metrics (MVP Product)

### Primary (Product Quality)

| Metric                     | Target | How to Measure |
| -------------------------- | ------ | -------------- |
| **Generation success**     | >95%   | Backend logs   |
| **D7 retention**           | >15%   | PostHog cohort |
| **AI Influencers/user**    | >2     | Database query |
| **Time to 1st influencer** | <10min | PostHog timing |
| **Posts/AI Influencer**    | >10    | Database query |

### Secondary (UX Quality)

| Metric                  | Target | How to Measure |
| ----------------------- | ------ | -------------- |
| NSFW toggle adoption    | >70%   | PostHog event  |
| Content Studio opens    | >80%   | PostHog event  |
| Caption acceptance rate | >60%   | PostHog event  |
| Like/favorite rate      | >30%   | PostHog event  |
| Export completion       | >50%   | PostHog event  |

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
| **Character → AI Influencer** | Better positioning, clearer value proposition    |
| **Content Studio (MVP)**      | Scene + environment presets, not custom builder  |
| **AI Captions (MVP)**         | Key differentiator, complete posts for export    |
| **8 Scene presets**           | Covers common content types, simple dropdown     |
| **7 Environment presets**     | Covers main locations, simple dropdown           |
| **Outfit change per gen**     | Flexibility without full wardrobe system         |
| **Sequences → Phase 2**       | Multi-scene stories add complexity               |
| **Full wardrobe → Phase 2**   | MVP has outfit changes, ownership is Phase 2     |

### Funnel Decisions (Separate)

| Decision              | Rationale                              |
| --------------------- | -------------------------------------- |
| $29/mo starting price | Validated in ghost test                |
| Lead with AI OnlyFans | 39% US users select this (funnel data) |
| Show curvy body types | 37% US prefer thick (funnel data)      |
| Finby for payments    | Already integrated in funnel           |

## Legal Requirements (MVP)

- [ ] Terms of Service page
- [ ] Privacy Policy page
- [ ] Cookie consent (if EU traffic)
- [ ] Content guidelines for AI generation
- [ ] **Age verification (18+) for NSFW**
- [ ] **NSFW content hosting compliance**
