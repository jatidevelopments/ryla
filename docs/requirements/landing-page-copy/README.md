# Landing Page Copy & Design System

## Overview

This directory contains the complete landing page documentation for the RYLA landing page app, including:

- Three distinct versions of landing page copy
- A comprehensive design system inspired by [Mobbin.com](https://mobbin.com/)
- Page structure and section specifications

## Structure

### Design System

- **[design-system.md](./design-system.md)** - Complete design tokens: typography, colors, spacing, animations
- **[page-structure.md](./page-structure.md)** - Section-by-section breakdown with component specifications
- **[asset-generation-prompts.md](./asset-generation-prompts.md)** - AI prompts for generating landing page assets with accurate branding

### Copy Versions

- **[funnel-marketing-analysis.md](./funnel-marketing-analysis.md)** - Complete extraction of marketing copy and messaging from the working funnel
- **[assets-inventory.md](./assets-inventory.md)** - Catalog of all available assets from the funnel project
- **[version-1-aura-based.md](./version-1-aura-based.md)** - Landing page copy based on the AURA template, adapted for RYLA
- **[version-2-merged.md](./version-2-merged.md)** - Merged copy combining AURA's polished language with funnel's direct value propositions
- **[version-3-funnel-based.md](./version-3-funnel-based.md)** - Pure funnel-based copy, unbiased and conversion-focused
- **[version-4-minimal-saas.md](./version-4-minimal-saas.md)** - Mobbin-inspired minimal copy (~400 words total, maximum impact)

## Usage

Each version can be implemented as a JSON configuration file in `apps/landing/data/landing-pages/`:

- `ryla-version-1-aura.json`
- `ryla-version-2-merged.json`
- `ryla-version-3-funnel.json`

## A/B Testing

These versions are designed for A/B testing to determine which messaging resonates best with the target audience:

- **Version 1**: Polished, professional (AURA-style)
- **Version 2**: Balanced approach (merged)
- **Version 3**: Direct, conversion-focused (funnel-style)

## Key Differences

| Aspect           | V1 (AURA)     | V2 (Merged)        | V3 (Funnel)        | V4 (Minimal)    |
| ---------------- | ------------- | ------------------ | ------------------ | --------------- |
| **Tone**         | Professional  | Balanced           | Conversion-focused | Ultra-minimal   |
| **Word Count**   | ~2,000        | ~1,800             | ~2,500             | ~400            |
| **Headline**     | 8 words       | 10 words           | 12 words           | 6 words         |
| **Features**     | General       | Specific + general | Technical details  | 1-sentence each |
| **How It Works** | 3 steps       | 5 steps            | 7 steps            | 4 steps         |
| **Inspiration**  | AURA template | AURA + Funnel      | Funnel messaging   | Mobbin.com      |

## Implementation

The V2 landing page is implemented at `/v2` route using:

### CSS Design Tokens

Location: `apps/landing/styles/design-tokens.css`

Key features:

- Purple gradient accent colors (`--purple-600` to `--pink-500`)
- Dark theme with near-black backgrounds
- Generous spacing system (120px section padding)
- Subtle animations (fade-in-up, count-up, marquee)

### Component Libraries

**Animation Components** (`apps/landing/components/animations/`)

- `FadeInUp` - Scroll-triggered fade animation
- `StaggerChildren` - Staggered child animations
- `CountUp` - Animated number counter
- `LogoMarquee` - Horizontal scrolling logo bar

**RYLA UI Components** (`apps/landing/components/ryla-ui/`)

- `RylaButton` - Primary/secondary/gradient buttons with glow effects
- `RylaCard`, `FeatureCard`, `TestimonialCard`, `PricingCard` - Card variants
- `Section`, `Container`, `SectionHeader` - Layout components
- `GradientBackground`, `Badge`, `Divider` - Decorative elements

**Page Sections** (`apps/landing/components/sections/`)

- `Navigation` - Fixed nav with blur-on-scroll
- `HeroSection` - Main hero with CTAs and logo marquee
- `StatsSection` - Animated statistics
- `FeatureShowcase` - Feature cards grid
- `HowItWorksSection` - Step-by-step process
- `FinalCTASection` - Bottom call-to-action
- `Footer` - Site footer

### Design Principles

Based on [Mobbin.com](https://mobbin.com/) analysis:

1. **Clean, spacious layout** - Generous whitespace between sections
2. **Purple gradient accents** - Used sparingly for CTAs and highlights
3. **Subtle scroll animations** - Fade-in-up with stagger delays
4. **Simple color palette** - Dark background, white text, purple accents
5. **Single CTA focus** - One primary action per section
