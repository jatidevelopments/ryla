# Landing App User Journey

**App**: `apps/landing`  
**Domain**: `www.ryla.ai` / `ryla.ai`  
**Purpose**: Marketing website - public-facing site for brand awareness, SEO, and lead generation

---

## Overview

The landing app is the marketing website that showcases RYLA's value proposition, drives brand awareness, and converts visitors into leads. It's optimized for SEO and conversion.

## Key User Flows

### 1. Visitor Discovery Flow

**Goal**: Discover RYLA and understand value proposition  
**Target Time**: < 2 minutes

```
┌─────────────┐
│   HOMEPAGE  │ ← SEO, Ads, Social, Direct
│      /      │
└──────┬──────┘
       │ Scroll/Browse
       ▼
┌─────────────┐
│   SECTIONS  │
│             │
│ Hero
│ Stats
│ Features
│ How It Works
│ Testimonials
│ Pricing
│ FAQ
│ Final CTA
└──────┬──────┘
       │ "Get Started" / "Start Creating"
       ▼
┌─────────────┐
│   FUNNEL    │ ← Redirect to goviral.ryla.ai
│  (external) │
└─────────────┘
```

**Key Events**:
- `landing.viewed`
- `landing.section.viewed`
- `landing.cta.clicked`
- `landing.funnel.redirected`

---

### 2. SEO Discovery Flow

**Goal**: Find RYLA via search engines  
**Target Time**: < 1 minute to understand

```
┌─────────────┐
│  SEARCH     │ ← Google, Bing, etc.
│   RESULT    │
└──────┬──────┘
       │ Click
       ▼
┌─────────────┐
│   HOMEPAGE  │
│      /      │
└──────┬──────┘
       │ Read content
       ▼
┌─────────────┐
│   SECTIONS  │
│             │
│ [Read Features]
│ [View Pricing]
│ [Read FAQ]
└──────┬──────┘
       │ "Get Started"
       ▼
┌─────────────┐
│   FUNNEL    │
│  (external) │
└─────────────┘
```

**Key Events**:
- `landing.seo.landed`
- `landing.content.read`
- `landing.cta.clicked`

---

### 3. Social Media Discovery Flow

**Goal**: Discover RYLA via social media  
**Target Time**: < 30 seconds to engage

```
┌─────────────┐
│   SOCIAL    │ ← TikTok, Instagram, etc.
│    POST     │
└──────┬──────┘
       │ Click link
       ▼
┌─────────────┐
│   HOMEPAGE  │
│      /      │
└──────┬──────┘
       │ Quick scan
       ▼
┌─────────────┐
│   HERO      │ ← Immediate value prop
│   SECTION   │
└──────┬──────┘
       │ "Get Started"
       ▼
┌─────────────┐
│   FUNNEL    │
│  (external) │
└─────────────┘
```

**Key Events**:
- `landing.social.landed`
- `landing.hero.viewed`
- `landing.cta.clicked`

---

## Screen Inventory

### Public Screens

| ID | Screen | Route | Purpose | Key Event |
|----|--------|-------|---------|-----------|
| L-P-01 | Homepage | `/` | Main landing page | `landing.viewed` |
| L-P-02 | Landing Variant | `/[variant]` | Persona-specific landing | `landing.variant.viewed` |

### Landing Page Sections

| ID | Section | Purpose | Key Event |
|----|---------|---------|-----------|
| L-S-01 | Navigation | Site navigation | `landing.nav.viewed` |
| L-S-02 | Hero | Value proposition | `landing.hero.viewed` |
| L-S-03 | Stats | Social proof | `landing.stats.viewed` |
| L-S-04 | Features | Feature showcase | `landing.features.viewed` |
| L-S-05 | How It Works | Process explanation | `landing.how_it_works.viewed` |
| L-S-06 | Testimonials | Social proof | `landing.testimonials.viewed` |
| L-S-07 | Pricing | Pricing plans | `landing.pricing.viewed` |
| L-S-08 | FAQ | Common questions | `landing.faq.viewed` |
| L-S-09 | Final CTA | Conversion | `landing.final_cta.viewed` |
| L-S-10 | Footer | Links and info | `landing.footer.viewed` |

---

## Landing Page Variants

The landing app supports multiple landing page variants:

| Variant | ID | Purpose | Target Audience |
|---------|----|---------|-----------------|
| Default | `normal-flow` | Standard landing | General audience |
| Video Flow | `video-flow` | Video-focused | Video creators |
| CloseUp Style | `closeup-style` | Minimal design | Design-focused |
| Persona-Specific | `fashion-creator-emma` | Targeted persona | Specific niche |

---

## Navigation Structure

### Main Navigation

```
[Logo] ── [Features] ── [Pricing] ── [Testimonials] ──────── [Get Started] [Login]
```

### Mobile Navigation

```
[☰ Menu] ─────────────────────────────────── [Logo]

Menu:
├── Features
├── Pricing
├── Testimonials
├── Get Started
└── Login
```

---

## Key Touchpoints

### Awareness Touchpoints

| Touchpoint | Screen | Action | Event | Metric |
|------------|--------|--------|-------|--------|
| Homepage view | Homepage | View | `landing.viewed` | E (CAC) |
| Section view | Section | Scroll | `landing.section.viewed` | E (CAC) |
| CTA click | CTA | Click | `landing.cta.clicked` | E (CAC) |
| Funnel redirect | CTA | Redirect | `landing.funnel.redirected` | E (CAC) |

### Conversion Touchpoints

| Touchpoint | Screen | Action | Event | Metric |
|------------|--------|--------|-------|--------|
| Pricing view | Pricing | View | `landing.pricing.viewed` | D (Conversion) |
| FAQ view | FAQ | View | `landing.faq.viewed` | D (Conversion) |
| Final CTA click | Final CTA | Click | `landing.final_cta.clicked` | D (Conversion) |

---

## SEO Optimization

### Structured Data

- **FAQ Schema**: FAQ section with structured data
- **Pricing Schema**: Pricing plans with structured data
- **Organization Schema**: Company information

### Content Strategy

- **Hero**: Clear value proposition
- **Features**: Key benefits highlighted
- **How It Works**: Process explanation
- **Testimonials**: Social proof
- **Pricing**: Transparent pricing
- **FAQ**: Address common questions

---

## Analytics Mapping

| Journey Stage | Business Metric | Key Event |
|---------------|-----------------|-----------|
| Awareness | E (CAC) | `landing.viewed` |
| Acquisition | E (CAC) | `landing.funnel.redirected` |

---

## Error States

| Screen | Error | User Sees | Recovery |
|--------|-------|-----------|----------|
| Homepage | Load error | Error message | Refresh |
| Section | Content error | Fallback content | Continue browsing |

---

## Related Documentation

- **SEO**: `docs/technical/guides/SEO-SGO-SETUP.md`
- **Epics**: `docs/requirements/epics/landing/EP-006-landing.md`
- **Customer Journey**: `docs/journeys/CUSTOMER-JOURNEY.md`
