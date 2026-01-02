# Studio Preset Thumbnail Generator

Generates all thumbnail images for Studio presets (styles, scenes, lighting) using Fal.ai API.

## Prerequisites

1. **Fal.ai API Key**: Set `FAL_KEY` environment variable
   ```bash
   export FAL_KEY=your_fal_api_key_here
   ```

2. **Node.js**: Version 18+ (for native `fetch` support)

## Usage

```bash
# From project root
cd scripts
tsx generate-studio-preset-thumbnails.ts
```

Or using ts-node:
```bash
npx tsx scripts/generate-studio-preset-thumbnails.ts
```

## What It Generates

The script generates **44 thumbnail images** total:

- **20 Visual Styles** → `apps/web/public/styles/*.webp`
- **14 Scenes** → `apps/web/public/scenes/*.webp`
- **10 Lighting Settings** → `apps/web/public/lighting/*.webp`

## Image Specifications

- **Dimensions**: 768×960 pixels (4:5 aspect ratio)
- **Format**: WebP (or PNG/JPEG from Fal.ai, saved as-is)
- **Style**: Professional, consistent editorial aesthetic
- **Model**: Fal.ai Flux Schnell (fast generation)

## Output Structure

```
apps/web/public/
├── styles/
│   ├── general.webp
│   ├── iphone.webp
│   ├── realistic.webp
│   └── ... (20 total)
├── scenes/
│   ├── beach-sunset.webp
│   ├── city-rooftop.webp
│   └── ... (14 total)
└── lighting/
    ├── natural-daylight.webp
    ├── golden-hour.webp
    └── ... (10 total)
```

## Features

- ✅ **Skips existing files** - Won't regenerate if thumbnail already exists
- ✅ **Rate limiting** - 1 second delay between requests to avoid API limits
- ✅ **Error handling** - Continues on failure, reports summary at end
- ✅ **Progress logging** - Shows which preset is being generated

## After Generation

Once all thumbnails are generated, update `apps/web/components/studio/generation/types.ts` to remove the placeholder logic:

```typescript
// Remove this mapping that forces placeholders:
export const VISUAL_STYLES: VisualStyle[] = VISUAL_STYLES_RAW.map((s) => ({
  ...s,
  thumbnail: PLACEHOLDER_THUMBNAIL,  // ← Remove this
}));

// Use the raw definitions directly:
export const VISUAL_STYLES = VISUAL_STYLES_RAW;
```

## Cost Estimate

Using Fal.ai Flux Schnell:
- ~$0.01-0.05 per image
- **44 images** ≈ **$0.44 - $2.20** total

## Troubleshooting

**Error: FAL_KEY environment variable is required**
- Set the environment variable before running the script

**Error: Fal.ai API error (429)**
- Rate limit hit - wait a few minutes and retry
- The script includes rate limiting, but API limits may still apply

**Error: Fal.ai returned no image URL**
- Check the API response format - Fal.ai may have changed their response structure
- Check the console output for the full response

