# RYLA Landing Page Design System

## Overview

This design system defines the visual language for the RYLA landing page, inspired by [Mobbin.com](https://mobbin.com/)'s clean, spacious approach. The system emphasizes purple gradient accents, subtle scroll animations, and generous whitespace.

---

## 1. Typography

### Font Stack

| Role      | Font Family     | Usage                           |
| --------- | --------------- | ------------------------------- |
| Primary   | DM Sans         | All text, headings, body        |
| Monospace | JetBrains Mono  | Stats, numbers, code            |

### Type Scale

| Level   | Mobile       | Desktop      | Weight | Tracking | Line Height |
| ------- | ------------ | ------------ | ------ | -------- | ----------- |
| H1      | 36px         | 56px         | 700    | -0.02em  | 1.1         |
| H2      | 28px         | 40px         | 600    | -0.01em  | 1.2         |
| H3      | 20px         | 24px         | 600    | 0        | 1.3         |
| Body    | 16px         | 18px         | 400    | 0        | 1.6         |
| Small   | 14px         | 14px         | 500    | 0        | 1.5         |
| Caption | 12px         | 12px         | 500    | 0.02em   | 1.4         |

### Font Import

```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
```

---

## 2. Color Palette

### Background Colors

| Token           | Value      | Usage                    |
| --------------- | ---------- | ------------------------ |
| --bg-primary    | #0A0A0B    | Page background          |
| --bg-elevated   | #111113    | Cards, modals            |
| --bg-hover      | #1A1A1D    | Interactive hover states |

### Purple Accent Colors

| Token         | Value    | Usage                        |
| ------------- | -------- | ---------------------------- |
| --purple-400  | #C084FC  | Highlight text, links        |
| --purple-500  | #A855F7  | Primary accent               |
| --purple-600  | #9333EA  | Gradient start               |
| --pink-500    | #EC4899  | Gradient end                 |

### Gradients

| Token              | Value                                                    | Usage              |
| ------------------ | -------------------------------------------------------- | ------------------ |
| --gradient-primary | linear-gradient(135deg, #9333EA 0%, #EC4899 100%)        | CTAs, badges       |
| --gradient-glow    | radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%) | Background glow |
| --gradient-text    | linear-gradient(135deg, #C084FC 0%, #EC4899 100%)        | Gradient text      |

### Text Colors

| Token            | Value                    | Usage            |
| ---------------- | ------------------------ | ---------------- |
| --text-primary   | #FFFFFF                  | Headings         |
| --text-secondary | rgba(255,255,255,0.7)    | Body text        |
| --text-muted     | rgba(255,255,255,0.4)    | Captions, hints  |

### Border Colors

| Token           | Value                    | Usage              |
| --------------- | ------------------------ | ------------------ |
| --border-default| rgba(255,255,255,0.08)   | Default borders    |
| --border-hover  | rgba(255,255,255,0.15)   | Hover states       |
| --border-purple | rgba(168,85,247,0.5)     | Active/focus state |

---

## 3. Spacing

### Base Unit

The spacing system uses a 4px base unit.

| Token   | Value  | Rem      |
| ------- | ------ | -------- |
| --sp-1  | 4px    | 0.25rem  |
| --sp-2  | 8px    | 0.5rem   |
| --sp-3  | 12px   | 0.75rem  |
| --sp-4  | 16px   | 1rem     |
| --sp-5  | 20px   | 1.25rem  |
| --sp-6  | 24px   | 1.5rem   |
| --sp-8  | 32px   | 2rem     |
| --sp-10 | 40px   | 2.5rem   |
| --sp-12 | 48px   | 3rem     |
| --sp-16 | 64px   | 4rem     |
| --sp-20 | 80px   | 5rem     |
| --sp-24 | 96px   | 6rem     |
| --sp-32 | 128px  | 8rem     |

### Section Spacing

| Context         | Mobile    | Desktop   |
| --------------- | --------- | --------- |
| Section padding | 80px      | 120px     |
| Container max   | 100%      | 1200px    |
| Card gap        | 16px      | 24px      |
| Element gap     | 12px      | 16px      |

---

## 4. Border Radius

| Token         | Value   | Usage                  |
| ------------- | ------- | ---------------------- |
| --radius-sm   | 8px     | Buttons, badges        |
| --radius-md   | 12px    | Cards, inputs          |
| --radius-lg   | 16px    | Large cards, modals    |
| --radius-xl   | 24px    | Hero elements          |
| --radius-full | 9999px  | Pills, avatars         |

---

## 5. Shadows and Effects

### Glow Effects

```css
/* Purple glow for buttons and interactive elements */
--glow-purple: 0 0 30px rgba(168, 85, 247, 0.4);
--glow-purple-lg: 0 0 60px rgba(168, 85, 247, 0.3);

/* Subtle card shadow */
--shadow-card: 0 4px 24px rgba(0, 0, 0, 0.2);
```

### Backdrop Blur

```css
/* Glass effect for navigation */
--blur-nav: blur(16px);
background: rgba(10, 10, 11, 0.8);
backdrop-filter: var(--blur-nav);
```

---

## 6. Animation System

### Timing Functions

| Token              | Value                          | Usage              |
| ------------------ | ------------------------------ | ------------------ |
| --ease-out         | cubic-bezier(0.16, 1, 0.3, 1)  | Scroll animations  |
| --ease-in-out      | cubic-bezier(0.4, 0, 0.2, 1)   | Micro-interactions |
| --ease-spring      | cubic-bezier(0.34, 1.56, 0.64, 1) | Bouncy effects  |

### Duration

| Token           | Value   | Usage              |
| --------------- | ------- | ------------------ |
| --duration-fast | 150ms   | Hover states       |
| --duration-base | 200ms   | Micro-interactions |
| --duration-slow | 600ms   | Scroll animations  |
| --duration-stat | 2000ms  | Count-up stats     |

### Scroll Animations

#### Fade In Up

```css
/* Initial state */
.fade-in-up {
  opacity: 0;
  transform: translateY(30px);
}

/* Animated state */
.fade-in-up.visible {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 600ms var(--ease-out), 
              transform 600ms var(--ease-out);
}
```

#### Stagger Children

```css
/* Apply to container */
.stagger-children > * {
  transition-delay: calc(var(--index, 0) * 100ms);
}

/* Max stagger: 500ms */
.stagger-children > *:nth-child(n+6) {
  transition-delay: 500ms;
}
```

### Marquee Animation

```css
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.marquee {
  animation: marquee 30s linear infinite;
}

.marquee:hover {
  animation-play-state: paused;
}
```

### Count-Up Animation

```javascript
// Trigger: on scroll into view (once)
// Duration: 2000ms
// Easing: ease-out
// Format: "500,000+" with suffix
```

### Micro-Interactions

#### Button Hover

```css
.btn-primary:hover {
  transform: scale(1.02);
  box-shadow: var(--glow-purple);
  transition: all var(--duration-fast) var(--ease-in-out);
}
```

#### Card Hover

```css
.card:hover {
  border-color: var(--border-purple);
  transform: translateY(-2px);
  transition: all var(--duration-base) var(--ease-in-out);
}
```

#### Link Hover

```css
.link {
  position: relative;
}

.link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 1px;
  background: var(--purple-400);
  transition: width var(--duration-fast) var(--ease-in-out);
}

.link:hover::after {
  width: 100%;
}
```

### Parallax (Subtle)

```css
/* Hero background gradient - moves at 30% scroll speed */
.hero-bg {
  transform: translateY(calc(var(--scroll-y) * 0.3));
}

/* Apply via JS or CSS scroll-driven animations */
```

---

## 7. Component Tokens

### Navigation

| Property     | Value                        |
| ------------ | ---------------------------- |
| Height       | 64px                         |
| Background   | transparent → rgba(10,10,11,0.8) on scroll |
| Backdrop     | blur(16px) on scroll         |
| Position     | fixed                        |
| Z-index      | 50                           |

### Buttons

#### Primary Button

| Property     | Value                        |
| ------------ | ---------------------------- |
| Background   | var(--gradient-primary)      |
| Color        | white                        |
| Padding      | 14px 28px                    |
| Border-radius| 8px                          |
| Font-weight  | 600                          |
| Font-size    | 16px                         |

#### Secondary Button

| Property     | Value                        |
| ------------ | ---------------------------- |
| Background   | transparent                  |
| Color        | white                        |
| Border       | 1px solid rgba(255,255,255,0.2) |
| Padding      | 14px 28px                    |
| Border-radius| 8px                          |
| Font-weight  | 500                          |

### Cards

#### Feature Card

| Property     | Value                        |
| ------------ | ---------------------------- |
| Background   | var(--bg-elevated)           |
| Border       | 1px solid var(--border-default) |
| Padding      | 32px                         |
| Border-radius| 16px                         |

#### Testimonial Card

| Property     | Value                        |
| ------------ | ---------------------------- |
| Background   | transparent                  |
| Border       | 1px solid var(--border-default) |
| Padding      | 24px                         |
| Border-radius| 12px                         |
| Min-width    | 350px                        |

---

## 8. Purple Accent Usage Guidelines

### Where to Use Purple Gradient

1. **Primary CTA buttons** - Always use gradient background
2. **Highlighted pricing tier** - Gradient border or "Popular" badge
3. **Step numbers** - Gradient text or badge background
4. **Hover states** - Purple glow on cards and buttons
5. **Hero background** - Subtle radial gradient glow
6. **Stats numbers** - Gradient text for emphasis

### Where NOT to Use

- Body text (keep white/gray for readability)
- Section backgrounds (keep dark for contrast)
- Too many elements at once (max 1-2 per section)
- Small text or captions

---

## 9. Simplicity Guidelines

### Do

- One CTA per section (max 2 in hero)
- Generous whitespace between sections (120px+)
- Maximum 3 items per row (cards, features)
- Let images and content breathe
- Use animations sparingly (fade-in is usually enough)
- Keep navigation minimal (logo + single CTA)

### Don't

- Multiple competing animations
- Heavy parallax that causes jank
- Too many colors or gradient variations
- Dense information walls
- Autoplay videos with sound
- More than 2 font families

---

## 10. Accessibility

### Color Contrast

- Text on dark background: minimum 4.5:1 ratio
- Large text: minimum 3:1 ratio
- Interactive elements: clear focus states

### Motion

- Respect `prefers-reduced-motion`
- Provide static fallbacks for animations
- Avoid flashing content

### Focus States

```css
*:focus-visible {
  outline: 2px solid var(--purple-500);
  outline-offset: 2px;
}
```

---

## 11. Responsive Breakpoints

| Breakpoint | Value   | Usage               |
| ---------- | ------- | ------------------- |
| sm         | 640px   | Small tablets       |
| md         | 768px   | Tablets             |
| lg         | 1024px  | Laptops             |
| xl         | 1280px  | Desktops            |
| 2xl        | 1536px  | Large screens       |

---

## 12. Performance Targets

| Metric                     | Target    |
| -------------------------- | --------- |
| First Contentful Paint     | < 1.5s    |
| Largest Contentful Paint   | < 2.5s    |
| Cumulative Layout Shift    | < 0.1     |
| Animation frame rate       | 60fps     |

