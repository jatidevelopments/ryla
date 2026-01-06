# RYLA Design System

> Single source of truth for all UI components. Based on **funnel-adult-v3** design system.

## Overview

The RYLA design system is built on:

- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - Accessible component primitives
- **Radix UI** - Unstyled, accessible components
- **class-variance-authority (CVA)** - Component variants
- **Plus Jakarta Sans** - Primary font family

## Quick Links

| Category | Path |
|----------|------|
| Design Tokens | `libs/ui/src/design-system/tokens.ts` |
| Component Variants | `libs/ui/src/design-system/variants.ts` |
| UI Components | `libs/ui/src/components/` |
| Global CSS | `apps/web/app/globals.css` |
| Fonts | `apps/web/public/fonts/plus-jakarta-sans/` |

---

## 🎨 Colors

### Primary Colors (Purple)

| Token | Value | CSS Variable | Usage |
|-------|-------|--------------|-------|
| `primary.light` | `#f0dbfa` | `--color-light-purple` | Light backgrounds |
| `primary.medium` | `#f0dbff` | `--color-medium-purple` | Medium accents |
| `primary.dark` | `#d5b9ff` | `--color-dark-purple` | Gradient start |
| `primary.semi` | `#b99cff` | `--color-semi-purple` | **Main primary**, buttons, focus |

### Accent Colors (Pink/Orange)

| Token | Value | CSS Variable | Usage |
|-------|-------|--------------|-------|
| `accent.pink` | `#ff437a` | `--color-pink` | Secondary CTAs |
| `accent.pinkRed` | `#f54d71` | `--color-pink-red` | Accent pink |
| `accent.orange` | `#fb6731` | `--color-orange` | Urgent CTAs |
| `accent.coralRed` | `#fd525a` | `--color-coral-red` | Error accent |
| `accent.coral` | `#ffb498` | `--color-coral` | Warm accent |

### Neutral Colors

| Token | Value | CSS Variable | Usage |
|-------|-------|--------------|-------|
| `neutral.black` | `#161619` | `--color-black` | Primary background |
| `neutral.black2` | `#1f1f24` | `--color-black-2` | Card backgrounds |
| `neutral.smoothGray` | `#323237` | `--color-smooth-gray` | Tertiary, borders |
| `neutral.gray1` | `#a1a1aa` | `--color-gray-1` | Secondary text |
| `neutral.gray2` | `#2a2a2f` | `--color-gray-2` | Input backgrounds |

### Semantic Colors

| Purpose | Color | Usage |
|---------|-------|-------|
| Success | `#00ed77` | Confirmations, online status |
| Warning | `#ffdda7` | Warnings, cautions |
| Error | `#fc594c` | Errors, destructive actions |
| Info | `#b99cff` | Information, hints |

---

## 🌈 Gradients

### Primary Gradient (Purple)

```css
/* CSS Class: bg-primary-gradient */
background: linear-gradient(45deg, #d5b9ff 0%, #b99cff 100%);
```

Used for: **Primary buttons**, selected states, focus rings

### Slider Range (Purple)

```css
/* CSS Variable: --slider-range-bg */
background: linear-gradient(to right, #d5b9ff, #b99cff);
```

### Secondary Gradient (Pink → Orange)

```css
/* CSS Class: gradient-border */
background: linear-gradient(135deg, #fd3a69, #fb6731);
```

Used for: Secondary CTAs, accent buttons

### Pink Button Gradient

```css
/* CSS Class: gradient-pink */
background: linear-gradient(to right, #fd407c, #ee79de, #ff6994);
filter: drop-shadow(0 4px 10px rgba(255, 28, 138, 0.49));
```

### Sale Button Gradient (Purple → Coral)

```css
/* CSS Class: sale-gradient-button */
background: linear-gradient(135deg, #d5b9ff 0%, #ffb498 100%);
```

---

## 🔤 Typography

### Font Stack

```css
--font-jakarta-sans: "Plus Jakarta Sans", serif;
```

Font files located at: `apps/web/public/fonts/plus-jakarta-sans/`

### Font Weights Available

- ExtraLight (200)
- Light (300)
- Regular (400)
- Medium (500)
- SemiBold (600)
- Bold (700)
- ExtraBold (800)

### Font Sizes

| Token | Size | Usage |
|-------|------|-------|
| `xs` | 12px | Captions, labels |
| `sm` | 14px | Body small, buttons |
| `base` | 16px | Body text |
| `lg` | 18px | Lead text |
| `xl` | 20px | Subheadings |
| `2xl` | 24px | H4 |
| `3xl` | 30px | H3 |
| `4xl` | 36px | H2 |
| `5xl` | 48px | H1 |

---

## 📐 Spacing

Based on 4px grid system (same as Tailwind defaults).

---

## 🔲 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius` | 10px | Default (cards, buttons) |
| `--radius-sm` | 6px | Small elements |
| `--radius-md` | 8px | Inputs |
| `--radius-lg` | 10px | Cards |
| `--radius-xl` | 14px | Modals |

---

## 🔘 Buttons

### Button Variants

| Variant | Description | CSS Class |
|---------|-------------|-----------|
| `default` | **Purple gradient (primary)** | `bg-primary-gradient` |
| `secondary` | Pink-orange gradient | `gradient-border` |
| `pink` | Full pink gradient with glow | `gradient-pink` |
| `purple-cta` | Solid purple CTA | - |
| `ghost-gradient` | Transparent with gradient border | `ghost-button` |
| `orange-cta` | Orange with pulse animation | `pulse-button` |
| `pink-cta` | Pink with pulse animation | `pulse-button-secondary` |
| `sale` | Purple-coral gradient | `sale-gradient-button` |
| `outline` | Gray with gradient hover | `gradient-border-block` |

### Button Sizes

| Size | Height | Usage |
|------|--------|-------|
| `xs` | 26px | Compact UI |
| `sm` | 32px | Secondary buttons |
| `default` | 40px | Standard |
| `lg` | 45px | Primary CTAs |
| `xl` | 52px | Hero CTAs |

```tsx
import { Button } from '@ryla/ui';

<Button variant="default" size="lg">Get Started</Button>
<Button variant="pink">Create Character</Button>
<Button variant="orange-cta">Unlock Now</Button>
```

---

## ✨ Animations

### Built-in Animations

| Class | Effect | Duration |
|-------|--------|----------|
| `pulse-button` | Orange glow pulse | 1.5s |
| `pulse-button-secondary` | Pink glow pulse | 1.5s |
| `pulse-button-calm` | Subtle orange pulse | 2s |
| `animate-spin-slow` | Slow rotation | 8s |
| `animate-shimmer` | Shimmer effect | 2.5s |
| `dots-loader` | Three-dot loader | 1s |

### Wave Animation (Voice indicator)

```css
.wave-dot-1 { animation: bounce-wave 1.5s infinite; }
.wave-dot-2 { animation: bounce-wave 1.3s infinite; }
.wave-dot-3 { animation: bounce-wave 1.1s infinite; }
```

---

## 🃏 Cards

### Card Variants

```tsx
import { Card } from '@ryla/ui';

// Default card
<Card>Content</Card>

// Interactive card (hover effects)
<Card variant="interactive">Clickable</Card>

// Selected state
<Card variant="selected">Selected item</Card>

// With gradient border
<Card variant="gradient">Gradient border</Card>
```

---

## 🖼️ Images & Masks

### Character Image Mask

```css
.character-image-mask {
  mask-image: linear-gradient(to bottom, #ffffff 43%, rgba(31, 31, 36, 0) 100%);
}
```

### Translucent Image Mask

```css
.translucent-image-mask {
  mask-image: linear-gradient(to bottom, #ffffff 43%, #73737300 100%);
}
```

### Image Skeleton Gradient

```css
.image-skeleton-gradient {
  background: linear-gradient(360deg, rgba(22, 22, 25, 0.92) 10.58%, rgba(18, 18, 20, 0.2) 99.2%);
}
```

---

## 🎚️ Sliders

### Slider Range Background

```css
.slider-range-bg {
  background: linear-gradient(to right, #ffc5b3, #ff417d);
}
```

### Slider Overlay Gradient (Carousel edges)

```css
.slider-overlay-gradient {
  background: linear-gradient(
    to right,
    rgba(31, 31, 36, 0.5) 0%,
    rgba(255, 255, 255, 0) 10%,
    rgba(255, 255, 255, 0) 90%,
    rgba(31, 31, 36, 0.5) 100%
  );
}
```

---

## 🔀 Switcher

Custom styled switch with 3D effect:

```css
.switcher-root {
  background: linear-gradient(213deg, #ff417d 0%, rgba(39, 39, 39, 0.51) 100%);
  /* Complex box-shadow for 3D effect */
}

.switcher-control {
  background: #141618;
  /* Complex box-shadow for thumb */
}
```

---

## 📦 Utility Classes

### Scroll Hiding

```css
.scroll-hidden {
  /* Hides scrollbar on all browsers */
}
```

### Number Input Controls

```css
.hide-number-controls {
  /* Hides +/- controls on number inputs */
}
```

### Text Selection

```css
.bg-clip-text {
  background-clip: text;
  -webkit-background-clip: text;
}
```

---

## 🎯 Component Usage

### Import from @ryla/ui

```tsx
// Components
import { Button, Card, Input, OptionCard, Badge } from '@ryla/ui';

// Design tokens
import { tokens, colors, gradients } from '@ryla/ui';

// Variants (for custom components)
import { buttonVariants, cardVariants } from '@ryla/ui';

// Utilities
import { cn } from '@ryla/ui';
```

---

## 📱 Screen Reference

| Screen | Primary Components | Key Styles |
|--------|-------------------|------------|
| **Wizard Step 1** | OptionCard (gender), Button | `gradient-border`, `shadow-white-glow` |
| **Wizard Step 2-4** | OptionCard (image), Button | `character-image-mask` |
| **Wizard Step 5** | OptionCard (emoji), Badge | `translucent-emoji-shadow` |
| **Wizard Step 6** | Textarea, Switch | `switcher-root` |
| **Generation** | Progress, Spinner | `slider-range-bg`, `pulse-button` |
| **Paywall** | Card, Button (CTA) | `sale-gradient-button`, `gradient-pink` |

---

## 📁 File Structure

```
libs/ui/src/
├── design-system/
│   ├── index.ts          # Exports all tokens & variants
│   ├── tokens.ts         # Design token values (from funnel)
│   └── variants.ts       # CVA component variants
├── components/
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   └── ...
└── lib/
    └── utils.ts          # cn() helper

apps/web/
├── app/
│   └── globals.css       # Full funnel CSS (colors, gradients, animations)
└── public/
    └── fonts/
        └── plus-jakarta-sans/  # Font files
```

---

## ✅ Copied from funnel-adult-v3

- ✅ Color palette (pink, orange, purples, neutrals)
- ✅ Plus Jakarta Sans font
- ✅ All CSS gradients
- ✅ Button variants and animations
- ✅ Slider styling
- ✅ Switch styling
- ✅ Image masks
- ✅ Scroll styling
- ✅ Pulse animations
- ✅ Wave animations
- ✅ Skeleton gradients

---

*Last updated: December 2025*
