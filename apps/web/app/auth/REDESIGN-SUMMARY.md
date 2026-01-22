# Auth Page Redesign - ImagineArt Style

## Overview

The RYLA auth page has been redesigned to match the modern, clean style of ImagineArt's login/signup interface. The new design features a two-column layout for desktop (form on left, promotional images on right) and a single-column responsive layout for mobile.

## Key Changes

### 1. Design Updates
- **Dark Modal**: Rounded corners, dark gray background (#1A1A1D)
- **Logo & Welcome**: RYLA icon with "Welcome to RYLA" title
- **Social Login Buttons**: 
  - Google (white button with Google logo)
  - Facebook (dark gray button with Facebook logo)
  - Discord (dark gray button with Discord logo)
- **Email Input**: With envelope icon on the left
- **Continue Button**: Dark gray button matching the design
- **Terms & Privacy**: Links at the bottom in purple accent color

### 2. Responsive Design
- **Mobile**: Single column, full-width form
- **Desktop**: Two-column layout with promotional image carousel on the right

### 3. New Components
- `FacebookButton` - Facebook OAuth button component
- `DiscordButton` - Discord OAuth button component
- `PromotionalImageCarousel` - Cycles through 5 promotional images

### 4. Promotional Images

Five promotional images need to be generated and placed in `apps/web/public/`:
- `auth-promo-1.webp` - Tech Fashionista
- `auth-promo-2.webp` - Creative Influencer
- `auth-promo-3.webp` - Business Professional
- `auth-promo-4.webp` - Lifestyle Creator
- `auth-promo-5.webp` - Fashion Forward

See `apps/web/public/auth-promo-prompts.md` for detailed generation prompts.

## File Changes

### Modified Files
- `apps/web/app/auth/page.tsx` - Main auth page redesign
- `apps/web/app/auth/components/email-step.tsx` - Updated to show social buttons first
- `apps/web/app/auth/components/google-button.tsx` - Changed to white button style
- `apps/web/app/auth/components/index.ts` - Added new button exports

### New Files
- `apps/web/app/auth/components/facebook-button.tsx` - Facebook auth button
- `apps/web/app/auth/components/discord-button.tsx` - Discord auth button
- `apps/web/public/auth-promo-prompts.md` - Image generation prompts

## Next Steps

1. **Generate Promotional Images**: Use the prompts in `auth-promo-prompts.md` to generate 5 images
2. **Implement Facebook/Discord Auth**: Currently placeholder handlers - implement actual OAuth flows when ready
3. **Test Responsive Design**: Verify mobile and desktop layouts work correctly
4. **Optimize Images**: Ensure all promotional images are < 200KB and properly compressed

## Design Notes

- The design maintains RYLA's purple/pink gradient theme
- All buttons follow the ImagineArt style (white for primary, dark gray for secondary)
- The promotional image carousel automatically cycles every 5 seconds
- Fallback gradient background shows if images don't exist yet
