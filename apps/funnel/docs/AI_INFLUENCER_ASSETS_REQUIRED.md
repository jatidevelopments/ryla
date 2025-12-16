# AI Influencer Step Assets Required

This document lists all assets required for the AI Influencer funnel steps.

## Asset Directories

### 1. `/public/character-assets/` (21MB) - **REQUIRED**
These are PNG assets used for body customization:

#### Body Types (`/character-assets/body-shapes/female/`)
- `female-body-skinny.png` - Petite body type
- `female-body-well-built.png` - Muscular body type
- `female-body-athletic.png` - Athletic body type
- `female-body-curvy.png` - Thick body type

#### Breast Types (`/character-assets/breast-sizes/`)
- `female-breast-medium.png` - Regular
- `female-breast-small.png` - Perky
- `female-breast-large.png` - Saggy
- `female-breast-extra-large.png` - Torpedo

#### Ass Sizes (`/character-assets/butt-sizes/`)
- `female-butt-small.png` - Small
- `female-butt-medium.png` - Medium
- `female-butt-large.png` - Large
- `female-butt-extra-large.png` - Huge

#### Hair Styles (`/character-assets/hair-styles/female/`)
- `female-hair-bun.png` - Bun
- `female-hair-long.png` - Long
- `female-hair-short.png` - Short
- `female-hair-curly.png` - Curly Long
- `female-hair-ponytail.png` - Hair Bow
- Additional styles as defined in constants

### 2. `/public/mdc-images/influencer-assets/` (178 WebP files) - **REQUIRED**
These are ethnicity-specific WebP assets dynamically loaded based on user selections:

#### Base Models (`/mdc-images/influencer-assets/base-models/`)
- 6 base model images (one per ethnicity)

#### Eye Colors (`/mdc-images/influencer-assets/eye-colors/{ethnicity}/`)
- 19 total files across 6 ethnicities (arab, asian, black, caucasian, latina, mixed)
- Colors: blue, brown, green, grey, hazel, amber

#### Hair Colors (`/mdc-images/influencer-assets/hair-colors/{ethnicity}/`)
- 16 total files across 6 ethnicities
- Colors: blonde, ginger, brunette, black

#### Hair Styles (`/mdc-images/influencer-assets/hair-styles/{ethnicity}/`)
- 32 total files across 6 ethnicities
- Styles: bun, long, short, curly-long, hair-bow, braids, wavy, etc.

#### Skin Colors (`/mdc-images/influencer-assets/skin-colors/{ethnicity}/`)
- 20 total files across 6 ethnicities
- Colors: light, medium, tan, dark

#### Face Shapes (`/mdc-images/influencer-assets/face-shapes/{ethnicity}/`)
- 30 total files across 6 ethnicities
- Shapes: oval, round, square, heart, diamond

#### Age Ranges (`/mdc-images/influencer-assets/age-ranges/{ethnicity}/`)
- 24 total files across 6 ethnicities
- Ranges: 18-25, 26-33, 34-41, 42-50

#### Skin Features (`/mdc-images/influencer-assets/skin-features/`)
- 11 total files
- Categories: freckles, scars, beauty-marks
- Values: none, light, medium, heavy, small, large, single, multiple

#### Tattoos (`/mdc-images/influencer-assets/tattoos/`)
- 5 total files
- Values: none, small, medium, large, full-body

#### Piercings (`/mdc-images/influencer-assets/piercings/`)
- 6 total files
- Values: none, ear, nose, lip, eyebrow, multiple

#### Outfits (`/mdc-images/influencer-assets/outfits/`)
- 9 total files
- Various outfit types

### 3. Other Required Assets

#### Character Consistency (`/mdc-images/character-consistency/`)
- `scene-1.webp`
- `scene-2.webp`
- `scene-3.webp`

#### Hands Comparison (`/mdc-images/hands-comparison/`)
- `bad-hands.webp`
- `perfect-hands.webp`

#### Skin Comparison (`/mdc-images/skin-comparison/`)
- `ai-skin.webp`
- `real-skin.webp`

## Docker Build Configuration

The `.dockerignore` file must **NOT** exclude:
- `public/character-assets/` - Required for body customization steps
- `public/mdc-images/influencer-assets/` - Required for ethnicity-based customization
- `public/mdc-images/character-consistency/` - Required for CharacterConsistencyStep
- `public/mdc-images/hands-comparison/` - Required for PerfectHandsStep
- `public/mdc-images/skin-comparison/` - Required for HyperRealisticSkinStep

## Missing Assets Check

To verify all assets are present, run:
```bash
# Check character-assets
find public/character-assets -type f | wc -l

# Check influencer-assets
find public/mdc-images/influencer-assets -type f -name "*.webp" | wc -l

# Check specific categories
find public/mdc-images/influencer-assets/eye-colors -name "*.webp" | wc -l
find public/mdc-images/influencer-assets/hair-colors -name "*.webp" | wc -l
find public/mdc-images/influencer-assets/hair-styles -name "*.webp" | wc -l
```

## Notes

- All ethnicity-specific assets use the path pattern: `/mdc-images/influencer-assets/{category}/{ethnicity}/{value}.webp`
- The `getInfluencerImage()` helper function in `utils/helpers/getInfluencerImage.ts` handles dynamic path generation
- Empty `src` values in constants files indicate the asset is loaded dynamically based on ethnicity selection

