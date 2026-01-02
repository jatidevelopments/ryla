# Platform Aspect Ratio Mapping

## Overview

This document defines the platform-specific aspect ratio mapping system that enables direct export to social media platforms.

## Platform Definitions

### Supported Platforms

| Platform | ID | Icon | Primary Formats | Export Support |
|----------|-----|------|------------------|----------------|
| Instagram | `instagram` | `/logos/platforms/instagram.svg` | 1:1, 4:5, 9:16 | Feed, Stories, Reels |
| TikTok | `tiktok` | `/logos/platforms/tiktok.svg` | 9:16 | Videos, Shorts |
| Pinterest | `pinterest` | `/logos/platforms/pinterest.svg` | 2:3, 1:1 | Pins |
| OnlyFans | `onlyfans` | `/logos/platforms/onlyfans.svg` | 2:3, 1:1, 9:16 | Posts |
| Fanvue | `fanvue` | `/logos/platforms/fanvue.svg` | 2:3, 1:1, 9:16 | Posts |
| Twitter/X | `twitter` | `/logos/platforms/twitter.svg` | 16:9, 1:1 | Tweets |
| YouTube | `youtube` | `/logos/platforms/youtube.svg` | 16:9, 9:16 | Shorts, Videos |
| Facebook | `facebook` | `/logos/platforms/facebook.svg` | 1:1, 16:9 | Posts, Stories |

## Aspect Ratio to Platform Mapping

### 1:1 (Square)
- **Platforms**: Instagram Feed, Pinterest, OnlyFans, Fanvue, Twitter, Facebook
- **Use Cases**: Profile pictures, feed posts, square content
- **Dimensions**: 1024×1024 (default)

### 4:5 (Portrait)
- **Platforms**: Instagram Feed
- **Use Cases**: Instagram portrait posts
- **Dimensions**: 1024×1280 (default)

### 9:16 (Vertical)
- **Platforms**: TikTok, Instagram Stories/Reels, YouTube Shorts, OnlyFans, Fanvue
- **Use Cases**: Stories, vertical videos, mobile-first content
- **Dimensions**: 768×1365 (default)

### 2:3 (Portrait)
- **Platforms**: Pinterest, OnlyFans, Fanvue
- **Use Cases**: Pinterest pins, portrait content
- **Dimensions**: 819×1228 (default)

### 16:9 (Landscape)
- **Platforms**: YouTube, Twitter, Facebook
- **Use Cases**: Video thumbnails, landscape content
- **Dimensions**: 1920×1080 (default)

### 3:4 (Portrait)
- **Platforms**: Instagram Feed (alternative)
- **Use Cases**: Portrait Instagram posts
- **Dimensions**: 1024×1365 (default)

### 4:3 (Landscape)
- **Platforms**: Facebook, general use
- **Use Cases**: Landscape content
- **Dimensions**: 1365×1024 (default)

### 3:2 (Landscape)
- **Platforms**: General use
- **Use Cases**: Photography-style landscape
- **Dimensions**: 1228×819 (default)

## Implementation Structure

### 1. Platform Constants (`libs/shared/src/constants/platforms.ts`)

```typescript
export type PlatformId = 
  | 'instagram' 
  | 'tiktok' 
  | 'pinterest' 
  | 'onlyfans' 
  | 'fanvue' 
  | 'twitter' 
  | 'youtube' 
  | 'facebook';

export interface Platform {
  id: PlatformId;
  name: string;
  icon: string; // Path to SVG
  color: string; // Gradient or color
  supportedFormats: AspectRatio[];
  exportEnabled: boolean;
  exportUrl?: string; // Deep link or API endpoint
}

export const PLATFORMS: Record<PlatformId, Platform> = {
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    icon: '/logos/platforms/instagram.svg',
    color: 'from-purple-500 via-pink-500 to-orange-400',
    supportedFormats: ['1:1', '4:5', '9:16'],
    exportEnabled: true,
  },
  // ... other platforms
};
```

### 2. Enhanced Aspect Ratio Options (`libs/shared/src/constants/character/generation-options.ts`)

```typescript
export interface AspectRatioOption {
  label: string;
  value: string;
  width: number;
  height: number;
  useCase: string; // Legacy, kept for backward compatibility
  platforms: PlatformId[]; // NEW: Array of supported platforms
  primaryPlatform?: PlatformId; // NEW: Main platform for this format
}

export const ASPECT_RATIO_OPTIONS: AspectRatioOption[] = [
  {
    label: '1:1',
    value: '1:1',
    width: 1024,
    height: 1024,
    useCase: 'Instagram feed, profile pics',
    platforms: ['instagram', 'pinterest', 'onlyfans', 'fanvue', 'twitter', 'facebook'],
    primaryPlatform: 'instagram',
  },
  {
    label: '9:16',
    value: '9:16',
    width: 768,
    height: 1365,
    useCase: 'Stories, TikTok, Reels',
    platforms: ['tiktok', 'instagram', 'youtube', 'onlyfans', 'fanvue'],
    primaryPlatform: 'tiktok',
  },
  // ... other ratios
];
```

### 3. Platform Badge Component (`libs/ui/src/components/platform-badge.tsx`)

```typescript
export interface PlatformBadgeProps {
  platformId: PlatformId;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function PlatformBadge({ 
  platformId, 
  size = 'md',
  showLabel = false,
  className 
}: PlatformBadgeProps) {
  const platform = PLATFORMS[platformId];
  // Render platform icon with optional label
}
```

### 4. Aspect Ratio Selector Enhancement

Update the aspect ratio selector UI to show platform badges:

```typescript
// In aspect ratio selector component
{ratio.platforms.map(platformId => (
  <PlatformBadge 
    key={platformId}
    platformId={platformId}
    size="sm"
  />
))}
```

### 5. Export Functionality

```typescript
// libs/shared/src/utils/platform-export.ts

export interface ExportOptions {
  imageUrl: string;
  caption?: string;
  platformId: PlatformId;
  aspectRatio: AspectRatio;
}

export async function exportToPlatform(options: ExportOptions): Promise<void> {
  const platform = PLATFORMS[options.platformId];
  
  // Validate aspect ratio is supported
  if (!platform.supportedFormats.includes(options.aspectRatio)) {
    throw new Error(`Aspect ratio ${options.aspectRatio} not supported for ${platform.name}`);
  }
  
  // Download image with platform-optimized settings
  const image = await downloadImage(options.imageUrl);
  
  // Resize if needed (platform-specific dimensions)
  const optimizedImage = await optimizeForPlatform(image, options.platformId, options.aspectRatio);
  
  // Copy caption to clipboard if provided
  if (options.caption) {
    await navigator.clipboard.writeText(options.caption);
  }
  
  // Trigger download or open platform (if deep link available)
  if (platform.exportUrl) {
    // Open platform with pre-filled content
    window.open(platform.exportUrl);
  } else {
    // Download optimized image
    downloadFile(optimizedImage, `ryla-${platform.id}-${Date.now()}.png`);
  }
}
```

## UI/UX Flow

### Aspect Ratio Selection
1. User selects aspect ratio
2. Platform badges appear showing compatible platforms
3. Hover shows platform names
4. Click badge to see export options

### Export Flow
1. User clicks export button on generated image
2. Modal shows:
   - Compatible platforms for current aspect ratio
   - Platform icons with checkboxes
   - "Export to [Platform]" buttons
3. User selects platform(s)
4. System:
   - Optimizes image for selected platform(s)
   - Downloads image(s)
   - Copies caption to clipboard
   - Shows success message with platform-specific tips

## Migration Plan

### Phase 1: Data Structure (No Breaking Changes)
- Add `platforms` array to `AspectRatioOption`
- Keep `useCase` for backward compatibility
- Create platform constants file

### Phase 2: UI Enhancement
- Add platform badges to aspect ratio selector
- Update export modal to show platform options
- Add platform icons to export buttons

### Phase 3: Export Functionality
- Implement platform-specific optimization
- Add deep linking where available
- Add export analytics tracking

## Files to Create/Modify

### New Files
- `libs/shared/src/constants/platforms.ts` - Platform definitions
- `libs/ui/src/components/platform-badge.tsx` - Platform badge component
- `libs/shared/src/utils/platform-export.ts` - Export utilities

### Modified Files
- `libs/shared/src/constants/character/generation-options.ts` - Add platforms array
- `apps/web/components/studio/generation/types.ts` - Add platforms to ASPECT_RATIOS
- `apps/web/components/post-card.tsx` - Add platform export buttons
- `apps/web/components/image-gallery.tsx` - Add platform export in lightbox

## Example Usage

```typescript
// Get platforms for an aspect ratio
const ratio = ASPECT_RATIO_OPTIONS.find(r => r.value === '9:16');
// ratio.platforms = ['tiktok', 'instagram', 'youtube', 'onlyfans', 'fanvue']

// Export to platform
await exportToPlatform({
  imageUrl: 'https://...',
  caption: 'Check out my new post!',
  platformId: 'instagram',
  aspectRatio: '9:16',
});
```

## Future Enhancements

1. **Auto-resize**: Automatically resize images to platform-optimal dimensions
2. **Batch Export**: Export same image to multiple platforms at once
3. **Scheduling**: Schedule posts to platforms via API (Phase 2)
4. **Analytics**: Track which platforms users export to most
5. **Platform-specific presets**: Pre-configured settings per platform (hashtags, captions, etc.)

