# [EPIC] EP-006: Landing Page

## Overview

Marketing landing page that converts visitors into wizard users. Part of the **Funnel/Landing workstream** (separate from MVP product).

---

## Scope Note

| Concern | Owner |
|---------|-------|
| **MVP Product** (EP-001, EP-004, EP-005) | Product team |
| **Funnel/Landing** (EP-003, EP-006) | Funnel team |

**Key positioning**: AI influencer creation for OnlyFans (39% US user intent).

---

## Business Impact

**Target Metric**: [x] A - Activation

**Hypothesis**: When we clearly communicate value and reduce friction to start, visitors will enter the wizard.

**Success Criteria**:
- Landing → Wizard start: **>40%**
- Bounce rate: **<50%**
- Time to CTA click: **<30 seconds**

---

## Features

### F1: Hero Section
- Clear headline with value prop
- Subheadline with key benefit
- Primary CTA button
- Hero image/animation

### F2: Feature Highlights

- 3-4 key features emphasizing monetization
- Icons and short descriptions
- Visual examples if possible
- **Competitor comparison callout**

### F3: Social Proof
- User count or waitlist size
- Testimonials (if available)
- Trust badges

### F4: How It Works
- 3-step process explanation
- Simple visuals
- Reduces uncertainty

### F5: Final CTA

- Repeated call to action
- Urgency or incentive (optional)
- Secondary CTA (learn more)

### F6: Competitor Differentiation (NEW)

- "Why RYLA" section vs. alternatives
- Key differentiators: NSFW support, export presets
- Trust signals for monetization

---

## Acceptance Criteria

### AC-1: Hero Section
- [ ] Headline is visible above fold
- [ ] CTA button is prominent
- [ ] Page loads in <3 seconds
- [ ] Mobile responsive

### AC-2: Value Communication
- [ ] User understands product in <10 seconds
- [ ] Key benefits are clear
- [ ] No jargon or confusion

### AC-3: CTA Functionality
- [ ] Primary CTA leads to wizard
- [ ] CTA is visible without scrolling
- [ ] Button has hover/active states
- [ ] Works on all devices

### AC-4: Mobile Experience
- [ ] Layout adapts to mobile
- [ ] Text is readable
- [ ] CTA is thumb-accessible
- [ ] Images scale properly

---

## Analytics Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `landing_viewed` | Page loaded | `utm_source`, `utm_medium`, `referrer` |
| `landing_scrolled` | User scrolls | `scroll_depth` (25%, 50%, 75%, 100%) |
| `landing_cta_clicked` | CTA button clicked | `cta_location` (hero, middle, bottom) |
| `landing_feature_viewed` | Feature section visible | `feature_name` |
| `landing_comparison_viewed` | Why RYLA section visible | - |
| `landing_platform_mentioned` | Platform name clicked | `platform` (onlyfans, fanvue) |

---

## Copy (Draft) - UPDATED FOR MONETIZATION

### Hero

```
OLD: Create Your AI Influencer in Minutes
NEW: Create & Monetize Your AI Influencer

Subheadline: Generate consistent AI characters. Export ready for OnlyFans & Fanvue in one click. No design skills needed.

CTA: Start Earning →
```

### Features (Monetization-Focused)

```
1. One-Click Export to OnlyFans/Fanvue ★ NEW
   Platform-optimized images. No resizing. Just upload and earn.

2. Consistent Characters
   Same face across all your content. No more uncanny valley.

3. NSFW Support ★ (vs. Foxy, SynthLife who prohibit)
   Full creative freedom. Your character, your content.

4. All-in-One Platform
   Image generation, voice, and export in one place. No tool juggling.
```

### How It Works

```
1. Customize → Choose appearance, style, and content type
2. Generate → AI creates your unique character
3. Export → Download packs ready for OnlyFans, Fanvue, Instagram
4. Earn → Upload and start monetizing
```

### Why RYLA (NEW - Competitor Comparison)

```
| Feature            | RYLA | Foxy.ai | Higgsfield | Generic AI |
|--------------------|------|---------|------------|------------|
| OF/Fanvue Export   | ✅   | ❌      | ❌         | ❌         |
| NSFW Support       | ✅   | ❌      | ❌         | ❌         |
| Character Lock     | ✅   | ✅      | ✅         | ❌         |
| Self-Serve         | ✅   | ✅      | ✅         | ✅         |

"Other tools help you create. RYLA helps you earn."
```

### Final CTA

```
Ready to create your AI influencer and start earning?
[Start Creating →]
First character free. No credit card required.
```

---

## Design Notes

### Visual Style
- Clean, modern aesthetic
- Dark or light theme (test both)
- High-quality example images
- Smooth scroll animations

### Above the Fold
- Headline
- Subheadline  
- Primary CTA
- Hero visual (character example)

### Mobile Priority
- Stack elements vertically
- Large tap targets (48px+)
- Reduce animations
- Compress images

---

## User Stories

### ST-017: Understand Product
**As a** first-time visitor  
**I want to** quickly understand what RYLA does  
**So that** I can decide if it's for me

### ST-018: Start Creating
**As a** interested visitor  
**I want to** easily start the creation process  
**So that** I can try the product

---

## Technical Notes

### SEO Requirements (UPDATED)

```html
<title>RYLA - Create & Monetize AI Influencers | OnlyFans & Fanvue Ready</title>
<meta name="description" content="Create consistent AI influencers and export ready for OnlyFans, Fanvue, Instagram. NSFW support. Start free.">
<meta property="og:title" content="RYLA - AI Influencer Creator for Monetization">
<meta property="og:image" content="/og-image.png">
```

### Performance
- Lazy load below-fold images
- Optimize hero image (<200KB)
- Preload critical CSS
- Defer non-critical JS

---

## Non-Goals (Phase 2+)

- Pricing page (separate page later)
- Blog/content section
- FAQ section
- Multiple landing variants
- Video background

---

## Dependencies

- Design assets (hero image, icons)
- Example character images
- Copy finalized

