# [EPIC] EP-006: Landing Page

## Overview

Marketing landing page that converts visitors into wizard users.

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
- 3-4 key features
- Icons and short descriptions
- Visual examples if possible

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

---

## Copy (Draft)

### Hero
```
Headline: Create Your AI Influencer in Minutes
Subheadline: Generate consistent, realistic AI characters for content creation. No design skills needed.
CTA: Start Creating →
```

### Features
```
1. Consistent Characters
   Same face across all your content. No more uncanny valley.

2. One Platform
   Image generation, voice, and export in one place. No tool juggling.

3. Your Character, Your Rules
   Full customization. Commercial rights included.
```

### How It Works
```
1. Customize → Choose appearance, style, and personality
2. Generate → AI creates your unique character
3. Download → Get image packs ready for posting
```

### Final CTA
```
Ready to create your AI influencer?
[Start Free →]
No credit card required
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

### SEO Requirements
```html
<title>RYLA - Create AI Influencers in Minutes</title>
<meta name="description" content="Generate consistent, realistic AI characters for content creation. No design skills needed. Start free.">
<meta property="og:title" content="RYLA - AI Influencer Creator">
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

