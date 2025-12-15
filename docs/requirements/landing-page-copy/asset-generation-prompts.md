# Landing Page Asset Generation Prompts

## Overview

This document contains detailed prompts for generating landing page assets using AI image generation tools (e.g., Midjourney, DALL-E, Stable Diffusion, or similar). All assets should match RYLA's branding and design system.

## Design System Reference

### Color Palette

- **Background**: Dark near-black (#0A0A0B)
- **Primary Accent**: Purple gradient (#9333EA to #EC4899)
- **Text**: White (#FFFFFF) with 70% opacity for secondary text
- **UI Elements**: Glassmorphism with subtle borders (rgba(255,255,255,0.1))

### Typography

- **Primary Font**: DM Sans
- **Monospace**: JetBrains Mono (for numbers/stats)

### Style Guidelines

- Clean, modern SaaS interface
- Minimal, spacious layouts
- Purple gradient accents used sparingly
- Dark theme with glassmorphism effects
- Professional, polished appearance

---

## Step 1: Design - Character Selection UI

### Asset: `step-1-design.webp`

**Purpose**: Show the character customization interface where users can select characteristics like hair color, ethnicity, body type, etc.

**Dimensions**: 1920x1200px (16:10 aspect ratio)

**Prompt**:

```
A clean, modern interface showing an AI influencer character customization screen. Dark theme background (#0A0A0B). The interface displays:

- Left side: Preview panel showing 3 AI-generated face options in a grid (2x2 layout with one empty slot)
- Right side: Customization panel with organized sections:
  - Hair Color dropdown with color swatches (blonde, brunette, black, red, purple gradient accent)
  - Ethnicity dropdown with representative options
  - Body Type selector with icons
  - Style selector with fashion options
  - Personality Traits multi-select checkboxes
- UI elements use glassmorphism with subtle white borders (rgba(255,255,255,0.1))
- Purple gradient accents (#9333EA to #EC4899) on selected items and primary buttons
- Clean typography, minimal spacious layout with generous whitespace
- Professional SaaS aesthetic
- No text labels visible, just UI elements and icons
- Soft purple glow on interactive elements
```

**Alternative Shorter Prompt**:

```
Modern dark-themed SaaS interface for AI character customization. Left: 3 face previews in grid. Right: selection panels for hair color (color swatches), ethnicity (dropdown), body type (icons), style (cards). Glassmorphism UI with purple gradient accents (#9333EA to #EC4899). Dark background (#0A0A0B), white borders, clean typography. Minimal, professional design.
```

**Key Visual Elements**:

- 3 face preview thumbnails (top-left area)
- Color picker/swatches for hair color
- Dropdown menus with purple accent on selection
- Icon-based selectors
- Clean, organized layout
- Purple gradient highlights on active selections

---

## Step 2: Generate - Instagram Profile Grid

### Asset: `step-2-generate.webp`

**Purpose**: Show 7-10 high-quality generated images in an Instagram profile-like grid layout, demonstrating the generation process.

**Dimensions**: 1920x1200px (16:10 aspect ratio)

**Prompt**:

```
A clean, modern interface showing an Instagram-style profile grid with 7-10 hyper-realistic AI-generated influencer photos. Dark theme background (#0A0A0B). The grid displays:

- 3x3 or 3x4 grid layout (Instagram profile style)
- Each image shows a different high-quality portrait of the same AI influencer
- Images are hyper-realistic with perfect skin, hands, and details
- Consistent character face across all images
- Some images show "Generating..." loading state with purple gradient spinner
- Some images are fully loaded and sharp
- Grid has subtle white borders (rgba(255,255,255,0.1))
- Purple gradient accent (#9333EA to #EC4899) on loading indicators
- Clean, minimal interface with glassmorphism effects
- Professional SaaS aesthetic
- No text overlays, just the visual grid
- Soft purple glow on active/loading items
```

**Alternative Shorter Prompt**:

```
Instagram profile grid interface showing 7-10 AI-generated influencer photos. 3x3 grid layout. Hyper-realistic portraits with consistent character. Some images loading (purple gradient spinner), others complete. Dark background (#0A0A0B), glassmorphism borders, purple accents (#9333EA to #EC4899). Clean, minimal SaaS design.
```

**Key Visual Elements**:

- 3x3 or 3x4 grid (Instagram-style)
- Consistent character across all images
- Mix of loading and completed states
- Purple gradient loading indicators
- Hyper-realistic image quality
- Clean grid borders

---

## Step 3: Post - Platform Connection Dashboard

### Asset: `step-3-post.webp`

**Purpose**: Show the platform connection and scheduling interface.

**Dimensions**: 1920x1200px (16:10 aspect ratio)

**Prompt**:

```
Modern dark-themed SaaS dashboard showing platform connection and scheduling interface. Dark background (#0A0A0B). The interface displays:

- Platform connection cards in a grid: TikTok, Instagram, Fanvue, OnlyFans
- Each platform card shows:
  - Platform logo/icon
  - Connection status (connected/disconnected)
  - Purple gradient accent on connected platforms
- Scheduling calendar view with posts scheduled
- Viral-ready prompt library sidebar
- Glassmorphism UI elements with subtle borders
- Purple gradient accents (#9333EA to #EC4899) on active elements
- Clean typography, minimal design
- Professional SaaS aesthetic
```

**Alternative Shorter Prompt**:

```
SaaS dashboard for social media platform connections. Grid of platform cards (TikTok, Instagram, Fanvue, OnlyFans) with connection status. Scheduling calendar. Dark theme (#0A0A0B), glassmorphism UI, purple gradient accents (#9333EA to #EC4899). Clean, minimal design.
```

---

## Step 4: Earn - Earnings Dashboard

### Asset: `step-4-earn.webp`

**Purpose**: Show the real-time earnings tracking dashboard.

**Dimensions**: 1920x1200px (16:10 aspect ratio)

**Prompt**:

```
A clean, modern interface showing a real-time earnings dashboard. Dark theme background (#0A0A0B). The interface displays:

- Large earnings metric card with "$X,XXX" in purple gradient text
- Real-time subscriber count with animated number
- Engagement metrics (likes, comments, shares)
- Revenue chart/graph with purple gradient line
- Platform breakdown (earnings per platform)
- Time period selector (daily, weekly, monthly)
- Glassmorphism cards with subtle white borders (rgba(255,255,255,0.1))
- Purple gradient accents (#9333EA to #EC4899) on key metrics
- Clean, minimal interface with glassmorphism effects
- Professional SaaS aesthetic
- No text overlays, just the visual dashboard
- Soft purple glow on active/metrics
```

**Alternative Shorter Prompt**:

```
Earnings dashboard with real-time metrics. Large earnings display, subscriber count, engagement stats, revenue chart. Dark theme (#0A0A0B), glassmorphism cards, purple gradient accents (#9333EA to #EC4899). Clean analytics interface.
```

---

## Generation Tips

### For Midjourney / DALL-E / Stable Diffusion

1. **Use negative prompts** to avoid:

   - Text overlays or watermarks
   - Cluttered interfaces
   - Bright backgrounds
   - Unprofessional designs
   - Too many colors

2. **Style modifiers**:

   - "minimalist", "clean", "modern", "professional"
   - "glassmorphism", "dark theme", "SaaS interface"
   - "purple gradient accents", "subtle borders"

3. **Aspect ratio**: Always specify `--ar 16:10` or similar

4. **Quality**: Use high quality settings for sharp, detailed UI elements

5. **Iteration**: Generate multiple variations and select the best match to design system

### For Figma / Design Tools

If creating manually in Figma or similar:

1. Use the exact color values from the design system
2. Apply glassmorphism effects (backdrop blur + transparency)
3. Use DM Sans font family
4. Maintain consistent spacing (4px base unit)
5. Add subtle purple gradient accents on interactive elements
6. Export at 2x resolution for web (3840x2400px) then optimize

---

## File Naming Convention

All assets should be named:

- `step-1-design.webp`
- `step-2-generate.webp`
- `step-3-post.webp`
- `step-4-earn.webp`

Place in: `apps/landing/public/images/steps/`

---

## Quality Checklist

Before using assets, verify:

- [ ] Matches dark theme (#0A0A0B background)
- [ ] Purple gradient accents present (#9333EA to #EC4899)
- [ ] Glassmorphism effects visible
- [ ] Clean, minimal design
- [ ] No text overlays (or minimal, readable text)
- [ ] Professional SaaS aesthetic
- [ ] Correct aspect ratio (16:10)
- [ ] High resolution (1920x1200px minimum)
- [ ] Optimized file size (WebP format)
- [ ] Consistent with RYLA branding

---

## Updates

**Last Updated**: 2025-01-XX
**Version**: 1.0
**Maintained By**: Design Team
