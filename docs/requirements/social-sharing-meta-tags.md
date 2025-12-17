# Social Sharing Meta Tags Implementation

## Summary

Updated all three apps (landing, funnel, web) with comprehensive Open Graph and Twitter Card meta tags for proper social media sharing.

## Changes Made

### 1. Landing App (`apps/landing/app/layout.tsx`)

- ✅ Already had good meta tags
- ✅ Enhanced with:
  - Twitter creator/site handles (@RylaAI)
  - Complete description in Open Graph
  - Image type specification (image/png)
  - Updated alt text to match title

### 2. Funnel App (`apps/funnel/app/layout.tsx`)

- ✅ Replaced video URL with static OG image (`/og-image.png`)
- ✅ Added Twitter creator/site handles
- ✅ Enhanced Open Graph description
- ✅ Added image type specification
- ✅ Fixed HTML lang attribute for accessibility

### 3. Web App (`apps/web/app/layout.tsx`)

- ✅ Added comprehensive metadata (was minimal before)
- ✅ Added Open Graph tags
- ✅ Added Twitter Card tags
- ✅ Added keywords, authors, robots directives
- ✅ Added canonical URL
- ✅ Added metadataBase for proper URL resolution

## OG Image Requirements

All apps now reference `/og-image.png` which should be:

- **Dimensions**: 1200x630 pixels (1.91:1 ratio)
- **Format**: PNG
- **Location**: `/public/og-image.png` in each app

See `docs/requirements/og-image-prompt.md` for the detailed generation prompt.

## Meta Tags Included

### Open Graph (Facebook, LinkedIn, etc.)

- `og:title` - Page title
- `og:description` - Page description
- `og:type` - website
- `og:url` - Canonical URL
- `og:image` - OG image (1200x630)
- `og:image:width` - 1200
- `og:image:height` - 630
- `og:image:type` - image/png
- `og:site_name` - RYLA / Ryla.ai
- `og:locale` - en_US

### Twitter Card

- `twitter:card` - summary_large_image
- `twitter:title` - Page title
- `twitter:description` - Page description
- `twitter:image` - OG image URL
- `twitter:creator` - @RylaAI
- `twitter:site` - @RylaAI

### SEO Meta Tags

- Title (with template)
- Description
- Keywords
- Authors, Creator, Publisher
- Robots directives
- Canonical URL
- Icons and manifest

## Testing

After generating and placing the OG image, test using:

1. **Facebook Sharing Debugger**

   - https://developers.facebook.com/tools/debug/
   - Enter URL and click "Scrape Again" to refresh cache

2. **Twitter Card Validator**

   - https://cards-dev.twitter.com/validator
   - Enter URL to preview Twitter card

3. **LinkedIn Post Inspector**

   - https://www.linkedin.com/post-inspector/
   - Enter URL to preview LinkedIn share

4. **Open Graph Preview**
   - https://www.opengraph.xyz/
   - General OG tag previewer

## Next Steps

1. **Generate OG Image**: Use the prompt in `docs/requirements/og-image-prompt.md`
2. **Place Image**: Copy `og-image.png` to:
   - `apps/landing/public/og-image.png`
   - `apps/funnel/public/og-image.png` (or use CDN)
   - `apps/web/public/og-image.png`
3. **Optimize**: Compress image to < 500KB while maintaining quality
4. **Test**: Use the testing tools above to verify all platforms
5. **Clear Caches**: Use the debuggers to clear cached previews

## Environment Variables

Ensure these are set for proper URL resolution:

- `NEXT_PUBLIC_SITE_URL` (landing: `https://ryla.ai`)
- `NEXT_PUBLIC_SITE_URL` (funnel: `https://goviral.ryla.ai`)
- `NEXT_PUBLIC_SITE_URL` (web: `https://app.ryla.ai`)

## Notes

- Funnel app uses CDN for assets via `withCdn()` helper
- All apps use consistent branding and messaging
- Meta tags follow Next.js 13+ App Router metadata API
- All images use absolute URLs via `metadataBase`
